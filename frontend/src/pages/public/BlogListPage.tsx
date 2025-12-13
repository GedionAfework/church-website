import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { contentService, type BlogPost } from '../../services/contentService';

const BlogListPage: React.FC = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await contentService.getBlogPosts({
        page,
        status: 'published',
      });
      setPosts(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-list-page">
      <div className="page-header">
        <h1>{t('blog.title') || 'Blog'}</h1>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="empty-state">
              <p>{t('blog.noPosts') || 'No posts found'}</p>
            </div>
          ) : (
            <div className="blog-list">
              {posts.map((post) => (
                <article key={post.id} className="blog-post-card">
                  {post.thumbnail_image && (
                    <div className="blog-post-image">
                      <img src={post.thumbnail_image} alt={post.title} />
                    </div>
                  )}
                  <div className="blog-post-content">
                    <h2>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <div className="blog-post-meta">
                      {post.author_name && (
                        <span>
                          {t('blog.by') || 'By'} {post.author_name}
                        </span>
                      )}
                      {post.published_at && (
                        <span>
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="blog-post-excerpt">
                      {post.content.substring(0, 200)}...
                    </p>
                    <Link to={`/blog/${post.slug}`} className="blog-read-more">
                      {t('blog.readMore') || 'Read More'} →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('common.previous')}
              </button>
              <span>
                {t('common.page')} {page} {t('common.of')} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogListPage;
