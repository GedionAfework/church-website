import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contentService, type HeroSection } from '../../services/contentService';
import { formatToEthiopian } from '../../utils/dateFormatter';
import EthiopianDateInput from '../../components/EthiopianDateInput';

const HeroSectionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [heros, setHeros] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | undefined>();
  const [formData, setFormData] = useState<Partial<HeroSection>>({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    start_date: '',
    end_date: '',
    layout: 'classic',
    text_alignment: 'center',
    button_variant: 'primary',
    title_color: '#000000',
    subtitle_color: '#666666',
    overlay_opacity: 0.5,
    extra_classes: '',
  });
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHeros();
  }, [page]);

  const fetchHeros = async () => {
    setLoading(true);
    try {
      const data = await contentService.getHeroSections({ page });
      setHeros(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching hero sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHero(undefined);
    setFormData({
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      start_date: '',
      end_date: '',
      layout: 'classic',
      text_alignment: 'center',
      button_variant: 'primary',
      title_color: '#000000',
      subtitle_color: '#666666',
      overlay_opacity: 0.5,
      extra_classes: '',
    });
    setBackgroundImage(null);
    setShowForm(true);
  };

  const handleEdit = (hero: HeroSection) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle || '',
      button_text: hero.button_text || '',
      button_link: hero.button_link || '',
      start_date: hero.start_date ? hero.start_date.split('T')[0] + 'T' + hero.start_date.split('T')[1]?.substring(0, 5) : '',
      end_date: hero.end_date ? hero.end_date.split('T')[0] + 'T' + hero.end_date.split('T')[1]?.substring(0, 5) : '',
      layout: hero.layout,
      text_alignment: hero.text_alignment,
      button_variant: hero.button_variant,
      title_color: hero.title_color || '#000000',
      subtitle_color: hero.subtitle_color || '#666666',
      overlay_opacity: hero.overlay_opacity || 0.5,
      extra_classes: hero.extra_classes || '',
    });
    setBackgroundImage(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmMessage = t('common.confirmDelete') || 'Are you sure you want to delete this hero section?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await contentService.deleteHeroSection(id);
      fetchHeros();
    } catch (error) {
      console.error('Error deleting hero section:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate background image
    if (!editingHero && !backgroundImage) {
      alert(t('hero.backgroundImageRequired') || 'Background image is required');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Background image is required for new, optional for updates
      if (backgroundImage) {
        formDataToSend.append('background_image', backgroundImage);
      } else if (!editingHero) {
        alert(t('hero.backgroundImageRequired') || 'Background image is required');
        return;
      }

      if (editingHero?.id) {
        await contentService.updateHeroSection(editingHero.id, formDataToSend);
      } else {
        await contentService.createHeroSection(formDataToSend);
      }
      setShowForm(false);
      setEditingHero(undefined);
      fetchHeros();
    } catch (error) {
      console.error('Error saving hero section:', error);
      alert(t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHero(undefined);
  };

  if (showForm) {
    return (
      <div className="hero-section-page">
        <div className="page-header">
          <h1>
            {editingHero
              ? t('hero.editHero') || 'Edit Hero Section'
              : t('hero.addHero') || 'Add Hero Section'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>{t('hero.title') || 'Title'}</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('hero.subtitle') || 'Subtitle'}</label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('hero.buttonText') || 'Button Text'}</label>
              <input
                type="text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('hero.buttonLink') || 'Button Link'}</label>
              <input
                type="url"
                value={formData.button_link}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('hero.startDate') || 'Start Date'}</label>
              <EthiopianDateInput
                value={formData.start_date || ''}
                onChange={(value) => setFormData({ ...formData, start_date: value })}
                type="datetime-local"
              />
            </div>
            <div className="form-group">
              <label>{t('hero.endDate') || 'End Date'}</label>
              <EthiopianDateInput
                value={formData.end_date || ''}
                onChange={(value) => setFormData({ ...formData, end_date: value })}
                type="datetime-local"
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('hero.backgroundImage') || 'Background Image'} *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setBackgroundImage(e.target.files[0]);
                }
              }}
              required={!editingHero}
            />
            {editingHero?.background_image && !backgroundImage && (
              <img
                src={editingHero.background_image}
                alt="Current background"
                style={{ width: '300px', marginTop: '10px' }}
              />
            )}
            {!editingHero && (
              <p className="form-help-text">{t('hero.backgroundImageRequired') || 'Background image is required'}</p>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('hero.layout') || 'Layout'} *</label>
              <select
                value={formData.layout}
                onChange={(e) => setFormData({ ...formData, layout: e.target.value as HeroSection['layout'] })}
                required
              >
                <option value="classic">{t('hero.layoutClassic') || 'Classic'}</option>
                <option value="left_image">{t('hero.layoutLeftImage') || 'Image Left'}</option>
                <option value="right_image">{t('hero.layoutRightImage') || 'Image Right'}</option>
                <option value="overlay_dark">{t('hero.layoutOverlayDark') || 'Dark Overlay'}</option>
                <option value="overlay_light">{t('hero.layoutOverlayLight') || 'Light Overlay'}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('hero.textAlignment') || 'Text Alignment'} *</label>
              <select
                value={formData.text_alignment}
                onChange={(e) => setFormData({ ...formData, text_alignment: e.target.value as HeroSection['text_alignment'] })}
                required
              >
                <option value="left">{t('hero.alignmentLeft') || 'Left'}</option>
                <option value="center">{t('hero.alignmentCenter') || 'Center'}</option>
                <option value="right">{t('hero.alignmentRight') || 'Right'}</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('hero.buttonVariant') || 'Button Variant'} *</label>
              <select
                value={formData.button_variant}
                onChange={(e) => setFormData({ ...formData, button_variant: e.target.value as HeroSection['button_variant'] })}
                required
              >
                <option value="primary">{t('hero.variantPrimary') || 'Primary'}</option>
                <option value="outline">{t('hero.variantOutline') || 'Outline'}</option>
                <option value="ghost">{t('hero.variantGhost') || 'Ghost'}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('hero.overlayOpacity') || 'Overlay Opacity'}</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.overlay_opacity}
                onChange={(e) => setFormData({ ...formData, overlay_opacity: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('hero.titleColor') || 'Title Color'}</label>
              <input
                type="color"
                value={formData.title_color}
                onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('hero.subtitleColor') || 'Subtitle Color'}</label>
              <input
                type="color"
                value={formData.subtitle_color}
                onChange={(e) => setFormData({ ...formData, subtitle_color: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('hero.extraClasses') || 'Extra CSS Classes'}</label>
            <input
              type="text"
              value={formData.extra_classes}
              onChange={(e) => setFormData({ ...formData, extra_classes: e.target.value })}
              placeholder="e.g., custom-class another-class"
            />
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
    <div className="hero-section-page">
      <div className="page-header">
        <h1>{t('content.heroSection')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('hero.addHero') || 'Add Hero Section'}
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
                  <th>{t('hero.title') || 'Title'}</th>
                  <th>{t('hero.layout') || 'Layout'}</th>
                  <th>{t('hero.startDate') || 'Start Date'}</th>
                  <th>{t('hero.endDate') || 'End Date'}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {heros.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {t('hero.noHeros') || 'No hero sections found'}
                    </td>
                  </tr>
                ) : (
                  heros.map((hero) => (
                    <tr key={hero.id}>
                      <td><strong>{hero.title}</strong></td>
                      <td>{hero.layout}</td>
                      <td>
                        {hero.start_date
                          ? formatToEthiopian(hero.start_date, i18n.language)
                          : '-'}
                      </td>
                      <td>
                        {hero.end_date
                          ? formatToEthiopian(hero.end_date, i18n.language)
                          : '-'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(hero)}
                          className="btn-sm btn-edit"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (hero.id) {
                              handleDelete(hero.id);
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

export default HeroSectionPage;
