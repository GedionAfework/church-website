import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { contentService, type HeroSection, type BlogPost } from '../../services/contentService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { formatToEthiopian } from '../../utils/dateFormatter';

interface SocialFeedConfig {
  id: number;
  platform: 'instagram' | 'facebook' | 'youtube';
  platform_display: string;
  handle_or_page_id: string;
  is_active: boolean;
}

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [socialFeeds, setSocialFeeds] = useState<SocialFeedConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHero();
    fetchRecentPosts();
    fetchSocialFeeds();
  }, []);

  const fetchHero = async () => {
    try {
      const activeHero = await contentService.getActiveHero();
      setHero(activeHero);
    } catch (error) {
      console.error('Error fetching hero:', error);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const data = await contentService.getBlogPosts({ page: 1, status: 'published' });
      setRecentPosts(data.results.slice(0, 3));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialFeeds = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SOCIAL_FEEDS, {
        params: { is_active: true, page_size: 100 },
      });
      setSocialFeeds(response.data.results || []);
    } catch (error) {
      console.error('Error fetching social feeds:', error);
    }
  };

  const renderHero = () => {
    if (!hero) {
      return (
        <div className="hero-default">
          <h1>{t('home.welcome') || 'Welcome to Our Church'}</h1>
          <p>{t('home.welcomeMessage') || 'Join us in worship and fellowship'}</p>
        </div>
      );
    }

    const heroStyle: React.CSSProperties = {
      backgroundImage: hero.background_image
        ? `url(${hero.background_image})`
        : undefined,
      backgroundColor: hero.background_image ? undefined : '#667eea',
      color: hero.title_color || '#000000',
      textAlign: hero.text_alignment || 'center',
      padding: '100px 20px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    };

    if (hero.layout.includes('overlay')) {
      const opacity = hero.overlay_opacity || 0.5;
      heroStyle.backgroundColor = hero.layout === 'overlay_dark' 
        ? `rgba(0, 0, 0, ${opacity})`
        : `rgba(255, 255, 255, ${opacity})`;
    }

    return (
      <div className={`hero-section hero-${hero.layout}`} style={heroStyle}>
        {hero.layout.includes('overlay') && (
          <div
            className="hero-overlay"
            style={{
              backgroundColor:
                hero.layout === 'overlay_dark'
                  ? `rgba(0, 0, 0, ${hero.overlay_opacity || 0.5})`
                  : `rgba(255, 255, 255, ${hero.overlay_opacity || 0.5})`,
            }}
          />
        )}
        <div className="hero-content">
          {hero.title && (
            <h1 style={{ color: hero.title_color }}>{hero.title}</h1>
          )}
          {hero.subtitle && (
            <p style={{ color: hero.subtitle_color }}>{hero.subtitle}</p>
          )}
          {hero.button_text && hero.button_link && (
            <a
              href={hero.button_link}
              className={`btn-hero btn-${hero.button_variant}`}
            >
              {hero.button_text}
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">
      {renderHero()}

      <div className="home-content">
        <section className="recent-blog-section">
          <h2>{t('home.recentPosts') || 'Recent Posts'}</h2>
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : recentPosts.length === 0 ? (
            <p>{t('home.noPosts') || 'No posts yet'}</p>
          ) : (
            <div className="blog-grid">
              {recentPosts.map((post) => (
                <article key={post.id} className="blog-card">
                  {post.thumbnail_image && (
                    <img
                      src={post.thumbnail_image}
                      alt={post.title}
                      className="blog-thumbnail"
                    />
                  )}
                  <div className="blog-card-content">
                    <h3>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.author_name && (
                      <p className="blog-author">
                        {t('blog.by') || 'By'} {post.author_name}
                      </p>
                    )}
                    {post.published_at && (
                      <p className="blog-date">
                        {formatToEthiopian(post.published_at, i18n.language)}
                      </p>
                    )}
                    <Link to={`/blog/${post.slug}`} className="blog-read-more">
                      {t('blog.readMore') || 'Read More'} →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="view-all">
            <Link to="/blog" className="btn-primary">
              {t('home.viewAllPosts') || 'View All Posts'}
            </Link>
          </div>
        </section>

        {socialFeeds.length > 0 && (
          <section className="social-feeds-section">
            <h2>{t('home.socialFeeds') || 'Follow Us'}</h2>
            <div className="social-feeds-grid">
              {socialFeeds.map((feed) => {
                const getFeedUrl = () => {
                  switch (feed.platform) {
                    case 'instagram':
                      return `https://instagram.com/${feed.handle_or_page_id}`;
                    case 'facebook':
                      return `https://facebook.com/${feed.handle_or_page_id}`;
                    case 'youtube':
                      return `https://youtube.com/${feed.handle_or_page_id}`;
                    default:
                      return '#';
                  }
                };

                return (
                  <a
                    key={feed.id}
                    href={getFeedUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-feed-card"
                  >
                    <div className="social-feed-icon">
                      {feed.platform === 'instagram' && '📷'}
                      {feed.platform === 'facebook' && '📘'}
                      {feed.platform === 'youtube' && '▶️'}
                    </div>
                    <div className="social-feed-info">
                      <h3>{feed.platform_display || feed.platform.charAt(0).toUpperCase() + feed.platform.slice(1)}</h3>
                      <p>@{feed.handle_or_page_id}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
