import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../services/api';
import {
  LayoutDashboard,
  PlayCircle,
  History as HistoryIcon,
  User,
  Settings,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  FileText,
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('#profile-menu-button') && !event.target.closest('#profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (!event.target.closest('#notification-button') && !event.target.closest('#notification-dropdown')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      navigate('/login');
    } catch (e) {
      showToast('Failed to logout', 'error');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, role: 'user' },
    { name: 'Start Interview', path: '/interview/select', icon: <PlayCircle className="h-5 w-5" />, role: 'user' },
    { name: 'Interview History', path: '/history', icon: <HistoryIcon className="h-5 w-5" />, role: 'user' },
    { name: 'Resume Analysis', path: '/resume-analysis', icon: <FileText className="h-5 w-5" />, role: 'user' },
    { name: 'My Profile', path: '/profile', icon: <User className="h-5 w-5" />, role: 'user' },
    { name: 'Admin Center', path: '/admin', icon: <ShieldCheck className="h-5 w-5" />, role: 'admin' },
  ];

  const filteredLinks = navLinks.filter((link) => {
    if (link.role === 'admin') return isAdmin;
    return true;
  });

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
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-border-base flex items-center justify-between px-6 py-4">
        {/* Left: Brand Logo & Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-border-base/40 hover:text-text-main transition-all"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-primary">
            <Sparkles className="h-6 w-6 text-primary fill-primary/20 animate-pulse" />
            <span>PrepAI</span>
          </Link>
        </div>

        {/* Right: Actions Menu */}
        <div className="flex items-center gap-4">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-muted hover:bg-border-base/50 hover:text-text-main transition-all active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              id="notification-button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-xl text-text-muted hover:bg-border-base/50 hover:text-text-main transition-all active:scale-95 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-bg-card animate-bounce" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div
                id="notification-dropdown"
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-border-base bg-bg-card shadow-xl overflow-hidden z-50 py-2"
              >
                <div className="px-4 py-2 border-b border-border-base flex items-center justify-between">
                  <span className="font-bold text-xs text-text-main">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-text-muted">
                      No notifications available
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`px-4 py-3 hover:bg-bg-base/40 transition-colors border-b border-border-base/50 cursor-pointer ${
                          !n.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold text-text-main leading-snug">{n.title}</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-normal">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              id="profile-menu-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-border-base/40 transition-all focus:outline-none active:scale-98"
            >
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-primary/20"
              />
              <span className="hidden md:inline text-xs font-bold text-text-main">
                {user?.firstName || 'User'}
              </span>
              <ChevronDown className="hidden md:inline h-4 w-4 text-text-muted shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                id="profile-dropdown"
                className="absolute right-0 mt-2 w-52 rounded-2xl border border-border-base bg-bg-card shadow-xl overflow-hidden z-50 py-1"
              >
                <div className="px-4 py-3 border-b border-border-base">
                  <p className="text-xs font-bold text-text-main truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-text-muted hover:text-text-main hover:bg-bg-base/40 transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Sidebar Container */}
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-border-base flex-col bg-bg-card p-4 gap-2 shrink-0">
          <nav className="flex-1 space-y-1">
            {filteredLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-text-muted hover:bg-bg-base hover:text-text-main'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar (Slide-out Drawer) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Content */}
            <aside className="relative flex flex-col w-64 bg-bg-card h-full p-4 gap-2 z-10 shadow-2xl border-r border-border-base">
              <div className="flex items-center justify-between pb-4 border-b border-border-base mb-4">
                <span className="font-black text-lg text-primary">Navigation</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:bg-border-base/40 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {filteredLinks.map((link) => {
                  const isActive = location.pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-sm shadow-primary/20'
                          : 'text-text-muted hover:bg-bg-base hover:text-text-main'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border-base py-6 px-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted bg-bg-card shrink-0 gap-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} PrepAI Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-text-main transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-text-main transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-text-main transition-colors">Help Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
