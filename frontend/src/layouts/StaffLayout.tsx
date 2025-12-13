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

  // Helper function to check if user has any of the required permissions
  const hasPermission = (requiredPermissions: string[]): boolean => {
    if (!user?.permissions) return false;
    if (user.is_superuser) return true;
    return requiredPermissions.some(perm => user.permissions?.includes(perm));
  };

  // Define navigation items with their required permissions
  // Note: Django creates default permissions (add, change, delete, view) for all models
  // We check for both custom permissions and default Django permissions
  const navigationItems = [
    {
      path: '/staff/dashboard',
      label: t('dashboard.title'),
      permissions: [], // Dashboard is always accessible
    },
    {
      path: '/staff/members',
      label: t('members.title'),
      permissions: [
        'members.view_member', // Django default
        'members.add_member', // Django default
        'members.change_member', // Django default
        'members.manage_member', // Custom
        'members.view_zone_members', // Custom
        'members.manage_zone_members', // Custom
        'members.view_service_members', // Custom
        'members.manage_service_members', // Custom
      ],
    },
    {
      path: '/staff/families',
      label: t('families.title'),
      permissions: [
        'members.view_family', // Django default
        'members.add_family', // Django default
        'members.change_family', // Django default
        'members.manage_family', // Custom
        'members.view_member', // If they can view members, they can view families
      ],
    },
    {
      path: '/staff/zones',
      label: t('zones.title'),
      permissions: [
        'structure.view_zone', // Django default
        'structure.add_zone', // Django default
        'structure.change_zone', // Django default
        'structure.manage_zone', // Custom
        'structure.view_own_zone', // Custom
        'structure.manage_own_zone', // Custom
      ],
    },
    {
      path: '/staff/service-divisions',
      label: t('dashboard.serviceDivisions'),
      permissions: [
        'structure.view_servicedivision', // Django default (note: lowercase model name)
        'structure.add_servicedivision', // Django default
        'structure.change_servicedivision', // Django default
        'structure.manage_service_division', // Custom
        'structure.view_own_service_division', // Custom
        'structure.manage_own_service_division', // Custom
      ],
    },
    {
      path: '/staff/blog',
      label: t('content.blog'),
      permissions: [
        'content.view_blogpost', // Django default
        'content.add_blogpost', // Django default
        'content.change_blogpost', // Django default
        'content.manage_blog_post', // Custom
      ],
    },
    {
      path: '/staff/hero-section',
      label: t('content.heroSection'),
      permissions: [
        'content.view_herosection', // Django default
        'content.add_herosection', // Django default
        'content.change_herosection', // Django default
        'content.manage_hero_section', // Custom
      ],
    },
    {
      path: '/staff/social-feeds',
      label: t('content.socialFeeds'),
      permissions: [
        'content.view_socialfeedconfig', // Django default
        'content.add_socialfeedconfig', // Django default
        'content.change_socialfeedconfig', // Django default
        'content.manage_social_feed_config', // Custom
      ],
    },
    {
      path: '/staff/roles',
      label: t('roles.title') || 'Roles',
      permissions: [
        'auth.view_group', // Django default
        'auth.add_group', // Django default
        'auth.change_group', // Django default
        'auth.delete_group', // Django default
      ],
    },
    {
      path: '/staff/users',
      label: t('users.title') || 'Users',
      permissions: [
        'auth.view_user', // Django default
        'auth.add_user', // Django default
        'auth.change_user', // Django default
        'auth.delete_user', // Django default
      ],
    },
  ];

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
          {navigationItems.map((item) => {
            // Show item if user has required permissions or if no permissions required (like dashboard)
            if (item.permissions.length === 0 || hasPermission(item.permissions)) {
              return (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>
      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;

