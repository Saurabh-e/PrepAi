import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import interviewService from '../../services/interviewService';
import { StatCard } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Spinner, CardSkeleton } from '../../components/common/Loader';
import {
  Trophy,
  BrainCircuit,
  Award,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await interviewService.getDashboardSummary();
      setData(res);
    } catch (error) {
      console.error(error);
      showToast('Failed to load dashboard data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-border-base/50" />
            <div className="h-4 w-64 animate-pulse rounded bg-border-base/40" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-border-base bg-bg-card p-6 h-80 animate-pulse" />
          <div className="rounded-2xl border border-border-base bg-bg-card p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  // Parse chart data
  const trendData = Object.entries(data?.performanceTrend || {})
    .map(([date, score]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Score: parseFloat(score.toFixed(1)),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Fallback if no trend data
  const chartData = trendData.length > 0 ? trendData : [
    { date: 'Intro', Score: 0 },
  ];

  const statCards = [
    {
      title: 'Total Interviews',
      value: data?.totalInterviews || 0,
      description: 'Mock interviews completed',
      icon: <BrainCircuit className="h-6 w-6" />,
    },
    {
      title: 'Average Score',
      value: data?.averageScore ? `${(data.averageScore * 10).toFixed(1)}%` : '0%',
      description: 'Across all assessments',
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
      trend: data?.averageScore ? { type: 'up', value: '5%', label: 'vs last week' } : null,
    },
    {
      title: 'Highest Score',
      value: data?.highestScore ? `${(data.highestScore * 10).toFixed(1)}%` : '0%',
      description: 'Your peak performance',
      icon: <Award className="h-6 w-6 text-emerald-500" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight leading-none flex items-center gap-2">
            Welcome back, {user?.firstName}! <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Here's your personal progress card. Keep practicing to level up your scores.
          </p>
        </div>
        <button
          onClick={() => navigate('/interview/select')}
          className="bg-primary text-white hover:bg-primary-hover font-semibold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all self-start text-sm"
        >
          Start Practice Interview
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Main Charts & Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border-base bg-bg-card p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Performance Trend
              </h3>
              <p className="text-xs text-text-muted mt-1">Average scores tracked over time</p>
            </div>
          </div>
          <div className="flex-1 h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-base)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-base)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="Score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended topics strengths/weaknesses */}
        <div className="rounded-2xl border border-border-base bg-bg-card p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-text-main mb-4 flex items-center gap-2">
            Skill Recommendations
          </h3>
          <div className="flex-1 flex flex-col justify-between gap-6">
            {/* Needs Practice */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Focus Areas (Weaknesses)
              </span>
              {data?.weakTopics?.length === 0 ? (
                <p className="text-xs text-text-muted">No weak areas identified yet. Practice more!</p>
              ) : (
                <div className="space-y-2">
                  {data?.weakTopics?.slice(0, 3).map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
                      <span className="text-xs font-semibold text-text-main truncate max-w-[120px]">{topic.topic}</span>
                      <span className="text-xs text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg">
                        {(topic.averageScore * 10).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Strong Topics (Strengths)
              </span>
              {data?.strongTopics?.length === 0 ? (
                <p className="text-xs text-text-muted">No strong topics recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {data?.strongTopics?.slice(0, 3).map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-xs font-semibold text-text-main truncate max-w-[120px]">{topic.topic}</span>
                      <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                        {(topic.averageScore * 10).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-main">Recent Interviews</h3>
          <Link to="/history" className="text-xs font-bold text-primary hover:underline flex items-center">
            View all history <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <Table
          headers={['Domain', 'Job Role', 'Difficulty', 'Date', 'Score', 'Status', 'Action']}
          emptyMessage="You haven't taken any interviews yet. Click Start Practice above!"
        >
          {data?.recentInterviews?.slice(0, 5).map((interview) => (
            <tr key={interview.id} className="border-b border-border-base hover:bg-bg-base/30 transition-colors">
              <td className="px-6 py-4 font-semibold text-xs text-primary">{interview.domain}</td>
              <td className="px-6 py-4 text-xs font-medium text-text-main">{interview.jobRole || 'Software Engineer'}</td>
              <td className="px-6 py-4 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase ${
                    interview.difficulty === 'EASY'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : interview.difficulty === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-rose-500/10 text-rose-600'
                  }`}
                >
                  {interview.difficulty}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-text-muted flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(interview.startedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-xs font-bold text-text-main">
                {interview.overallScore ? `${(interview.overallScore * 10).toFixed(0)}%` : '--'}
              </td>
              <td className="px-6 py-4 text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                    interview.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : interview.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-text-muted/10 text-text-muted'
                  }`}
                >
                  {interview.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs">
                {interview.status === 'COMPLETED' ? (
                  <Link
                    to={`/interview/result/${interview.id}`}
                    className="text-primary font-bold hover:underline"
                  >
                    View Report
                  </Link>
                ) : interview.status === 'IN_PROGRESS' ? (
                  <Link
                    to="/interview/screen"
                    className="text-indigo-500 font-bold hover:underline"
                  >
                    Resume
                  </Link>
                ) : (
                  <span className="text-text-muted">--</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
