import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contentService, type SocialFeedConfig } from '../../services/contentService';

const SocialFeedsPage: React.FC = () => {
  const { t } = useTranslation();
  const [feeds, setFeeds] = useState<SocialFeedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<SocialFeedConfig | undefined>();
  const [formData, setFormData] = useState({
    platform: 'instagram' as 'instagram' | 'facebook' | 'youtube',
    handle_or_page_id: '',
    api_key_or_token: '',
    is_active: true,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeeds();
  }, [page]);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const data = await contentService.getSocialFeeds({ page });
      setFeeds(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching social feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFeed(undefined);
    setFormData({
      platform: 'instagram',
      handle_or_page_id: '',
      api_key_or_token: '',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleEdit = (feed: SocialFeedConfig) => {
    setEditingFeed(feed);
    setFormData({
      platform: feed.platform,
      handle_or_page_id: feed.handle_or_page_id,
      api_key_or_token: feed.api_key_or_token || '',
      is_active: feed.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this social feed config?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await contentService.deleteSocialFeed(id);
      fetchFeeds();
    } catch (error) {
      console.error('Error deleting social feed:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeed?.id) {
        await contentService.updateSocialFeed(editingFeed.id, formData);
      } else {
        await contentService.createSocialFeed(formData);
      }
      setShowForm(false);
      setEditingFeed(undefined);
      fetchFeeds();
    } catch (error) {
      console.error('Error saving social feed:', error);
      alert(t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFeed(undefined);
  };

  if (showForm) {
    return (
      <div className="social-feeds-page">
        <div className="page-header">
          <h1>
            {editingFeed
              ? t('socialFeeds.editFeed') || 'Edit Social Feed'
              : t('socialFeeds.addFeed') || 'Add Social Feed'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>{t('socialFeeds.platform') || 'Platform'} *</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as SocialFeedConfig['platform'] })}
              required
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('socialFeeds.handleOrPageId') || 'Handle or Page ID'} *</label>
            <input
              type="text"
              value={formData.handle_or_page_id}
              onChange={(e) => setFormData({ ...formData, handle_or_page_id: e.target.value })}
              placeholder="@username or page_id"
              required
            />
          </div>
          <div className="form-group">
            <label>{t('socialFeeds.apiKeyOrToken') || 'API Key or Token'}</label>
            <input
              type="password"
              value={formData.api_key_or_token}
              onChange={(e) => setFormData({ ...formData, api_key_or_token: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              {t('dashboard.active')}
            </label>
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
    <div className="social-feeds-page">
      <div className="page-header">
        <h1>{t('content.socialFeeds')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('socialFeeds.addFeed') || 'Add Social Feed'}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('socialFeeds.platform') || 'Platform'}</th>
                  <th>{t('socialFeeds.handleOrPageId') || 'Handle/Page ID'}</th>
                  <th>{t('dashboard.active')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {feeds.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      {t('socialFeeds.noFeeds') || 'No social feeds found'}
                    </td>
                  </tr>
                ) : (
                  feeds.map((feed) => (
                    <tr key={feed.id}>
                      <td><strong>{feed.platform}</strong></td>
                      <td>{feed.handle_or_page_id}</td>
                      <td>
                        <span className={`badge ${feed.is_active ? 'active' : 'inactive'}`}>
                          {feed.is_active ? t('dashboard.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(feed)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (feed.id) {
                              handleDelete(feed.id);
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

export default SocialFeedsPage;
