import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '../../context/ToastContext';
import interviewService from '../../services/interviewService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { PlayCircle, AlertCircle, Sparkles, ChevronRight, Briefcase, FileQuestion, GraduationCap } from 'lucide-react';

export const SelectDomain = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeInterview, setActiveInterview] = useState(null);
  const [checkingActive, setCheckingActive] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      jobRole: 'Software Engineer',
      domain: 'JAVASCRIPT',
      difficulty: 'MEDIUM',
      numberOfQuestions: 5,
    },
  });

  const selectedDifficulty = watch('difficulty');
  const selectedDomain = watch('domain');

  // Check for active interviews first
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        setCheckingActive(true);
        const active = await interviewService.getCurrentInterview();
        if (active && active.status === 'IN_PROGRESS') {
          setActiveInterview(active);
        }
      } catch (err) {
        console.error('Error checking active interview:', err);
      } finally {
        setCheckingActive(false);
      }
    };
    checkActiveSession();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const interview = await interviewService.startInterview(
        data.jobRole,
        data.domain,
        data.difficulty,
        parseInt(data.numberOfQuestions)
      );
      showToast('Interview session initialized!', 'success');
      navigate('/interview/screen');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to start interview. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const domainOptions = [
    { value: 'JAVA', label: 'Java Development' },
    { value: 'SPRING_BOOT', label: 'Spring Boot Framework' },
    { value: 'MERN', label: 'MERN Stack Web Dev' },
    { value: 'DSA', label: 'Data Structures & Algorithms' },
    { value: 'SQL', label: 'SQL & Database Design' },
    { value: 'JAVASCRIPT', label: 'Modern JavaScript' },
    { value: 'HR', label: 'Behavioral & HR' },
    { value: 'CODEFORCES', label: 'Coding Interview' },
  ];

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy', desc: 'Focuses on basic terminology and core syntax concepts.', color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 text-emerald-600' },
    { value: 'MEDIUM', label: 'Medium', desc: 'Standard coding scenarios, design questions, and intermediate queries.', color: 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5 text-amber-600' },
    { value: 'HARD', label: 'Hard', desc: 'Complex systems design, performance tuning, and tricky algorithms.', color: 'border-rose-500/30 hover:border-rose-500 bg-rose-500/5 text-rose-600' },
  ];

  if (checkingActive) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs font-semibold text-text-muted">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-text-main tracking-tight leading-none">
          Setup Mock Interview
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Configure domain criteria, difficulty levels, and practice sizes to start your personalized session.
        </p>
      </div>

      {/* Active Session Warning */}
      {activeInterview && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex items-start gap-4 shadow-sm animate-fade-in">
          <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                Active Interview In Progress
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 leading-relaxed">
                You have an unfinished interview in <span className="font-semibold text-primary">{activeInterview.domain}</span> ({activeInterview.difficulty}) started on {new Date(activeInterview.startedAt).toLocaleString()}. Starting a new interview will abandon this active progress.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/interview/screen')}
                variant="primary"
                size="sm"
                icon={<PlayCircle className="h-4 w-4" />}
              >
                Resume Active Practice
              </Button>
              <Button
                onClick={() => setActiveInterview(null)}
                variant="secondary"
                size="sm"
              >
                Start New Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      {!activeInterview && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="space-y-6">
            {/* Job Role Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main block uppercase tracking-wider">Target Job Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  {...register('jobRole', { required: 'Job role is required' })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              {errors.jobRole && (
                <span className="text-[10px] text-rose-500 font-medium">{errors.jobRole.message}</span>
              )}
            </div>

            {/* Domain Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-main block uppercase tracking-wider">Interview Domain</label>
              <div className="relative">
                <FileQuestion className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <select
                  {...register('domain', { required: 'Domain is required' })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                >
                  {domainOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-main block uppercase tracking-wider">Select Difficulty</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficultyOptions.map((opt) => {
                  const isSelected = selectedDifficulty === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setValue('difficulty', opt.value)}
                      className={`cursor-pointer rounded-2xl border-2 p-4 text-left transition-all relative ${
                        isSelected
                          ? `border-primary ${opt.color}`
                          : 'border-border-base bg-bg-base/20 hover:border-border-base/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-text-main">{opt.label}</span>
                        {isSelected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Questions count slider */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-main uppercase tracking-wider">Number of Questions</label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                  {watch('numberOfQuestions')} Questions
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                {...register('numberOfQuestions')}
                className="w-full h-2 bg-border-base rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-semibold">
                <span>3 questions (Quick practice)</span>
                <span>10 questions (Full assessment)</span>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full md:w-auto"
                iconRight={<ChevronRight className="h-4 w-4" />}
              >
                Initialize Interview Screen
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default SelectDomain;
