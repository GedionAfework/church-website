import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PermissionProtectedRoute } from './components/PermissionProtectedRoute';
import './i18n/config';

// Public pages
import HomePage from './pages/public/HomePage';
import BlogListPage from './pages/public/BlogListPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import PublicPhotosPage from './pages/public/PhotosPage';
import StaffPage from './pages/public/StaffPage';

// Staff pages
import LoginPage from './pages/staff/LoginPage';
import DashboardPage from './pages/staff/DashboardPage';
import MembersPage from './pages/staff/MembersPage';
import MemberDetailPage from './pages/staff/MemberDetailPage';
import FamiliesPage from './pages/staff/FamiliesPage';
import FamilyDetailPage from './pages/staff/FamilyDetailPage';
import ZonesPage from './pages/staff/ZonesPage';
import ZoneDetailPage from './pages/staff/ZoneDetailPage';
import ServiceDivisionsPage from './pages/staff/ServiceDivisionsPage';
import ServiceDivisionDetailPage from './pages/staff/ServiceDivisionDetailPage';
import BlogManagementPage from './pages/staff/BlogManagementPage';
import HeroSectionPage from './pages/staff/HeroSectionPage';
import SocialFeedsPage from './pages/staff/SocialFeedsPage';
import PhotosPage from './pages/staff/PhotosPage';
import RolesPage from './pages/staff/RolesPage';
import UsersPage from './pages/staff/UsersPage';

// Layouts
import StaffLayout from './layouts/StaffLayout';
import PublicLayout from './layouts/PublicLayout';

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
        <Routes>
          {/* Staff login route - must come before /staff to avoid conflicts */}
          <Route path="/staff/login" element={<LoginPage />} />
          
          {/* Public routes - must come before staff admin routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
            <Route path="photos" element={<PublicPhotosPage />} />
            <Route path="staff" element={<StaffPage />} />
          </Route>

          {/* Staff admin routes - matches /staff/dashboard, /staff/members, etc. */}
          {/* Note: /staff itself is handled by the public route above, so no index route here */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route 
              path="dashboard" 
              element={
                <PermissionProtectedRoute requiredPermissions={['accounts.view_dashboard']}>
                  <DashboardPage />
                </PermissionProtectedRoute>
              } 
            />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/:id" element={<MemberDetailPage />} />
            <Route path="families" element={<FamiliesPage />} />
            <Route path="families/:id" element={<FamilyDetailPage />} />
            <Route path="zones" element={<ZonesPage />} />
            <Route path="zones/:id" element={<ZoneDetailPage />} />
            <Route path="service-divisions" element={<ServiceDivisionsPage />} />
            <Route path="service-divisions/:id" element={<ServiceDivisionDetailPage />} />
                  <Route path="blog" element={<BlogManagementPage />} />
                  <Route path="hero-section" element={<HeroSectionPage />} />
                  <Route path="social-feeds" element={<SocialFeedsPage />} />
                  <Route path="photos" element={<PhotosPage />} />
                  <Route path="roles" element={<RolesPage />} />
                  <Route path="users" element={<UsersPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
