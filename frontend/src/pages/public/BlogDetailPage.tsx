import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contentService, type BlogPost } from '../../services/contentService';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentService.getBlogPostBySlug(slug!);
      setPost(data);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.detail || t('blog.postNotFound') || 'Post not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-page">
        <div className="error">{error || t('blog.postNotFound') || 'Post not found'}</div>
        <Link to="/blog" className="btn-primary">
          {t('blog.backToBlog') || 'Back to Blog'}
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <Link to="/blog" className="back-link">
        ← {t('blog.backToBlog') || 'Back to Blog'}
      </Link>

      <article className="blog-post">
        {post.thumbnail_image && (
          <div className="blog-post-header-image">
            <img src={post.thumbnail_image} alt={post.title} />
          </div>
        )}

        <header className="blog-post-header">
          <h1>{post.title}</h1>
          <div className="blog-post-meta">
            {post.author_name && (
              <span>
                {t('blog.by') || 'By'} <strong>{post.author_name}</strong>
              </span>
            )}
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </header>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
};

export default BlogDetailPage;
