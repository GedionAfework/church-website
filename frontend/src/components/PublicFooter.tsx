import { useTranslation } from 'react-i18next';

const PublicFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="public-footer">
      <div className="footer-container">
        <p>{t('footer.copyright') || `© ${new Date().getFullYear()} Church Website. All rights reserved.`}</p>
      </div>
    </footer>
  );
};

export default PublicFooter;

