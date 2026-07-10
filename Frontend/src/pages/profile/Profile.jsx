import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { API_BASE_URL } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import {
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Plus,
  X,
  Upload,
  FileText,
  Trash2,
  Lock,
  RefreshCw,
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';

export const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumes, setResumes] = useState([]);

  const [selectedResumeForReport, setSelectedResumeForReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  // React Hook Form for profile details
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm();

  // React Hook Form for changing password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const fetchProfileAndResumes = async () => {
    try {
      setProfileLoading(true);
      await refreshProfile();
      const resumeList = await userService.getUserResumes();
      setResumes(resumeList || []);
    } catch (e) {
      showToast('Failed to load profile data', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndResumes();
  }, []);

  // Update form fields once user is loaded
  useEffect(() => {
    if (user) {
      setSkills(user.skills || []);
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        currentRole: user.experience?.currentRole || '',
        company: user.experience?.company || '',
        yearsOfExperience: user.experience?.yearsOfExperience || 0,
        education: user.experience?.education || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileUpdate = async (data) => {
    setProfileLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        skills: skills,
        experience: {
          currentRole: data.currentRole,
          company: data.company,
          yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
          education: data.education,
        },
      };
      await userService.updateProfile(payload);
      showToast('Profile updated successfully', 'success');
      refreshProfile();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordUpdate = async (data) => {
    setPasswordLoading(true);
    try {
      await userService.changePassword(data.oldPassword, data.newPassword);
      showToast('Password updated successfully', 'success');
      resetPassword();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit', 'warning');
      return;
    }

    setAvatarLoading(true);
    try {
      await userService.uploadProfileImage(file);
      showToast('Profile image uploaded successfully', 'success');
      refreshProfile();
    } catch (err) {
      console.error(err);
      showToast('Failed to upload profile image', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Resume size exceeds 10MB limit', 'warning');
      return;
    }

    setResumeLoading(true);
    try {
      await userService.uploadResume(file);
      showToast('Resume uploaded successfully', 'success');
      // reload resumes list
      const resumeList = await userService.getUserResumes();
      setResumes(resumeList || []);
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
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      if (selectedResumeForReport?.id === resumeId) {
        setSelectedResumeForReport(null);
        setIsReportModalOpen(false);
      }
    } catch (err) {
      showToast('Failed to delete resume', 'error');
    }
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

  const handleViewReport = (resume) => {
    setSelectedResumeForReport(resume);
    setIsReportModalOpen(true);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (!cleanSkill) return;
    if (skills.includes(cleanSkill)) {
      setNewSkill('');
      return;
    }

    try {
      await userService.addSkill(cleanSkill);
      setSkills((prev) => [...prev, cleanSkill]);
      setNewSkill('');
      showToast(`Skill "${cleanSkill}" added`, 'success');
    } catch (err) {
      showToast('Failed to add skill', 'error');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      await userService.removeSkill(skillToRemove);
      setSkills((prev) => prev.filter((s) => s !== skillToRemove));
      showToast(`Skill "${skillToRemove}" removed`, 'info');
    } catch (err) {
      showToast('Failed to remove skill', 'error');
    }
  };

  const getProfileImageUrl = () => {
    if (user?.profileImageUrl) {
      if (user.profileImageUrl.startsWith('http')) return user.profileImageUrl;
      if (user.profileImageUrl.startsWith('/api/')) {
        return `${API_BASE_URL}${user.profileImageUrl}`;
      }
      return `${API_BASE_URL}/api/v1/files/profile-images/${user.profileImageUrl}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      (user?.firstName || 'User') + ' ' + (user?.lastName || '')
    )}&background=6366f1&color=fff`;
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-text-main tracking-tight leading-none">
          Manage Profile
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Update your experience credentials, upload resumes, and customize skills tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Resumes */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar card */}
          <Card className="text-center flex flex-col items-center py-8">
            <div className="relative group rounded-2xl overflow-hidden ring-4 ring-primary/20 max-w-[150px] w-full aspect-square bg-border-base flex items-center justify-center">
              {avatarLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <img
                    src={getProfileImageUrl()}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                  <label className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-white text-xs gap-1.5 font-bold">
                    <Upload className="h-5 w-5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
            <h3 className="text-lg font-bold text-text-main mt-4">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {user?.roles?.map((role) => (
                <span
                  key={role}
                  className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20"
                >
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </Card>

          {/* Resume Upload card */}
          <Card title="Uploaded Resumes" subtitle="PDF files analyzed by AI during interview matches">
            {/* Upload Button */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border-base rounded-2xl py-6 hover:bg-bg-base/30 transition-all cursor-pointer relative">
                {resumeLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-xs font-semibold text-text-muted">Analyzing PDF...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <Upload className="h-6 w-6 text-primary" />
                    <span className="text-xs font-bold text-text-main">Upload Resume (PDF)</span>
                    <span className="text-[10px] text-text-muted">Maximum file size: 10MB</span>
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
            </div>

            {/* List */}
            <div className="space-y-3">
              {resumes.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No resumes uploaded yet.</p>
              ) : (
                resumes.map((resume) => {
                  const hasAnalysis = resume.analysis && resume.analysis.atsScore !== undefined;
                  const score = hasAnalysis ? resume.analysis.atsScore : null;
                  
                  let scoreBadgeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                  if (score >= 80) {
                    scoreBadgeColor = 'text-green-500 bg-green-500/10 border-green-500/20';
                  } else if (score >= 60) {
                    scoreBadgeColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
                  }

                  return (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border-base bg-bg-base/20 group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text-main truncate max-w-[100px] md:max-w-[130px]" title={resume.fileName}>
                            {resume.fileName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[9px] text-text-muted shrink-0">
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
                      <div className="flex items-center gap-1 shrink-0">
                        {hasAnalysis && (
                          <button
                            onClick={() => handleViewReport(resume)}
                            className="p-1.5 rounded-lg text-text-muted hover:bg-border-base hover:text-primary transition-all"
                            title="View AI Report"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleResumeDelete(resume.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Edit profile, Skills, Change password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Details */}
          <Card title="Personal Details" subtitle="Experience credentials and contact fields">
            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-6">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">First Name</label>
                  <input
                    type="text"
                    {...registerProfile('firstName', { required: 'Required' })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  {profileErrors.firstName && (
                    <span className="text-[10px] text-rose-500">{profileErrors.firstName.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Last Name</label>
                  <input
                    type="text"
                    {...registerProfile('lastName', { required: 'Required' })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  {profileErrors.lastName && (
                    <span className="text-[10px] text-rose-500">{profileErrors.lastName.message}</span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="1234567890"
                    {...registerProfile('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Phone number must be exactly 10 digits',
                      },
                    })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                {profileErrors.phone && (
                  <span className="text-[10px] text-rose-500">{profileErrors.phone.message}</span>
                )}
              </div>

              {/* Experience Box */}
              <div className="border-t border-border-base pt-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" /> Work Experience
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Current Job Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      {...registerProfile('currentRole')}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Current Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      {...registerProfile('company')}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      {...registerProfile('yearsOfExperience')}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Highest Education</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. B.Tech Computer Science"
                        {...registerProfile('education')}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" loading={profileLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Skill tags editor */}
          <Card title="Practice Skills" subtitle="Skills you target for practice. Dynamic tag entries.">
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <Button type="submit" variant="secondary" icon={<Plus className="h-4 w-4" />}>
                Add
              </Button>
            </form>

            <div className="flex flex-wrap gap-2 mt-6">
              {skills.length === 0 ? (
                <p className="text-xs text-text-muted">No skills tags added yet.</p>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border-base bg-bg-base/40 px-3 py-1.5 text-xs font-bold text-text-main"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-text-muted hover:text-rose-500 rounded-full hover:bg-border-base/50 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </Card>

          {/* Change Password Card */}
          <Card title="Update Password" subtitle="Change credentials to secure your account">
            <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword('oldPassword', { required: 'Required' })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  {passwordErrors.oldPassword && (
                    <span className="text-[10px] text-rose-500">{passwordErrors.oldPassword.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      {...registerPassword('newPassword', {
                        required: 'Required',
                        minLength: { value: 6, message: 'Must be at least 6 characters' },
                      })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="text-[10px] text-rose-500">{passwordErrors.newPassword.message}</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" loading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Resume ATS Report Modal */}
      {selectedResumeForReport && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title={`Resume ATS Evaluation`}
          size="lg"
        >
          <div className="space-y-6 py-2">
            {/* Top Score Box */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-2xl border border-border-base bg-bg-base/30">
              <div className="flex items-center gap-4">
                {/* Visual Radial Ring */}
                <div className="relative h-20 w-20 shrink-0 flex items-center justify-center rounded-full bg-bg-card shadow-md">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-border-base"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - selectedResumeForReport.analysis.atsScore / 100)}
                      className={
                        selectedResumeForReport.analysis.atsScore >= 80
                          ? 'text-green-500'
                          : selectedResumeForReport.analysis.atsScore >= 60
                          ? 'text-yellow-500'
                          : 'text-rose-500'
                      }
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-base font-black text-text-main">
                    {selectedResumeForReport.analysis.atsScore}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">ATS Optimization Score</h4>
                  <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
                    Based on resume structure, key skills parsed, and content compatibility.
                  </p>
                </div>
              </div>
              
              {/* Download PDF button */}
              <button
                onClick={() => handleDownloadReport(selectedResumeForReport.id, selectedResumeForReport.fileName)}
                disabled={downloadingReportId === selectedResumeForReport.id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all disabled:opacity-55 cursor-pointer shrink-0"
              >
                {downloadingReportId === selectedResumeForReport.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-text-main uppercase tracking-wider">AI Feedback Summary</h5>
              <p className="text-xs text-text-muted leading-relaxed p-4 rounded-xl bg-bg-base/15 border border-border-base">
                {selectedResumeForReport.analysis.feedbackSummary}
              </p>
            </div>

            {/* Strengths & Weaknesses Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-green-500">
                  <Sparkles className="h-4 w-4" />
                  <h5 className="text-xs font-extrabold uppercase tracking-wider">Key Strengths</h5>
                </div>
                <div className="p-4 rounded-xl border border-green-500/10 bg-green-500/5 space-y-2.5">
                  {selectedResumeForReport.analysis.strengths && selectedResumeForReport.analysis.strengths.map((str, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-text-main leading-relaxed">
                      <span className="text-green-500 font-bold">•</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-rose-500">
                  <X className="h-4 w-4" />
                  <h5 className="text-xs font-extrabold uppercase tracking-wider">Areas to Improve</h5>
                </div>
                <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 space-y-2.5">
                  {selectedResumeForReport.analysis.improvements && selectedResumeForReport.analysis.improvements.map((imp, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-text-main leading-relaxed">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Skills */}
            {selectedResumeForReport.analysis.recommendedSkills && selectedResumeForReport.analysis.recommendedSkills.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-text-main uppercase tracking-wider">Recommended Skills to Add</h5>
                <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border-base bg-bg-base/10">
                  {selectedResumeForReport.analysis.recommendedSkills.map((skill, idx) => (
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
        </Modal>
      )}
    </div>
  );
};

export default Profile;
