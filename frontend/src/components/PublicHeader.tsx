import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PublicHeader: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="public-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>{t('site.name') || 'Church Website'}</h1>
        </Link>
        <nav className="public-nav">
          <Link to="/">{t('nav.home') || 'Home'}</Link>
          <Link to="/blog">{t('nav.blog') || 'Blog'}</Link>
          <Link to="/staff">{t('nav.staff') || 'Staff'}</Link>
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="am">አማርኛ</option>
            <option value="en">English</option>
          </select>
        </nav>
      </div>
    </header>
  );
};

export default PublicHeader;

