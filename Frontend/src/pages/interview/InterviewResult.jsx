import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import interviewService from '../../services/interviewService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common/Loader';
import Editor from '@monaco-editor/react';
import {
  Trophy,
  ChevronLeft,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Code2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export const InterviewResult = () => {
  const { id: interviewId } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState({});

  useEffect(() => {
    const fetchResultDetails = async () => {
      try {
        setLoading(true);
        const details = await interviewService.getInterviewDetails(interviewId);
        setData(details);
      } catch (err) {
        console.error('Error fetching interview results:', err);
        showToast('Failed to load interview results.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResultDetails();
  }, [interviewId]);

  const toggleQuestionExpand = (qId) => {
    setExpandedQuestion((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs font-semibold text-text-muted">Analyzing your response metrics...</p>
      </div>
    );
  }

  const { interview, questions = [], answers = [], feedback } = data || {};

  // Extract score values (defaulting to mock equivalents if backend maps are empty or null)
  // Scores are 0.0 - 10.0 in java, convert to percentage * 10
  const overallPct = feedback?.overallScore ? feedback.overallScore * 10 : (interview?.overallScore ? interview.overallScore * 10 : 0);
  
  const techScore = feedback?.skillScores?.TECHNICAL || feedback?.skillScores?.Technical || 7.5;
  const grammarScore = feedback?.skillScores?.GRAMMAR || feedback?.skillScores?.Grammar || 7.0;
  const commScore = feedback?.skillScores?.COMMUNICATION || feedback?.skillScores?.Communication || 8.0;

  const isCoding = interview?.domain === 'CODEFORCES';

  const scoreStats = isCoding ? [
    { name: 'Correctness & Runs', value: techScore * 10, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Time & Space Complexity', value: grammarScore * 10, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Design & Readability', value: commScore * 10, color: 'text-emerald-500 bg-emerald-500/10' },
  ] : [
    { name: 'Technical', value: techScore * 10, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Grammar', value: grammarScore * 10, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Communication', value: commScore * 10, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  // Map radar chart data
  const radarData = isCoding ? [
    { subject: 'Correctness', A: techScore * 10, fullMark: 100 },
    { subject: 'Complexity', A: grammarScore * 10, fullMark: 100 },
    { subject: 'Readability', A: commScore * 10, fullMark: 100 },
    { subject: 'Efficiency', A: (feedback?.communication?.clarity || 7.5) * 10, fullMark: 100 },
    { subject: 'Design', A: (feedback?.communication?.articulation || 8.0) * 10, fullMark: 100 },
  ] : [
    { subject: 'Technical', A: techScore * 10, fullMark: 100 },
    { subject: 'Grammar', A: grammarScore * 10, fullMark: 100 },
    { subject: 'Communication', A: commScore * 10, fullMark: 100 },
    { subject: 'Clarity', A: (feedback?.communication?.clarity || 7.5) * 10, fullMark: 100 },
    { subject: 'Articulation', A: (feedback?.communication?.articulation || 8.0) * 10, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 border border-border-base bg-bg-card rounded-xl hover:bg-bg-base transition-colors text-text-muted hover:text-text-main"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight leading-none">
              Assessment Report
            </h1>
            <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-wider">
              {interview?.domain} &bull; {interview?.difficulty} Level
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/interview/select')} variant="primary" size="sm">
          Try Another Practice
        </Button>
      </div>

      {/* Grid: Overall Score Ring vs Radar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Gauge */}
        <Card className="flex flex-col items-center justify-center text-center p-8 md:col-span-1">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Overall Score</h3>
          <div className="relative flex items-center justify-center h-36 w-36">
            {/* SVG circle gauge */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-border-base fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-primary fill-none transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * overallPct) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-text-main tracking-tighter">
                {overallPct.toFixed(0)}%
              </span>
              <span className="text-[10px] uppercase font-bold text-text-muted mt-1">Matched</span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-6 max-w-[200px] leading-relaxed">
            {isCoding
              ? "Overall rating calculated from test case correctness, algorithmic complexity, and code quality."
              : "Overall AI evaluation score calculated from grammar, clarity, and response correctness."}
          </p>
        </Card>

        {/* Radar analysis charts */}
        <Card title="Skill Breakdown" subtitle="Detailed competency dimensions analyzed" className="md:col-span-2 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Numeric Indicators */}
            <div className="space-y-4">
              {scoreStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border-base bg-bg-base/30">
                  <span className="text-xs font-bold text-text-main">{stat.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${stat.color}`}>
                    {stat.value.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Radar component */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--border-base)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" fontSize={9} />
                  <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Feedback summary */}
      <Card title="Overall AI Evaluation" subtitle="Summary breakdown from AI grader and proctor">
        <div className="space-y-6">
          {/* Summary paragraph */}
          {feedback?.overallSummary && (
            <div className="text-sm text-text-muted leading-relaxed p-4 bg-bg-base/40 rounded-xl border border-border-base">
              {feedback.overallSummary}
            </div>
          )}

          {/* Strengths & Weaknesses Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5" /> Key Strengths
              </span>
              <ul className="space-y-2">
                {feedback?.strengths?.map((str, i) => (
                  <li key={i} className="text-xs text-text-muted leading-relaxed flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
                {(!feedback?.strengths || feedback.strengths.length === 0) && (
                  <p className="text-xs text-text-muted">No strength feedback listed.</p>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5" /> Focus Areas
              </span>
              <ul className="space-y-2">
                {feedback?.weaknesses?.map((weak, i) => (
                  <li key={i} className="text-xs text-text-muted leading-relaxed flex items-start gap-2 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </li>
                ))}
                {(!feedback?.weaknesses || feedback.weaknesses.length === 0) && (
                  <p className="text-xs text-text-muted">No weaknesses feedback listed.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Suggested Improvements & Learning Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <Card title="Improvement Suggestions" subtitle="Concrete action items suggested by AI">
          <ul className="space-y-3">
            {feedback?.recommendations?.map((rec, i) => (
              <li key={i} className="text-xs text-text-muted leading-relaxed flex items-start gap-2.5 p-3 bg-bg-base/30 border border-border-base rounded-xl">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
            {(!feedback?.recommendations || feedback.recommendations.length === 0) && (
              <p className="text-xs text-text-muted">No suggestions provided.</p>
            )}
          </ul>
        </Card>

        {/* Resources */}
        <Card title="Learning Resources" subtitle="Curated study materials recommended for you">
          <ul className="space-y-3">
            {feedback?.learningResources?.map((res, i) => (
              <li key={i} className="text-xs text-text-muted leading-relaxed flex items-start justify-between gap-4 p-3 bg-bg-base/30 border border-border-base rounded-xl group hover:border-primary/30 transition-all">
                <div className="space-y-1">
                  <p className="font-bold text-text-main flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" /> {res.topic}
                  </p>
                  {res.description && <p className="text-[10px] text-text-muted leading-normal">{res.description}</p>}
                </div>
                {res.resourceUrl && (
                  <a
                    href={res.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-border-base bg-bg-card text-text-muted group-hover:text-primary group-hover:border-primary/20 transition-all active:scale-95 shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </li>
            ))}
            {(!feedback?.learningResources || feedback.learningResources.length === 0) && (
              <p className="text-xs text-text-muted">No learning resources recommended for this session.</p>
            )}
          </ul>
        </Card>
      </div>

      {/* Accordion Questions & Answers Review */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-main">Question-by-Question Breakdown</h3>
        
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isExpanded = !!expandedQuestion[q.id];
            const answerObj = answers.find((a) => a.questionId === q.id);
            const scoreNum = answerObj?.score ? answerObj.score * 10 : 0;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-border-base bg-bg-card overflow-hidden shadow-sm"
              >
                {/* Header Toggle */}
                <div
                  onClick={() => toggleQuestionExpand(q.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-base/20 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-text-main truncate max-w-[200px] sm:max-w-md flex items-center gap-1.5">
                      {isCoding && <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                      {isCoding ? (q.problemTitle || q.questionText) : q.questionText}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {answerObj ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                        Score: {scoreNum.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600">
                        Unanswered
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                  </div>
                </div>

                {/* Collapsible Panel */}
                {isExpanded && (
                  <div className="p-5 border-t border-border-base bg-bg-base/10 space-y-4 text-xs">
                    {/* User Answer */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-text-main uppercase text-[10px] tracking-wider">
                        {isCoding ? 'Your Submitted C++ Solution:' : 'Your Submitted Answer:'}
                      </h4>
                      {isCoding ? (
                        <div className="rounded-xl overflow-hidden border border-slate-800 h-64 mt-1.5">
                          <Editor
                            height="250px"
                            language="cpp"
                            theme="vs-dark"
                            value={answerObj?.answerText || ''}
                            options={{
                              readOnly: true,
                              fontSize: 12,
                              minimap: { enabled: false },
                              automaticLayout: true,
                              scrollBeyondLastLine: false,
                              lineHeight: 18
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-text-muted p-3 bg-bg-base/30 rounded-xl leading-relaxed italic border border-border-base/50">
                          {answerObj?.answerText || 'No answer submitted for this question.'}
                        </p>
                      )}
                    </div>

                    {/* AI Feedback detail */}
                    {answerObj && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-bold text-text-main text-[10px] uppercase tracking-wider mb-1">
                              {isCoding ? 'Compilation & Test Runs Summary:' : 'Technical Content Feedback:'}
                            </h5>
                            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{answerObj.technicalFeedback || 'No feedback details.'}</p>
                          </div>
                          <div>
                            <h5 className="font-bold text-text-main text-[10px] uppercase tracking-wider mb-1">
                              {isCoding ? 'Complexity & Performance Review:' : 'Communication Style Feedback:'}
                            </h5>
                            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{answerObj.communicationFeedback || 'No feedback details.'}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl">
                            <h5 className="font-bold text-primary text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" /> {isCoding ? 'Refactoring & Code Optimizations:' : 'Suggested Key Points to Mention:'}
                            </h5>
                            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{answerObj.improvements || 'No specific improvements.'}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-text-muted">
                            <span>Time taken: <span className="font-semibold text-text-main">{answerObj.responseTimeSeconds || 0} seconds</span></span>
                            <span>Answered: <span className="font-semibold text-text-main">{new Date(answerObj.answeredAt).toLocaleTimeString()}</span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewResult;
