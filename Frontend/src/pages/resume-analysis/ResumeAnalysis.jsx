import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Download,
  Sparkles,
  X,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  Info
} from 'lucide-react';

export const ResumeAnalysis = () => {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ats'); // 'ats', 'match', 'parsed'
  
  // Job Match States
  const [jobDescription, setJobDescription] = useState('');
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [downloadingJdReport, setDownloadingJdReport] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const resumeList = await userService.getUserResumes();
      setResumes(resumeList || []);
      // Auto-select first resume if available and nothing selected
      if (resumeList && resumeList.length > 0 && !selectedResume) {
        setSelectedResume(resumeList[0]);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch resumes', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are allowed', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Resume size exceeds 10MB limit', 'warning');
      return;
    }

    setResumeLoading(true);
    try {
      const uploaded = await userService.uploadResume(file);
      showToast('Resume uploaded and analyzed successfully', 'success');
      
      // reload resumes list
      const resumeList = await userService.getUserResumes();
      setResumes(resumeList || []);
      
      // Find the uploaded resume in the list and select it
      if (uploaded && uploaded.id) {
        const found = resumeList.find(r => r.id === uploaded.id) || uploaded;
        setSelectedResume(found);
      } else if (resumeList.length > 0) {
        setSelectedResume(resumeList[0]);
      }
      setMatchResult(null); // Clear previous match result
      setJobDescription('');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload resume', 'error');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleResumeDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await userService.deleteResume(resumeId);
      showToast('Resume deleted successfully', 'success');
      
      const updatedList = resumes.filter((r) => r.id !== resumeId);
      setResumes(updatedList);
      
      if (selectedResume?.id === resumeId) {
        setSelectedResume(updatedList.length > 0 ? updatedList[0] : null);
        setMatchResult(null);
        setJobDescription('');
      }
    } catch (err) {
      showToast('Failed to delete resume', 'error');
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setMatchResult(null); // Reset JD match data for new resume
    setJobDescription('');
  };

  const handleDownloadReport = async (resumeId, fileName) => {
    setDownloadingReportId(resumeId);
    try {
      const blob = await userService.downloadResumeReport(resumeId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      link.setAttribute('download', `${nameWithoutExt}-ats-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF report downloaded successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to download PDF report', 'error');
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleJdMatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResume) return;
    const cleanJd = jobDescription.trim();
    if (!cleanJd) {
      showToast('Please enter a job description to match', 'warning');
      return;
    }

    setMatchingLoading(true);
    try {
      const result = await userService.matchResumeWithJD(selectedResume.id, cleanJd);
      setMatchResult(result);
      showToast('Compatibility score calculated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to calculate JD match', 'error');
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleDownloadJdReport = async () => {
    if (!selectedResume || !jobDescription.trim()) return;
    setDownloadingJdReport(true);
    try {
      const blob = await userService.downloadJdMatchReport(selectedResume.id, jobDescription.trim());
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const nameWithoutExt = selectedResume.fileName.replace(/\.[^/.]+$/, "");
      link.setAttribute('download', `${nameWithoutExt}-job-match-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Job match PDF downloaded successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to download Job match PDF', 'error');
    } finally {
      setDownloadingJdReport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-text-main">Resume ATS & JD Matcher</h1>
        <p className="text-xs text-text-muted mt-1">
          Perform standard ATS compatibility audits and analyze keyword matching alignment against target job descriptions.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of Resumes */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Upload New Resume" subtitle="PDF files only, max size 10MB">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border-base rounded-2xl py-6 hover:bg-bg-base/30 transition-all cursor-pointer relative">
              {resumeLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-text-muted">Analyzing Resume...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center px-4">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="text-xs font-bold text-text-main">Upload Resume (PDF)</span>
                  <span className="text-[10px] text-text-muted">Max size: 10MB</span>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={resumeLoading}
                className="hidden"
              />
            </label>
          </Card>

          <Card title="Your Resumes" subtitle={`${resumes.length} resume(s) uploaded`}>
            <div className="space-y-3">
              {resumes.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No resumes found. Please upload one above.</p>
              ) : (
                resumes.map((resume) => {
                  const hasAnalysis = resume.analysis && resume.analysis.atsScore !== undefined;
                  const score = hasAnalysis ? resume.analysis.atsScore : null;
                  const isSelected = selectedResume?.id === resume.id;
                  
                  let scoreBadgeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                  if (score >= 80) {
                    scoreBadgeColor = 'text-green-500 bg-green-500/10 border-green-500/20';
                  } else if (score >= 60) {
                    scoreBadgeColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
                  }

                  return (
                    <div
                      key={resume.id}
                      onClick={() => handleSelectResume(resume)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                          : 'border-border-base bg-bg-base/20 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text-main truncate max-w-[120px] md:max-w-[140px]" title={resume.fileName}>
                            {resume.fileName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-text-muted">
                              {new Date(resume.uploadedAt).toLocaleDateString()}
                            </span>
                            {hasAnalysis && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${scoreBadgeColor}`}>
                                ATS: {score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResumeDelete(resume.id);
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition-colors shrink-0"
                        title="Delete Resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed analysis dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedResume ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-border-base bg-bg-card text-center min-h-[400px]">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-10 w-10 text-primary fill-primary/10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-text-main">No Resume Selected</h3>
              <p className="text-xs text-text-muted max-w-sm mt-2 leading-relaxed">
                Upload a resume or select one from the left sidebar list to inspect the ATS evaluation and match it with jobs.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header card details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-border-base bg-bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-text-main truncate max-w-[280px]" title={selectedResume.fileName}>
                      {selectedResume.fileName}
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Analyzed automatically on upload • size: {(selectedResume.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport(selectedResume.id, selectedResume.fileName)}
                    disabled={downloadingReportId === selectedResume.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-base hover:border-primary/30 text-xs font-bold text-text-main bg-bg-base/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {downloadingReportId === selectedResume.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 text-primary" />
                        Download Report PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tabs Menu */}
              <div className="flex border-b border-border-base">
                <button
                  onClick={() => setActiveTab('ats')}
                  className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'ats'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  ATS General Audit
                </button>
                <button
                  onClick={() => setActiveTab('match')}
                  className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'match'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  Job Description Match
                </button>
                <button
                  onClick={() => setActiveTab('parsed')}
                  className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'parsed'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  Extracted Resume Sections
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[400px]">
                {/* TAB 1: ATS General Audit */}
                {activeTab === 'ats' && selectedResume.analysis && (
                  <div className="space-y-6">
                    {/* Circle Score Box */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border border-border-base bg-bg-base/20">
                      <div className="relative h-24 w-24 shrink-0 flex items-center justify-center rounded-full bg-bg-card shadow-md">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-border-base"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - selectedResume.analysis.atsScore / 100)}
                            className={
                              selectedResume.analysis.atsScore >= 80
                                ? 'text-green-500'
                                : selectedResume.analysis.atsScore >= 60
                                ? 'text-yellow-500'
                                : 'text-rose-500'
                            }
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute text-lg font-black text-text-main">
                          {selectedResume.analysis.atsScore}%
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-main">ATS Compatibility Score</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-lg">
                          This score estimates how well parsing software can read and index your resume based on layout structure, sections alignment, and text quality.
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Evaluation Summary</h4>
                      <p className="text-xs text-text-muted leading-relaxed p-4 rounded-xl border border-border-base bg-bg-card">
                        {selectedResume.analysis.feedbackSummary}
                      </p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-green-500">
                          <Sparkles className="h-4 w-4" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider">Key Strengths</h4>
                        </div>
                        <div className="p-4 rounded-xl border border-green-500/10 bg-green-500/5 space-y-2.5">
                          {selectedResume.analysis.strengths && selectedResume.analysis.strengths.map((str, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-text-main leading-relaxed">
                              <span className="text-green-500 font-bold shrink-0">•</span>
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Improvements */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-rose-500">
                          <X className="h-4 w-4" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider">Areas to Fix</h4>
                        </div>
                        <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 space-y-2.5">
                          {selectedResume.analysis.improvements && selectedResume.analysis.improvements.map((imp, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-text-main leading-relaxed">
                              <span className="text-rose-500 font-bold shrink-0">•</span>
                              <span>{imp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Skills */}
                    {selectedResume.analysis.recommendedSkills && selectedResume.analysis.recommendedSkills.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Highly Valued Skills to Consider</h4>
                        <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border-base bg-bg-card">
                          {selectedResume.analysis.recommendedSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary dark:bg-primary/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Job Description Match */}
                {activeTab === 'match' && (
                  <div className="space-y-6">
                    {/* JD Paste Form */}
                    <form onSubmit={handleJdMatchSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">Target Job Description</label>
                        <p className="text-[10px] text-text-muted mb-2">
                          Paste the full description of a specific job role to evaluate how well your resume matches.
                        </p>
                        <textarea
                          placeholder="Paste job details here... (e.g. key technical skills, experience required, frameworks)"
                          rows={6}
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="w-full p-4 text-xs rounded-xl border border-border-base bg-bg-card text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all leading-relaxed"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" variant="primary" loading={matchingLoading} disabled={!jobDescription.trim()}>
                          Analyze Match Alignment
                        </Button>
                      </div>
                    </form>

                    {/* JD Match Result */}
                    {matchingLoading && (
                      <div className="flex flex-col items-center justify-center p-12 border border-border-base bg-bg-card rounded-xl text-center">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-3" />
                        <p className="text-xs text-text-main font-semibold">Running comparison match...</p>
                        <p className="text-[10px] text-text-muted mt-1">AI is scanning keywords and aligning parameters.</p>
                      </div>
                    )}

                    {!matchingLoading && matchResult && (
                      <div className="space-y-6 border-t border-border-base pt-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border border-border-base bg-bg-base/30">
                          {/* Match score visual */}
                          <div className="relative h-24 w-24 shrink-0 flex items-center justify-center rounded-full bg-bg-card shadow-md">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="48"
                                cy="48"
                                r="38"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-border-base"
                                fill="transparent"
                              />
                              <circle
                                cx="48"
                                cy="48"
                                r="38"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 38}
                                strokeDashoffset={2 * Math.PI * 38 * (1 - matchResult.matchScore / 100)}
                                className={
                                  matchResult.matchScore >= 80
                                    ? 'text-green-500'
                                    : matchResult.matchScore >= 60
                                    ? 'text-yellow-500'
                                    : 'text-rose-500'
                                }
                                strokeLinecap="round"
                                fill="transparent"
                              />
                            </svg>
                            <span className="absolute text-lg font-black text-text-main">
                              {matchResult.matchScore}%
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-text-main">Job Compatibility Match</h4>
                            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-lg">
                              {matchResult.fitAnalysis}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleDownloadJdReport}
                            disabled={downloadingJdReport}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all disabled:opacity-55 cursor-pointer shrink-0"
                          >
                            {downloadingJdReport ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                Download Match PDF
                              </>
                            )}
                          </button>
                        </div>

                        {/* Keyword list split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Matched */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="h-4 w-4" />
                              <h5 className="text-xs font-bold uppercase tracking-wider">Matched Keywords</h5>
                            </div>
                            <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-green-500/10 bg-green-500/5">
                              {matchResult.matchedKeywords && matchResult.matchedKeywords.length > 0 ? (
                                matchResult.matchedKeywords.map((word, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                  >
                                    {word}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-text-muted">No keywords matched directly.</span>
                              )}
                            </div>
                          </div>

                          {/* Missing */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-1 text-rose-500">
                              <AlertTriangle className="h-4 w-4" />
                              <h5 className="text-xs font-bold uppercase tracking-wider">Missing/Weak Keywords</h5>
                            </div>
                            <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
                              {matchResult.missingKeywords && matchResult.missingKeywords.length > 0 ? (
                                matchResult.missingKeywords.map((word, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                  >
                                    {word}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-text-muted">No missing core keywords identified!</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tailoring Recommendations */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-text-main uppercase tracking-wider">Tailoring Recommendations</h5>
                          <div className="p-4 rounded-xl border border-border-base bg-bg-card space-y-2.5">
                            {matchResult.recommendations && matchResult.recommendations.map((rec, idx) => (
                              <div key={idx} className="flex gap-2 text-xs text-text-main leading-relaxed">
                                <span className="text-primary font-bold shrink-0">•</span>
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Parsed Info */}
                {activeTab === 'parsed' && (
                  <div className="space-y-6">
                    {/* Candidate Identity */}
                    <Card title="Extracted Information" subtitle="Basic details extracted from PDF structure">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-xl bg-bg-base/30 border border-border-base">
                          <p className="text-[10px] text-text-muted font-bold uppercase">Name</p>
                          <p className="text-xs font-bold text-text-main mt-1">
                            {selectedResume.parsedData?.name || 'Not Found'}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-bg-base/30 border border-border-base">
                          <p className="text-[10px] text-text-muted font-bold uppercase">Email</p>
                          <p className="text-xs font-bold text-text-main mt-1">
                            {selectedResume.parsedData?.email || 'Not Found'}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-bg-base/30 border border-border-base">
                          <p className="text-[10px] text-text-muted font-bold uppercase">Phone</p>
                          <p className="text-xs font-bold text-text-main mt-1">
                            {selectedResume.parsedData?.phone || 'Not Found'}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Education */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-text-main">
                        <GraduationCap className="h-4.5 w-4.5 text-primary" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider">Education Segment</h4>
                      </div>
                      <div className="p-4 rounded-xl border border-border-base bg-bg-card space-y-3">
                        {selectedResume.parsedData?.education && selectedResume.parsedData.education.length > 0 ? (
                          selectedResume.parsedData.education.map((edu, idx) => (
                            <p key={idx} className="text-xs text-text-main leading-relaxed">
                              {edu}
                            </p>
                          ))
                        ) : (
                          <p className="text-xs text-text-muted italic">No parsed education details found.</p>
                        )}
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-text-main">
                        <Briefcase className="h-4.5 w-4.5 text-primary" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider">Experience Segment</h4>
                      </div>
                      <div className="p-4 rounded-xl border border-border-base bg-bg-card space-y-3">
                        {selectedResume.parsedData?.experience && selectedResume.parsedData.experience.length > 0 ? (
                          selectedResume.parsedData.experience.map((exp, idx) => (
                            <p key={idx} className="text-xs text-text-main leading-relaxed">
                              {exp}
                            </p>
                          ))
                        ) : (
                          <p className="text-xs text-text-muted italic">No parsed experience details found.</p>
                        )}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-text-main">
                        <Award className="h-4.5 w-4.5 text-primary" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider">Certifications Segment</h4>
                      </div>
                      <div className="p-4 rounded-xl border border-border-base bg-bg-card space-y-3">
                        {selectedResume.parsedData?.certifications && selectedResume.parsedData.certifications.length > 0 ? (
                          selectedResume.parsedData.certifications.map((cert, idx) => (
                            <p key={idx} className="text-xs text-text-main leading-relaxed">
                              {cert}
                            </p>
                          ))
                        ) : (
                          <p className="text-xs text-text-muted italic">No parsed certification details found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
