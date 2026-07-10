package com.interview.service;

import com.interview.model.Resume;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for generating styled PDF reports using PDFBox 3.x
 */
@Slf4j
@Service
public class PdfReportService {

    // Helper context class to carry document state across page breaks
    private static class DocumentContext {
        final PDDocument document;
        PDPage currentPage;
        PDPageContentStream currentStream;
        float currentY;
        final float margin = 50;
        final float pageWidth;
        final float pageHeight;
        final float printableWidth;
        
        DocumentContext(PDDocument document) throws IOException {
            this.document = document;
            this.currentPage = new PDPage(PDRectangle.A4);
            this.document.addPage(this.currentPage);
            
            this.pageWidth = currentPage.getMediaBox().getWidth();
            this.pageHeight = currentPage.getMediaBox().getHeight();
            this.printableWidth = pageWidth - (2 * margin);
            this.currentY = pageHeight - margin;
            
            this.currentStream = new PDPageContentStream(document, currentPage);
        }
        
        void checkNewPage(float requiredHeight) throws IOException {
            // If the content would exceed bottom margin (50), start a new page
            if (currentY - requiredHeight < 50) {
                currentStream.close();
                
                currentPage = new PDPage(PDRectangle.A4);
                document.addPage(currentPage);
                
                currentStream = new PDPageContentStream(document, currentPage);
                currentY = pageHeight - margin;
                
                log.debug("Added a new page due to height requirement: {}", requiredHeight);
            }
        }
        
        void close() throws IOException {
            if (currentStream != null) {
                currentStream.close();
            }
        }

        void setNonStrokingColor(int r, int g, int b) throws IOException {
            currentStream.setNonStrokingColor(r / 255f, g / 255f, b / 255f);
        }

        void setStrokingColor(int r, int g, int b) throws IOException {
            currentStream.setStrokingColor(r / 255f, g / 255f, b / 255f);
        }
    }

    public byte[] generateResumeReport(Resume resume) throws IOException {
        log.info("Generating PDF report for resume: {}", resume.getId());
        
        try (PDDocument document = new PDDocument()) {
            DocumentContext context = new DocumentContext(document);
            
            PDType1Font titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font headerFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font bodyFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bodyBoldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            
            // 1. Draw Title Header Block
            context.checkNewPage(80);
            context.setNonStrokingColor(30, 41, 59); // Slate 800
            context.currentStream.addRect(context.margin, context.currentY - 60, context.printableWidth, 60);
            context.currentStream.fill();
            
            context.currentStream.beginText();
            context.currentStream.setFont(titleFont, 18);
            context.setNonStrokingColor(255, 255, 255); // White
            context.currentStream.newLineAtOffset(context.margin + 20, context.currentY - 38);
            context.currentStream.showText("RESUME ATS ANALYSIS REPORT");
            context.currentStream.endText();
            context.currentY -= 80;
            
            // 2. Draw Candidate Details & ATS Score
            context.checkNewPage(120);
            
            // Background card for candidate details
            context.setNonStrokingColor(248, 250, 252); // Slate 50
            context.currentStream.addRect(context.margin, context.currentY - 90, context.printableWidth, 90);
            context.currentStream.fill();
            
            // Border line for card
            context.setNonStrokingColor(203, 213, 225); // Slate 300
            context.currentStream.addRect(context.margin, context.currentY - 90, 5, 90);
            context.currentStream.fill();
            
            // Draw details text
            context.currentStream.beginText();
            context.currentStream.setFont(bodyBoldFont, 12);
            context.setNonStrokingColor(51, 65, 85); // Slate 700
            context.currentStream.newLineAtOffset(context.margin + 20, context.currentY - 25);
            context.currentStream.showText("Candidate Details");
            
            context.currentStream.setFont(bodyFont, 10);
            context.setNonStrokingColor(71, 85, 105);
            
            String name = resume.getParsedData() != null ? resume.getParsedData().getName() : "Not Found";
            String email = resume.getParsedData() != null ? resume.getParsedData().getEmail() : "Not Found";
            String phone = resume.getParsedData() != null ? resume.getParsedData().getPhone() : "Not Found";
            
            context.currentStream.newLineAtOffset(0, -18);
            context.currentStream.showText("Name: " + name);
            context.currentStream.newLineAtOffset(0, -15);
            context.currentStream.showText("Email: " + email);
            context.currentStream.newLineAtOffset(0, -15);
            context.currentStream.showText("Phone: " + phone);
            context.currentStream.endText();
            
            // ATS Score Badge (Inside candidate card box on the right)
            int score = (resume.getAnalysis() != null && resume.getAnalysis().getAtsScore() != null) 
                    ? resume.getAnalysis().getAtsScore() : 70;
            
            float scoreCardX = context.margin + 300;
            float scoreCardY = context.currentY - 15;
            
            // Score circle background container
            context.setNonStrokingColor(241, 245, 249); // Slate 100
            context.currentStream.addRect(scoreCardX, scoreCardY - 60, 160, 60);
            context.currentStream.fill();
            
            // Side line depending on score color
            if (score >= 80) {
                context.setNonStrokingColor(34, 197, 94); // Green
            } else if (score >= 60) {
                context.setNonStrokingColor(234, 179, 8); // Yellow
            } else {
                context.setNonStrokingColor(239, 68, 68); // Red
            }
            context.currentStream.addRect(scoreCardX, scoreCardY - 60, 8, 60);
            context.currentStream.fill();
            
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 9);
            context.setNonStrokingColor(100, 116, 139); // Slate 500
            context.currentStream.newLineAtOffset(scoreCardX + 20, scoreCardY - 20);
            context.currentStream.showText("OVERALL ATS SCORE");
            
            context.currentStream.setFont(titleFont, 24);
            if (score >= 80) {
                context.setNonStrokingColor(22, 163, 74);
            } else if (score >= 60) {
                context.setNonStrokingColor(202, 138, 4);
            } else {
                context.setNonStrokingColor(220, 38, 38);
            }
            context.currentStream.newLineAtOffset(0, -25);
            context.currentStream.showText(score + "%");
            context.currentStream.endText();
            
            context.currentY -= 110;
            
            // 3. Feedback Summary
            context.checkNewPage(100);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(30, 41, 59); // Slate 800
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Feedback Summary");
            context.currentStream.endText();
            context.currentY -= 18;
            
            String summary = resume.getAnalysis() != null ? resume.getAnalysis().getFeedbackSummary() : "No summary available.";
            context.currentY = drawWrappedText(context, summary, context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            context.currentY -= 15;
            
            // 4. Key Strengths
            context.checkNewPage(80);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(22, 163, 74); // Green
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Key Strengths");
            context.currentStream.endText();
            context.currentY -= 16;
            
            List<String> strengths = (resume.getAnalysis() != null && resume.getAnalysis().getStrengths() != null) 
                    ? resume.getAnalysis().getStrengths() : List.of("Readable text structure");
            for (String strength : strengths) {
                context.checkNewPage(30);
                context.currentY = drawWrappedText(context, "• " + strength, context.margin + 10, context.currentY, context.printableWidth - 10, bodyFont, 10, 14);
            }
            context.currentY -= 15;
            
            // 5. Areas of Improvement
            context.checkNewPage(80);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(220, 38, 38); // Red
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Areas of Improvement");
            context.currentStream.endText();
            context.currentY -= 16;
            
            List<String> improvements = (resume.getAnalysis() != null && resume.getAnalysis().getImprovements() != null) 
                    ? resume.getAnalysis().getImprovements() : List.of("Add more quantifiable achievements");
            for (String improvement : improvements) {
                context.checkNewPage(30);
                context.currentY = drawWrappedText(context, "• " + improvement, context.margin + 10, context.currentY, context.printableWidth - 10, bodyFont, 10, 14);
            }
            context.currentY -= 15;
            
            // 6. Recommended Skills
            context.checkNewPage(80);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(37, 99, 235); // Blue
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Recommended Skills to Add");
            context.currentStream.endText();
            context.currentY -= 16;
            
            List<String> skills = (resume.getAnalysis() != null && resume.getAnalysis().getRecommendedSkills() != null) 
                    ? resume.getAnalysis().getRecommendedSkills() : new ArrayList<>();
            if (skills.isEmpty()) {
                context.currentY = drawWrappedText(context, "No additional skills are recommended at this time.", context.margin + 10, context.currentY, context.printableWidth - 10, bodyFont, 10, 14);
            } else {
                String skillsStr = String.join(", ", skills);
                context.currentY = drawWrappedText(context, skillsStr, context.margin + 10, context.currentY, context.printableWidth - 10, bodyFont, 10, 14);
            }
            
            // Add a footer line on the current active page
            context.setNonStrokingColor(148, 163, 184); // Slate 400
            context.currentStream.setLineWidth(0.5f);
            context.setStrokingColor(226, 232, 240); // Slate 200
            context.currentStream.moveTo(context.margin, 60);
            context.currentStream.lineTo(context.margin + context.printableWidth, 60);
            context.currentStream.stroke();
            
            context.currentStream.beginText();
            context.currentStream.setFont(bodyFont, 8);
            context.currentStream.newLineAtOffset(context.margin, 45);
            context.currentStream.showText("Report generated automatically by AI Prep Platform. Evaluated using Llama 3.3.");
            context.currentStream.endText();
            
            // Close context streams
            context.close();
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    public byte[] generateJdMatchReport(Resume resume, String jobDescription, Map<String, Object> matchResult) throws IOException {
        log.info("Generating Job Match PDF report for resume: {}", resume.getId());
        
        try (PDDocument document = new PDDocument()) {
            DocumentContext context = new DocumentContext(document);
            
            PDType1Font titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font headerFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font bodyFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bodyBoldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            
            // 1. Draw Title Header Block
            context.checkNewPage(80);
            context.setNonStrokingColor(30, 41, 59); // Slate 800
            context.currentStream.addRect(context.margin, context.currentY - 60, context.printableWidth, 60);
            context.currentStream.fill();
            
            context.currentStream.beginText();
            context.currentStream.setFont(titleFont, 18);
            context.setNonStrokingColor(255, 255, 255); // White
            context.currentStream.newLineAtOffset(context.margin + 20, context.currentY - 38);
            context.currentStream.showText("RESUME & JOB ALIGNMENT REPORT");
            context.currentStream.endText();
            context.currentY -= 80;
            
            // 2. Draw Candidate Details & Match Score
            context.checkNewPage(120);
            
            // Background card for candidate details
            context.setNonStrokingColor(248, 250, 252); // Slate 50
            context.currentStream.addRect(context.margin, context.currentY - 90, context.printableWidth, 90);
            context.currentStream.fill();
            
            // Border line for card
            context.setNonStrokingColor(99, 102, 241); // Indigo 500
            context.currentStream.addRect(context.margin, context.currentY - 90, 5, 90);
            context.currentStream.fill();
            
            // Draw details text
            context.currentStream.beginText();
            context.currentStream.setFont(bodyBoldFont, 12);
            context.setNonStrokingColor(51, 65, 85); // Slate 700
            context.currentStream.newLineAtOffset(context.margin + 20, context.currentY - 25);
            context.currentStream.showText("Candidate Details");
            
            context.currentStream.setFont(bodyFont, 10);
            context.setNonStrokingColor(71, 85, 105);
            
            String name = resume.getParsedData() != null ? resume.getParsedData().getName() : "Not Found";
            String email = resume.getParsedData() != null ? resume.getParsedData().getEmail() : "Not Found";
            
            context.currentStream.newLineAtOffset(0, -18);
            context.currentStream.showText("Name: " + name);
            context.currentStream.newLineAtOffset(0, -15);
            context.currentStream.showText("Email: " + email);
            context.currentStream.newLineAtOffset(0, -15);
            context.currentStream.showText("Resume File: " + resume.getFileName());
            context.currentStream.endText();
            
            // Match Score Box
            int score = (matchResult.get("matchScore") != null) ? (Integer) matchResult.get("matchScore") : 50;
            
            float scoreCardX = context.margin + 300;
            float scoreCardY = context.currentY - 15;
            
            context.setNonStrokingColor(241, 245, 249); // Slate 100
            context.currentStream.addRect(scoreCardX, scoreCardY - 60, 160, 60);
            context.currentStream.fill();
            
            if (score >= 80) {
                context.setNonStrokingColor(34, 197, 94); // Green
            } else if (score >= 60) {
                context.setNonStrokingColor(234, 179, 8); // Yellow
            } else {
                context.setNonStrokingColor(239, 68, 68); // Red
            }
            context.currentStream.addRect(scoreCardX, scoreCardY - 60, 8, 60);
            context.currentStream.fill();
            
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 9);
            context.setNonStrokingColor(100, 116, 139);
            context.currentStream.newLineAtOffset(scoreCardX + 20, scoreCardY - 20);
            context.currentStream.showText("JOB COMPATIBILITY");
            
            context.currentStream.setFont(titleFont, 24);
            if (score >= 80) {
                context.setNonStrokingColor(22, 163, 74);
            } else if (score >= 60) {
                context.setNonStrokingColor(202, 138, 4);
            } else {
                context.setNonStrokingColor(220, 38, 38);
            }
            context.currentStream.newLineAtOffset(0, -25);
            context.currentStream.showText(score + "%");
            context.currentStream.endText();
            
            context.currentY -= 110;
            
            // 3. Fit Analysis
            context.checkNewPage(100);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(30, 41, 59);
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Fit Analysis");
            context.currentStream.endText();
            context.currentY -= 18;
            
            String fitAnalysis = (String) matchResult.get("fitAnalysis");
            if (fitAnalysis == null) fitAnalysis = "No fit analysis details available.";
            context.currentY = drawWrappedText(context, fitAnalysis, context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            context.currentY -= 15;
            
            // 4. Matched Keywords
            context.checkNewPage(100);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(22, 163, 74); // Green
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Matched Keywords / Skills");
            context.currentStream.endText();
            context.currentY -= 18;
            
            List<String> matched = (List<String>) matchResult.get("matchedKeywords");
            if (matched == null || matched.isEmpty()) {
                context.currentY = drawWrappedText(context, "No direct matching keywords identified.", context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            } else {
                String matchedStr = String.join(", ", matched);
                context.currentY = drawWrappedText(context, matchedStr, context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            }
            context.currentY -= 15;
            
            // 5. Missing Keywords
            context.checkNewPage(100);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(220, 38, 38); // Red
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Missing / Weak Keywords");
            context.currentStream.endText();
            context.currentY -= 18;
            
            List<String> missing = (List<String>) matchResult.get("missingKeywords");
            if (missing == null || missing.isEmpty()) {
                context.currentY = drawWrappedText(context, "No core missing keywords identified.", context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            } else {
                String missingStr = String.join(", ", missing);
                context.currentY = drawWrappedText(context, missingStr, context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            }
            context.currentY -= 15;
            
            // 6. Tailoring Recommendations
            context.checkNewPage(100);
            context.currentStream.beginText();
            context.currentStream.setFont(headerFont, 12);
            context.setNonStrokingColor(37, 99, 235); // Blue
            context.currentStream.newLineAtOffset(context.margin, context.currentY);
            context.currentStream.showText("Tailoring Recommendations");
            context.currentStream.endText();
            context.currentY -= 18;
            
            List<String> recs = (List<String>) matchResult.get("recommendations");
            if (recs == null || recs.isEmpty()) {
                context.currentY = drawWrappedText(context, "No recommendations available.", context.margin, context.currentY, context.printableWidth, bodyFont, 10, 14);
            } else {
                for (String rec : recs) {
                    context.checkNewPage(30);
                    context.currentY = drawWrappedText(context, "• " + rec, context.margin + 10, context.currentY, context.printableWidth - 10, bodyFont, 10, 14);
                }
            }
            
            // Footer
            context.setNonStrokingColor(148, 163, 184); // Slate 400
            context.currentStream.setLineWidth(0.5f);
            context.setStrokingColor(226, 232, 240); // Slate 200
            context.currentStream.moveTo(context.margin, 60);
            context.currentStream.lineTo(context.margin + context.printableWidth, 60);
            context.currentStream.stroke();
            
            context.currentStream.beginText();
            context.currentStream.setFont(bodyFont, 8);
            context.currentStream.newLineAtOffset(context.margin, 45);
            context.currentStream.showText("Report generated automatically by AI Prep Platform. Matches calculated with Groq AI.");
            context.currentStream.endText();
            
            context.close();
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }
    
    private float drawWrappedText(DocumentContext context, String text, float x, float y, float width, 
                                  PDType1Font font, float fontSize, float leading) throws IOException {
        context.currentStream.setFont(font, fontSize);
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        
        for (String word : words) {
            String testLine = line.length() == 0 ? word : line + " " + word;
            float lineWidth = fontSize * font.getStringWidth(testLine) / 1000f;
            if (lineWidth > width) {
                // Check if page needs to be swapped
                context.checkNewPage(leading + 10);
                if (context.currentY == context.pageHeight - context.margin) {
                    // Reset y since a new page was added
                    y = context.currentY;
                }
                
                context.currentStream.beginText();
                context.currentStream.setFont(font, fontSize);
                context.currentStream.newLineAtOffset(x, y);
                context.currentStream.showText(line.toString());
                context.currentStream.endText();
                
                y -= leading;
                context.currentY = y;
                line = new StringBuilder(word);
            } else {
                line.append(line.length() == 0 ? "" : " ").append(word);
            }
        }
        
        if (line.length() > 0) {
            context.checkNewPage(leading + 10);
            if (context.currentY == context.pageHeight - context.margin) {
                y = context.currentY;
            }
            
            context.currentStream.beginText();
            context.currentStream.setFont(font, fontSize);
            context.currentStream.newLineAtOffset(x, y);
            context.currentStream.showText(line.toString());
            context.currentStream.endText();
            
            y -= leading;
            context.currentY = y;
        }
        
        return y;
    }
}
