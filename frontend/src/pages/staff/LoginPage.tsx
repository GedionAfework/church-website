import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/staff/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>{t('auth.loginTitle')}</h1>
        <p>{t('auth.loginSubtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>{t('auth.username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('common.login')}
          </button>
        </form>
        <div className="language-selector">
          <button onClick={() => i18n.changeLanguage('am')}>አማርኛ</button>
          <button onClick={() => i18n.changeLanguage('en')}>English</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

