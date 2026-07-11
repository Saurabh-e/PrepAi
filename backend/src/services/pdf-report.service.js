const PDFDocument = require('pdfkit');

const generateResumeReport = (resume) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
      
      // 1. Draw Title Header Block
      doc.rect(50, 50, 495, 60).fill('#1E293B'); // Slate 800
      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(18)
         .text('RESUME ATS ANALYSIS REPORT', 70, 72);
      
      // 2. Draw Candidate Details & ATS Score Card
      doc.rect(50, 130, 495, 90).fill('#F8FAFC'); // Slate 50
      doc.rect(50, 130, 5, 90).fill('#CBD5E1'); // Slate 300
      
      const parsedData = resume.parsedData || {};
      const name = parsedData.name || 'Not Found';
      const email = parsedData.email || 'Not Found';
      const phone = parsedData.phone || 'Not Found';
      
      doc.fillColor('#334155')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Candidate Details', 70, 142);
         
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10)
         .text(`Name: ${name}`, 70, 162)
         .text(`Email: ${email}`, 70, 178)
         .text(`Phone: ${phone}`, 70, 194);
         
      // ATS Score Badge
      const analysis = resume.analysis || {};
      const score = analysis.atsScore || 70;
      
      let scoreColor = '#EF4444'; // Red
      if (score >= 80) scoreColor = '#22C55E'; // Green
      else if (score >= 60) scoreColor = '#EAB308'; // Yellow
      
      doc.rect(350, 145, 160, 60).fill('#F1F5F9'); // Slate 100
      doc.rect(350, 145, 8, 60).fill(scoreColor);
      
      doc.fillColor('#64748B')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('OVERALL ATS SCORE', 370, 155);
         
      doc.fillColor(scoreColor)
         .font('Helvetica-Bold')
         .fontSize(24)
         .text(`${score}%`, 370, 172);
         
      // 3. Feedback Summary
      doc.fillColor('#1E293B')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Feedback Summary', 50, 245);
         
      const summary = analysis.feedbackSummary || 'No summary available.';
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10)
         .text(summary, 50, 265, { width: 495, lineGap: 4 });
         
      doc.moveDown(1.5);
      
      // 4. Key Strengths
      doc.fillColor('#16A34A') // Green
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Key Strengths');
         
      doc.moveDown(0.5);
      
      const strengths = analysis.strengths || ['Readable text structure'];
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10);
      strengths.forEach(strength => {
        doc.text(`• ${strength}`, { width: 495, lineGap: 3 });
      });
      
      doc.moveDown(1.5);
      
      // 5. Areas of Improvement
      doc.fillColor('#DC2626') // Red
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Areas of Improvement');
         
      doc.moveDown(0.5);
      
      const improvements = analysis.improvements || ['Add more quantifiable achievements'];
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10);
      improvements.forEach(imp => {
        doc.text(`• ${imp}`, { width: 495, lineGap: 3 });
      });
      
      doc.moveDown(1.5);
      
      // 6. Recommended Skills
      doc.fillColor('#2563EB') // Blue
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Recommended Skills to Add');
         
      doc.moveDown(0.5);
      
      const skills = analysis.recommendedSkills || [];
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10);
      if (skills.length === 0) {
        doc.text('No additional skills are recommended at this time.');
      } else {
        doc.text(skills.join(', '), { width: 495, lineGap: 3 });
      }
      
      // Footer
      const finalPageY = 750;
      doc.strokeColor('#E2E8F0')
         .lineWidth(0.5)
         .moveTo(50, finalPageY)
         .lineTo(545, finalPageY)
         .stroke();
         
      doc.fillColor('#94A3B8')
         .font('Helvetica')
         .fontSize(8)
         .text('Report generated automatically by AI Prep Platform. Evaluated using Llama 3.3.', 50, finalPageY + 15);
         
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const generateJdMatchReport = (resume, jobDescription, matchResult) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
      
      // 1. Draw Title Header Block
      doc.rect(50, 50, 495, 60).fill('#1E293B'); // Slate 800
      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(18)
         .text('RESUME & JOB ALIGNMENT REPORT', 70, 72);
         
      // 2. Draw Candidate Details & Match Score Card
      doc.rect(50, 130, 495, 90).fill('#F8FAFC'); // Slate 50
      doc.rect(50, 130, 5, 90).fill('#6366F1'); // Indigo 500
      
      const parsedData = resume.parsedData || {};
      const name = parsedData.name || 'Not Found';
      const email = parsedData.email || 'Not Found';
      
      doc.fillColor('#334155')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Candidate Details', 70, 142);
         
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10)
         .text(`Name: ${name}`, 70, 162)
         .text(`Email: ${email}`, 70, 178)
         .text(`Resume File: ${resume.fileName || 'Not Found'}`, 70, 194);
         
      // Match Score Box
      const score = matchResult.matchScore || 50;
      
      let scoreColor = '#EF4444'; // Red
      if (score >= 80) scoreColor = '#22C55E'; // Green
      else if (score >= 60) scoreColor = '#EAB308'; // Yellow
      
      doc.rect(350, 145, 160, 60).fill('#F1F5F9'); // Slate 100
      doc.rect(350, 145, 8, 60).fill(scoreColor);
      
      doc.fillColor('#64748B')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('JOB COMPATIBILITY', 370, 155);
         
      doc.fillColor(scoreColor)
         .font('Helvetica-Bold')
         .fontSize(24)
         .text(`${score}%`, 370, 172);
         
      // 3. Fit Analysis
      doc.fillColor('#1E293B')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Fit Analysis', 50, 245);
         
      const fitAnalysis = matchResult.fitAnalysis || 'No fit analysis details available.';
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10)
         .text(fitAnalysis, 50, 265, { width: 495, lineGap: 4 });
         
      doc.moveDown(1.5);
      
      // 4. Matched Keywords
      doc.fillColor('#16A34A') // Green
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Matched Keywords / Skills');
         
      doc.moveDown(0.5);
      
      const matched = matchResult.matchedKeywords || [];
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10);
      if (matched.length === 0) {
        doc.text('No direct matching keywords identified.');
      } else {
        doc.text(matched.join(', '), { width: 495, lineGap: 3 });
      }
      
      doc.moveDown(1.5);
      
      // 5. Missing Keywords
      doc.fillColor('#DC2626') // Red
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Missing / Weak Keywords');
         
      doc.moveDown(0.5);
      
      const missing = matchResult.missingKeywords || [];
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10);
      if (missing.length === 0) {
        doc.text('No core missing keywords identified.');
      } else {
        doc.text(missing.join(', '), { width: 495, lineGap: 3 });
      }
      
      doc.moveDown(1.5);
      
      // 6. Tailoring Recommendations
      doc.fillColor('#2563EB') // Blue
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Tailoring Recommendations');
         
      doc.moveDown(0.5);
      
      const recs = matchResult.recommendations || [];
      doc.fillColor('#475569')
         .font('Helvetica')
         .fontSize(10);
      if (recs.length === 0) {
        doc.text('No recommendations available.');
      } else {
        recs.forEach(rec => {
          doc.text(`• ${rec}`, { width: 495, lineGap: 3 });
        });
      }
      
      // Footer
      const finalPageY = 750;
      doc.strokeColor('#E2E8F0')
         .lineWidth(0.5)
         .moveTo(50, finalPageY)
         .lineTo(545, finalPageY)
         .stroke();
         
      doc.fillColor('#94A3B8')
         .font('Helvetica')
         .fontSize(8)
         .text('Report generated automatically by AI Prep Platform. Matches calculated with Groq AI.', 50, finalPageY + 15);
         
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateResumeReport,
  generateJdMatchReport
};
