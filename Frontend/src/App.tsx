import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/DashboardPage';
import Alerts from './pages/AlertsPage';
import MLClassification from './pages/MLClassificationPage';
import LLMSummaries from './pages/LLMSummariesPage';
import IOCExtraction from './pages/IOCExtractionPage';
import Settings from './pages/Settings';
import Profile from './pages/ProfilePage';
import Notifications from './pages/Notifications';
import WazuhLogs from './pages/WazuhLogs';
import SignIn from './pages/SignInPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        Restoring secure session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        !loading && user ? <Navigate to="/" replace /> : <SignIn />
      } />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute>
          <MainLayout>
            <Alerts />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/ml-classification" element={
        <ProtectedRoute>
          <MainLayout>
            <MLClassification />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/llm-summaries" element={
        <ProtectedRoute>
          <MainLayout>
            <LLMSummaries />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/ioc-extraction" element={
        <ProtectedRoute>
          <MainLayout>
            <IOCExtraction />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <Notifications />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/wazuh-logs" element={
        <ProtectedRoute>
          <MainLayout>
            <WazuhLogs />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
