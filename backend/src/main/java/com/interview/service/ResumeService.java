package com.interview.service;

import com.interview.dto.ResumeDTO;
import com.interview.exception.BadRequestException;
import com.interview.exception.ResourceNotFoundException;
import com.interview.model.Notification;
import com.interview.model.Resume;
import com.interview.repository.ResumeRepository;
import com.interview.util.ModelMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for resume operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final FileStorageService fileStorageService;
    private final CloudinaryService cloudinaryService;
    private final GroqAIService groqAIService;
    private final PdfReportService pdfReportService;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;

    private static final Set<String> PROGRAMMING_SKILLS = Set.of(
            "java", "python", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust", "kotlin",
            "spring", "spring boot", "react", "angular", "vue", "node.js", "express", "django", "flask",
            "mongodb", "mysql", "postgresql", "redis", "elasticsearch", "aws", "azure", "docker", "kubernetes",
            "git", "jenkins", "ci/cd", "agile", "scrum", "rest api", "graphql", "microservices",
            "html", "css", "sass", "webpack", "junit", "mockito", "selenium", "jira"
    );

    @Transactional
    public ResumeDTO uploadResume(String userId, MultipartFile file) {
        log.info("Uploading resume for user: {}", userId);

        validateFile(file);

        try {
            // Extract text from resume
            String extractedText = extractText(file);

            // Upload using Cloudinary if configured; fallback to local storage
            String fileUrl;
            String filePath; // Stores public ID if Cloudinary is used, local path otherwise
            String cloudinaryPublicId = null;

            if (cloudinaryService.isConfigured()) {
                try {
                    Map uploadResult = cloudinaryService.uploadFile(file, "resumes");
                    fileUrl = (String) uploadResult.get("secure_url");
                    cloudinaryPublicId = (String) uploadResult.get("public_id");
                    filePath = cloudinaryPublicId;
                    log.info("Resume uploaded to Cloudinary. Public ID: {}", cloudinaryPublicId);
                } catch (Exception e) {
                    log.error("Cloudinary upload failed, falling back to local file storage", e);
                    filePath = fileStorageService.storeFile(file, "resumes");
                    String fileName = extractFileName(filePath);
                    fileUrl = "/api/v1/files/resumes/" + fileName;
                }
            } else {
                log.warn("Cloudinary not configured. Storing resume locally.");
                filePath = fileStorageService.storeFile(file, "resumes");
                String fileName = extractFileName(filePath);
                fileUrl = "/api/v1/files/resumes/" + fileName;
            }

            // Parse skills
            List<String> parsedSkills = parseSkills(extractedText);

            // Parse additional data
            Resume.ParsedResumeData parsedData = parseResumeData(extractedText);

            // Run AI ATS Score and Analysis
            Resume.ResumeAnalysis analysis = groqAIService.analyzeResume(extractedText);

            // Save resume metadata
            Resume resume = Resume.builder()
                    .userId(userId)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileUrl(fileUrl)
                    .filePath(filePath)
                    .cloudinaryPublicId(cloudinaryPublicId)
                    .extractedText(extractedText)
                    .parsedSkills(parsedSkills)
                    .parsedData(parsedData)
                    .analysis(analysis)
                    .build();

            resume = resumeRepository.save(resume);
            log.info("Resume uploaded successfully with ID: {}", resume.getId());

            // Create notification
            notificationService.createNotification(
                    userId,
                    Notification.NotificationType.RESUME_UPLOADED,
                    "Resume Uploaded",
                    "Your resume has been uploaded and processed successfully"
            );

            return modelMapper.toResumeDTO(resume);

        } catch (IOException e) {
            log.error("Error processing resume", e);
            throw new BadRequestException("Failed to process resume: " + e.getMessage());
        }
    }

    public List<ResumeDTO> getUserResumes(String userId) {
        log.info("Getting resumes for user: {}", userId);
        
        return resumeRepository.findByUserId(userId).stream()
                .map(modelMapper::toResumeDTO)
                .toList();
    }

    public ResumeDTO getLatestResume(String userId) {
        log.info("Getting latest resume for user: {}", userId);
        
        Resume resume = resumeRepository.findFirstByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No resume found for user"));

        return modelMapper.toResumeDTO(resume);
    }

    @Transactional
    public void deleteResume(String userId, String resumeId) {
        log.info("Deleting resume: {}", resumeId);
        
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to resume");
        }

        // Delete file from storage
        if (resume.getCloudinaryPublicId() != null) {
            cloudinaryService.deleteFile(resume.getCloudinaryPublicId());
        } else {
            fileStorageService.deleteFile(resume.getFilePath());
        }

        // Delete from database
        resumeRepository.delete(resume);
        log.info("Resume deleted successfully");
    }

    /**
     * Generate PDF report bytes for the resume's ATS score and analysis
     */
    public byte[] generateResumeReportPdf(String userId, String resumeId) {
        log.info("Retrieving resume report for id: {}", resumeId);
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to resume report");
        }

        // If for some reason analysis hasn't run yet, run it now and save
        if (resume.getAnalysis() == null) {
            log.info("Analysis details missing, generating now...");
            Resume.ResumeAnalysis analysis = groqAIService.analyzeResume(resume.getExtractedText());
            resume.setAnalysis(analysis);
            resumeRepository.save(resume);
        }

        try {
            return pdfReportService.generateResumeReport(resume);
        } catch (IOException e) {
            log.error("Failed to generate PDF report", e);
            throw new BadRequestException("Failed to generate PDF report: " + e.getMessage());
        }
    }

    /**
     * Compare a resume against a specific Job Description using AI
     */
    public Map<String, Object> matchResumeWithJD(String userId, String resumeId, String jobDescription) {
        log.info("Matching resume {} with target Job Description", resumeId);
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to resume");
        }

        return groqAIService.matchResumeWithJD(resume.getExtractedText(), jobDescription);
    }

    /**
     * Compare a resume against a specific Job Description and compile the analysis report PDF
     */
    public byte[] generateJdMatchReportPdf(String userId, String resumeId, String jobDescription) {
        log.info("Generating Job Match PDF report for resume: {}", resumeId);
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        if (!resume.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to resume");
        }

        // 1. Run AI match comparison
        Map<String, Object> matchResult = groqAIService.matchResumeWithJD(resume.getExtractedText(), jobDescription);

        // 2. Generate PDF report bytes
        try {
            return pdfReportService.generateJdMatchReport(resume, jobDescription, matchResult);
        } catch (IOException e) {
            log.error("Failed to generate JD match PDF report", e);
            throw new BadRequestException("Failed to generate PDF report: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") &&
                !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new BadRequestException("Only PDF and DOCX files are allowed");
        }

        // Check file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }
    }

    private String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        
        if ("application/pdf".equals(contentType)) {
            return extractTextFromPDF(file.getInputStream());
        } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
            return extractTextFromDOCX(file.getInputStream());
        }
        
        throw new BadRequestException("Unsupported file type");
    }

    private String extractTextFromPDF(InputStream inputStream) throws IOException {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromDOCX(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            StringBuilder text = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                text.append(paragraph.getText()).append("\n");
            }
            return text.toString();
        }
    }

    private List<String> parseSkills(String text) {
        Set<String> foundSkills = new HashSet<>();
        String lowerText = text.toLowerCase();

        for (String skill : PROGRAMMING_SKILLS) {
            if (lowerText.contains(skill.toLowerCase())) {
                foundSkills.add(skill);
            }
        }

        return new ArrayList<>(foundSkills);
    }

    private Resume.ParsedResumeData parseResumeData(String text) {
        return Resume.ParsedResumeData.builder()
                .name(extractName(text))
                .email(extractEmail(text))
                .phone(extractPhone(text))
                .education(extractSection(text, "education"))
                .experience(extractSection(text, "experience"))
                .certifications(extractSection(text, "certification"))
                .build();
    }

    private String extractName(String text) {
        // Simple extraction - first non-empty line
        String[] lines = text.split("\\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() < 50) {
                return line;
            }
        }
        return "Not found";
    }

    private String extractEmail(String text) {
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "Not found";
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile("\\+?\\d[\\d\\s-]{8,}\\d");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "Not found";
    }

    private List<String> extractSection(String text, String sectionName) {
        List<String> items = new ArrayList<>();
        String lowerText = text.toLowerCase();
        
        int startIndex = lowerText.indexOf(sectionName);
        if (startIndex == -1) {
            return items;
        }

        // Find next section or end of text
        String[] commonSections = {"education", "experience", "skills", "projects", "certification"};
        int endIndex = text.length();
        for (String section : commonSections) {
            if (!section.equals(sectionName)) {
                int sectionIndex = lowerText.indexOf(section, startIndex + sectionName.length());
                if (sectionIndex != -1 && sectionIndex < endIndex) {
                    endIndex = sectionIndex;
                }
            }
        }

        String sectionText = text.substring(startIndex, endIndex);
        String[] lines = sectionText.split("\\n");
        
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && !line.toLowerCase().contains(sectionName)) {
                items.add(line);
            }
        }

        return items;
    }
    
    private String extractFileName(String path) {
        if (path == null) return "";
        String[] parts = path.split("/");
        return parts[parts.length - 1];
    }
}
