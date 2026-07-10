import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';
import { API_BASE_URL } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { TableRowSkeleton } from '../../components/common/Loader';
import {
  Users,
  ShieldAlert,
  BarChart3,
  BrainCircuit,
  Search,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserMinus,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const Admin = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('users');

  // User list states
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // AI Usage states
  const [aiUsage, setAiUsage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchUsersList = async (page = 0, email = '') => {
    setUserLoading(true);
    try {
      let res;
      if (email.trim()) {
        res = await adminService.searchUsers(email.trim(), page, 8);
      } else {
        res = await adminService.getAllUsers(page, 8);
      }
      
      if (res) {
        setUsers(res.content || []);
        setUserTotalPages(res.totalPages || 0);
        setUserPage(res.number || 0);
      }
    } catch (e) {
      showToast('Failed to load user accounts list', 'error');
    } finally {
      setUserLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminService.getPlatformAnalytics();
      setAnalytics(res);
    } catch (e) {
      showToast('Failed to load platform analytics', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchAIUsageData = async () => {
    setAiLoading(true);
    try {
      const res = await adminService.getAIUsageStatistics();
      setAiUsage(res);
    } catch (e) {
      showToast('Failed to load AI usage statistics', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Fetch list on load
  useEffect(() => {
    fetchUsersList(0);
  }, []);

  // Fetch tab-specific details
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    } else if (activeTab === 'ai') {
      fetchAIUsageData();
    } else if (activeTab === 'users') {
      fetchUsersList(0, searchEmail);
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsersList(0, searchEmail);
  };

  const handleUserSuspend = async (userId, isSuspended) => {
    const actionText = isSuspended ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;
    
    try {
      if (isSuspended) {
        await adminService.activateUser(userId);
        showToast('User account activated', 'success');
      } else {
        await adminService.suspendUser(userId);
        showToast('User account suspended', 'info');
      }
      fetchUsersList(userPage, searchEmail);
    } catch (e) {
      showToast(`Failed to ${actionText} user`, 'error');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user? This action is irreversible.')) return;
    try {
      await adminService.deleteUser(userId);
      showToast('User account deleted', 'success');
      fetchUsersList(userPage, searchEmail);
    } catch (e) {
      showToast('Failed to delete user account', 'error');
    }
  };

  // Chart parsers
  const parseDomainChartData = () => {
    if (!analytics?.domainDistribution) return [];
    return Object.entries(analytics.domainDistribution).map(([name, count]) => ({
      name,
      Interviews: count,
    }));
  };

  const parseDifficultyChartData = () => {
    if (!aiUsage?.difficultyDistribution) return [];
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    return Object.entries(aiUsage.difficultyDistribution).map(([name, count], i) => ({
      name,
      value: count,
      color: colors[i % colors.length],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-text-main tracking-tight leading-none flex items-center gap-2">
          Admin Control Center <ShieldAlert className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-sm text-text-muted mt-2">
          Monitor application users, platform usage statistics, and AI token analytics.
        </p>
      </div>

      {/* Tabs list */}
      <div className="border-b border-border-base flex gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BarChart3 className="h-4.5 w-4.5" />
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ai'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BrainCircuit className="h-4.5 w-4.5" />
          AI Usage Stats
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <Card className="p-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Filter users by email address..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-base bg-bg-base/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </form>
          </Card>

          {/* Table */}
          <Table
            headers={['Avatar', 'Name', 'Email', 'Roles', 'Status', 'Actions']}
            loading={userLoading}
            renderSkeleton={() => (
              <>
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
              </>
            )}
          >
            {users.map((item) => {
              const isSuspended = item.status === 'SUSPENDED';
              const nameText = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'No Name';
              const isUserAdmin = item.roles?.includes('ROLE_ADMIN') || item.roles?.includes('ADMIN');

              return (
                <tr key={item.id} className="border-b border-border-base hover:bg-bg-base/30 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={
                        item.profileImageUrl
                          ? (item.profileImageUrl.startsWith('http')
                              ? item.profileImageUrl
                              : (item.profileImageUrl.startsWith('/api/')
                                  ? `${API_BASE_URL}${item.profileImageUrl}`
                                  : `${API_BASE_URL}/api/v1/files/profile-images/${item.profileImageUrl}`))
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(nameText)}&background=6366f1&color=fff`
                      }
                      alt="Avatar"
                      className="h-8 w-8 rounded-lg object-cover ring-2 ring-primary/10"
                    />
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-text-main">{nameText}</td>
                  <td className="px-6 py-4 text-xs text-text-muted font-medium">{item.email}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">
                      {isUserAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                        isSuspended
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs flex items-center gap-2">
                    {/* Suspend / Activate */}
                    <button
                      onClick={() => handleUserSuspend(item.id, isSuspended)}
                      disabled={isUserAdmin}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSuspended
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/15'
                          : 'border-amber-500/20 bg-amber-500/5 text-amber-600 hover:bg-amber-500/15 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                      title={isSuspended ? 'Activate User' : 'Suspend User'}
                    >
                      {isSuspended ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleUserDelete(item.id)}
                      disabled={isUserAdmin}
                      className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={userPage}
            totalPages={userTotalPages}
            onPageChange={(p) => fetchUsersList(p, searchEmail)}
            disabled={userLoading}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="flex h-60 w-full items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Total Users</span>
                    <span className="text-xl font-black text-text-main">{analytics?.totalUsers || 0}</span>
                  </div>
                </Card>
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Active Accounts</span>
                    <span className="text-xl font-black text-text-main">{analytics?.activeUsers || 0}</span>
                  </div>
                </Card>
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Suspended</span>
                    <span className="text-xl font-black text-text-main">{analytics?.suspendedUsers || 0}</span>
                  </div>
                </Card>
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Total Sessions</span>
                    <span className="text-xl font-black text-text-main">{analytics?.totalInterviews || 0}</span>
                  </div>
                </Card>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Domain Distribution BarChart */}
                <Card
                  title="Interviews by Domain"
                  subtitle="Frequency allocation of student domain practice"
                  className="lg:col-span-2 min-h-[300px]"
                >
                  <div className="h-60 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={parseDomainChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border-base)',
                            color: 'var(--text-main)',
                            fontSize: '11px',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="Interviews" fill="#6366f1" radius={[4, 4, 0, 0]}>
                          {parseDomainChartData().map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#6366f1' : '#818cf8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Engagement status */}
                <Card title="Session Statistics" subtitle="Status ratios of practice assessments">
                  <div className="space-y-4 pt-4 text-xs">
                    <div className="flex justify-between items-center border-b border-border-base/50 pb-2">
                      <span className="font-semibold text-text-muted">Completed Practices</span>
                      <span className="font-bold text-emerald-500">{analytics?.completedInterviews || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-base/50 pb-2">
                      <span className="font-semibold text-text-muted">Ongoing Practices</span>
                      <span className="font-bold text-indigo-500">{analytics?.inProgressInterviews || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-base/50 pb-2">
                      <span className="font-semibold text-text-muted">Platform Avg Score</span>
                      <span className="font-black text-text-main">
                        {analytics?.platformAverageScore ? `${(analytics.platformAverageScore * 10).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {aiLoading ? (
            <div className="flex h-60 w-full items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Estimated LLM API Calls</span>
                    <span className="text-xl font-black text-text-main">{aiUsage?.estimatedApiCalls || 0}</span>
                  </div>
                </Card>
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Avg Questions / Mock</span>
                    <span className="text-xl font-black text-text-main">
                      {aiUsage?.avgQuestionsPerInterview ? aiUsage.avgQuestionsPerInterview.toFixed(1) : '0'}
                    </span>
                  </div>
                </Card>
                <Card className="p-4" bodyClassName="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">AI LLM Model</span>
                    <span className="text-sm font-black text-emerald-600 block truncate max-w-[150px]">Llama 3.3 Versatile</span>
                  </div>
                </Card>
              </div>

              {/* Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty distribution chart */}
                <Card title="Difficulty Choices" subtitle="Practice frequency based on difficulty levels">
                  <div className="h-60 mt-4 flex items-center justify-center">
                    {parseDifficultyChartData().length === 0 ? (
                      <span className="text-xs text-text-muted">No data available</span>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={parseDifficultyChartData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {parseDifficultyChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-base)',
                              color: 'var(--text-main)',
                              fontSize: '11px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  {/* Legend */}
                  <div className="flex justify-center gap-4 text-xs font-semibold text-text-muted mt-2">
                    {parseDifficultyChartData().map((item) => (
                      <span key={item.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}: {item.value}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Groq Usage status */}
                <Card title="AI Provider Details" subtitle="Third-party Groq service integrations">
                  <div className="space-y-4 pt-4 text-xs">
                    <div className="flex justify-between items-center border-b border-border-base/50 pb-2">
                      <span className="font-semibold text-text-muted">Provider API Host</span>
                      <span className="font-mono text-text-main">api.groq.com</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-base/50 pb-2">
                      <span className="font-semibold text-text-muted">Deployment Status</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Operational
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-base/50 pb-2">
                      <span className="font-semibold text-text-muted">Rate Limiting Status</span>
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> 70 RPM Max
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
