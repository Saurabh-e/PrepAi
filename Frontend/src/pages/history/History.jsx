import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import interviewService from '../../services/interviewService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { TableRowSkeleton } from '../../components/common/Loader';
import { Search, Calendar, ChevronRight, HelpCircle, Filter } from 'lucide-react';

export const History = () => {
  const { showToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const fetchHistory = async (page = 0) => {
    try {
      setLoading(true);
      const res = await interviewService.getInterviewHistory(page, 8);
      // res is a Page object from Spring Boot Pageable response
      // Structure: { content: [...], totalPages: N, number: page }
      if (res) {
        setInterviews(res.content || []);
        setTotalPages(res.totalPages || 0);
        setCurrentPage(res.number || 0);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
      showToast('Failed to load interview history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
  };

  // We perform client-side filtering on the fetched page contents for queries,
  // which works wonderfully for mock data / local practicing.
  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.jobRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.domain?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDomain =
      domainFilter === 'ALL' || interview.domain === domainFilter;
      
    const matchesDifficulty =
      difficultyFilter === 'ALL' || interview.difficulty === difficultyFilter;

    return matchesSearch && matchesDomain && matchesDifficulty;
  });

  const domainOptions = [
    { value: 'ALL', label: 'All Domains' },
    { value: 'JAVA', label: 'Java' },
    { value: 'SPRING_BOOT', label: 'Spring Boot' },
    { value: 'MERN', label: 'MERN Stack' },
    { value: 'DSA', label: 'DSA' },
    { value: 'SQL', label: 'SQL' },
    { value: 'JAVASCRIPT', label: 'JavaScript' },
    { value: 'HR', label: 'HR' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-text-main tracking-tight leading-none">
          Interview History
        </h1>
        <p className="text-sm text-text-muted mt-2">
          View scores, feedback reports, and answers from all your previous practice sessions.
        </p>
      </div>

      {/* Filters bar */}
      <Card className="p-4" bodyClassName="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by job role or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border-base bg-bg-base/40 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Domain Filter */}
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border-base bg-bg-base/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
            >
              {domainOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border-base bg-bg-base/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </Card>

      {/* Table view */}
      <div className="space-y-4">
        <Table
          headers={['Domain', 'Job Role', 'Difficulty', 'Questions', 'Completed Date', 'Overall Score', 'Status', 'Report']}
          loading={loading}
          emptyMessage="No matching interview history entries found."
          renderSkeleton={() => (
            <>
              <TableRowSkeleton cols={8} />
              <TableRowSkeleton cols={8} />
              <TableRowSkeleton cols={8} />
            </>
          )}
        >
          {filteredInterviews.map((interview) => (
            <tr key={interview.id} className="border-b border-border-base hover:bg-bg-base/30 transition-colors">
              <td className="px-6 py-4 font-bold text-xs text-primary">{interview.domain}</td>
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
              <td className="px-6 py-4 text-xs text-text-muted">
                {interview.completedQuestions} / {interview.totalQuestions}
              </td>
              <td className="px-6 py-4 text-xs text-text-muted flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : (interview.startedAt ? new Date(interview.startedAt).toLocaleDateString() : '--')}
              </td>
              <td className="px-6 py-4 text-xs font-bold text-text-main">
                {interview.overallScore ? `${(interview.overallScore * 10).toFixed(0)}%` : '--'}
              </td>
              <td className="px-6 py-4 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
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
                    className="text-primary font-bold hover:underline inline-flex items-center"
                  >
                    View report
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                ) : interview.status === 'IN_PROGRESS' ? (
                  <Link
                    to="/interview/screen"
                    className="text-indigo-500 font-bold hover:underline"
                  >
                    Resume
                  </Link>
                ) : (
                  <span className="text-text-muted">Abandoned</span>
                )}
              </td>
            </tr>
          ))}
        </Table>

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default History;
