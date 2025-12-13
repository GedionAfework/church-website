import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const StaffLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="staff-layout">
      <nav className="staff-nav">
        <div className="nav-header">
          <h2>Church Management</h2>
          <div className="nav-actions">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              <option value="am">አማርኛ</option>
              <option value="en">English</option>
            </select>
            <span>{user?.username}</span>
            <button onClick={handleLogout}>{t('common.logout')}</button>
          </div>
        </div>
        <ul className="nav-menu">
          <li><Link to="/staff/dashboard">{t('dashboard.title')}</Link></li>
          <li><Link to="/staff/members">{t('members.title')}</Link></li>
          <li><Link to="/staff/families">{t('families.title')}</Link></li>
          <li><Link to="/staff/zones">{t('zones.title')}</Link></li>
          <li><Link to="/staff/service-divisions">{t('dashboard.serviceDivisions')}</Link></li>
          <li><Link to="/staff/blog">{t('content.blog')}</Link></li>
          <li><Link to="/staff/hero-section">{t('content.heroSection')}</Link></li>
          <li><Link to="/staff/social-feeds">{t('content.socialFeeds')}</Link></li>
        </ul>
      </nav>
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;

