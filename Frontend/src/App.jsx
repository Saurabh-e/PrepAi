import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/common/Layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import SelectDomain from './pages/interview/SelectDomain';
import InterviewScreen from './pages/interview/InterviewScreen';
import InterviewResult from './pages/interview/InterviewResult';
import History from './pages/history/History';
import Admin from './pages/admin/Admin';
import ResumeAnalysis from './pages/resume-analysis/ResumeAnalysis';
import LandingPage from './pages/landing/LandingPage';

const NotificationWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return (
    <NotificationProvider isAuthenticated={isAuthenticated}>
      {children}
    </NotificationProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationWrapper>
            <Router>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <History />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume-analysis"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ResumeAnalysis />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Interview flow routes */}
                <Route
                  path="/interview/select"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SelectDomain />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/screen"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <InterviewScreen />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/result/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <InterviewResult />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Center */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Layout>
                        <Admin />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </NotificationWrapper>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
