import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <h1>{t('common.welcome')}</h1>
      <p>Home page - Coming soon</p>
    </div>
  );
};

export default HomePage;

