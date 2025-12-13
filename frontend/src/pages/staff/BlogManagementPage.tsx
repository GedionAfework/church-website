import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { contentService, type BlogPost } from '../../services/contentService';
import apiClient from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { formatToEthiopian } from '../../utils/dateFormatter';
import { useAuth } from '../../contexts/AuthContext';

const BlogManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft' as 'draft' | 'published',
    author: '',
    published_at: '',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [page, searchTerm, statusFilter]);

  // Initialize Quill editor
  useEffect(() => {
    if (showForm && quillRef.current && !quillInstanceRef.current) {
      const quill = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ],
        },
      });

      // Set initial content if editing
      if (editingPost?.content) {
        quill.root.innerHTML = editingPost.content;
      } else if (formData.content) {
        quill.root.innerHTML = formData.content;
      }

      // Update formData when content changes
      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
        setFormData(prev => ({ ...prev, content }));
      });

      quillInstanceRef.current = quill;
    }

    // Cleanup
    return () => {
      if (quillInstanceRef.current && !showForm) {
        quillInstanceRef.current = null;
      }
    };
  }, [showForm, editingPost?.id]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const data = await contentService.getBlogPosts(params);
      setPosts(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(undefined);
    quillInstanceRef.current = null; // Reset Quill instance
    // Auto-set author from logged-in user's member_id
    const authorId = user?.member_id ? user.member_id.toString() : '';
    setFormData({
      title: '',
      content: '',
      status: 'published',
      author: authorId,
      published_at: new Date().toISOString(),
    });
    setThumbnail(null);
    setShowForm(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    quillInstanceRef.current = null; // Reset Quill instance to reinitialize
    // Auto-set author from logged-in user's member_id
    const authorId = user?.member_id ? user.member_id.toString() : '';
    setFormData({
      title: post.title,
      content: post.content,
      status: 'published', // Always published
      author: authorId,
      published_at: post.published_at || new Date().toISOString(),
    });
    setThumbnail(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this post?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await contentService.deleteBlogPost(id);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get content from Quill editor
      const quillContent = quillInstanceRef.current?.root.innerHTML || formData.content;
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', quillContent);
      formDataToSend.append('status', 'published'); // Always published
      if (formData.author) formDataToSend.append('author', formData.author);
      if (formData.published_at) formDataToSend.append('published_at', formData.published_at);
      if (thumbnail) formDataToSend.append('thumbnail_image', thumbnail);

      if (editingPost?.id) {
        await contentService.updateBlogPost(editingPost.id, formDataToSend);
      } else {
        await contentService.createBlogPost(formDataToSend);
      }
      setShowForm(false);
      setEditingPost(undefined);
      quillInstanceRef.current = null;
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert(t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(undefined);
    quillInstanceRef.current = null; // Reset Quill instance
  };

  if (showForm) {
    return (
      <div className="blog-management-page">
        <div className="page-header">
          <h1>
            {editingPost ? t('blog.editPost') || 'Edit Blog Post' : t('blog.addPost') || 'Add Blog Post'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>{t('blog.title') || 'Title'} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('blog.content') || 'Content'} *</label>
            <div 
              ref={quillRef}
              style={{ 
                backgroundColor: 'white',
                minHeight: '300px',
                marginBottom: '50px'
              }}
            />
          </div>
          <div className="form-group">
            <label>{t('blog.thumbnail') || 'Thumbnail Image'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setThumbnail(e.target.files[0]);
                }
              }}
            />
            {editingPost?.thumbnail_image && !thumbnail && (
              <img
                src={editingPost.thumbnail_image}
                alt="Current thumbnail"
                style={{ width: '200px', marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-actions">
            <button type="submit">{t('common.save')}</button>
            <button type="button" onClick={handleCancel}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="blog-management-page">
      <div className="page-header">
        <h1>{t('content.blog')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('blog.addPost') || 'Add Post'}
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('blog.allStatuses') || 'All Statuses'}</option>
          <option value="draft">{t('blog.statusDraft') || 'Draft'}</option>
          <option value="published">{t('blog.statusPublished') || 'Published'}</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('blog.title') || 'Title'}</th>
                  <th>{t('blog.author') || 'Author'}</th>
                  <th>{t('blog.status') || 'Status'}</th>
                  <th>{t('blog.publishedAt') || 'Published'}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      {t('blog.noPosts') || 'No posts found'}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id}>
                      <td><strong>{post.title}</strong></td>
                      <td>{post.author_name || '-'}</td>
                      <td>
                        <span className={`badge ${post.status === 'published' ? 'active' : 'inactive'}`}>
                          {post.status === 'published'
                            ? t('blog.statusPublished') || 'Published'
                            : t('blog.statusDraft') || 'Draft'}
                        </span>
                      </td>
                      <td>
                        {post.published_at
                          ? formatToEthiopian(post.published_at, i18n.language)
                          : '-'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(post)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (post.id) {
                              handleDelete(post.id);
                            }
                          }}
                          className="btn-sm btn-delete"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

export default BlogManagementPage;
