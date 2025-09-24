import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PlayPage from './pages/PlayPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import GachaPage from './pages/GachaPage';
import InventoryPage from './pages/InventoryPage';
import TradePage from './pages/TradePage';
import AdminPage from './pages/AdminPage';
import UpgradePage from './pages/UpgradePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminItemsPage from './pages/admin/AdminItemsPage';
import AdminTradesPage from './pages/admin/AdminTradesPage';
import AdminEconomyPage from './pages/admin/AdminEconomyPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import GlobalChatPage from './pages/chat/GlobalChatPage';
import PrivateChatPage from './pages/chat/PrivateChatPage';
import MaintenancePage from './pages/MaintenancePage';
import { MaintenanceProvider } from './contexts/MaintenanceContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <MaintenanceProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/play" element={<PlayPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/gacha" element={<GachaPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/trade" element={<TradePage />} />
                <Route path="/upgrade" element={<UpgradePage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/chat/global" element={<GlobalChatPage />} />
                <Route path="/chat/private" element={<PrivateChatPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/items" element={<AdminItemsPage />} />
                <Route path="/admin/trades" element={<AdminTradesPage />} />
                <Route path="/admin/economy" element={<AdminEconomyPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
                <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
              </Routes>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                }}
              />
            </Layout>
          </MaintenanceProvider>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
