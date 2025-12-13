import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contentService, type Photo } from '../../services/contentService';
import EthiopianDateInput from '../../components/EthiopianDateInput';

const PhotosPage: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [bulkUploadMode, setBulkUploadMode] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPhotos();
  }, [page, yearFilter]);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  const fetchAvailableYears = async () => {
    try {
      const response = await contentService.getPhotos({ page_size: 1000 });
      const years = new Set<number>();
      response.results.forEach((photo) => {
        if (photo.year) {
          years.add(photo.year);
        }
      });
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (yearFilter) params.year = Number(yearFilter);

      const data = await contentService.getPhotos(params);
      setPhotos(data.results);
      setTotalPages(Math.ceil(data.count / 20));
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      date: '',
    });
    setImage(null);
    setImages([]);
    setBulkUploadMode(false);
    setShowForm(true);
  };


  const handleDelete = async (id: number) => {
    if (!window.confirm(t('photos.confirmDelete') || 'Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await contentService.deletePhoto(id);
      fetchPhotos();
      fetchAvailableYears();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Handle bulk upload
      if (bulkUploadMode && images.length > 0) {
        const bulkFormData = new FormData();
        bulkFormData.append('date', formData.date);
        
        // Append all images
        images.forEach((img) => {
          bulkFormData.append('images', img);
        });
        
        const result = await contentService.bulkCreatePhotos(bulkFormData);
        
        if (result.errors && result.errors.length > 0) {
          alert(`${result.created || result.photos?.length || 0} photos created. Some errors occurred.`);
        } else {
          alert(`${result.photos?.length || result.created || images.length} photos created successfully!`);
        }
        
        setShowForm(false);
        setEditingPhoto(undefined);
        setImages([]);
        setBulkUploadMode(false);
        fetchPhotos();
        fetchAvailableYears();
        return;
      }

      // Handle single photo upload/edit
      const formDataToSend = new FormData();
      
      formDataToSend.append('date', formData.date);
      // Year will be auto-populated from date in the backend
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await contentService.createPhoto(formDataToSend);

      setShowForm(false);
      setImage(null);
      fetchPhotos();
      fetchAvailableYears();
    } catch (error: any) {
      console.error('Error saving photo:', error);
      alert(error.response?.data?.detail || t('common.error'));
    }
  };

  const handleDateChange = (value: string) => {
    setFormData({ date: value });
  };

  if (showForm) {
    return (
      <div className="photos-page">
        <div className="page-header">
          <h1>{t('photos.addPhoto')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="photo-form">
          <div className="form-group checkbox" style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={bulkUploadMode}
                onChange={(e) => {
                  setBulkUploadMode(e.target.checked);
                  if (e.target.checked) {
                    setImage(null);
                  } else {
                    setImages([]);
                  }
                }}
              />
              {t('photos.bulkUpload') || 'Upload Multiple Images'}
            </label>
          </div>

          <div className="form-group">
            <label>
              {bulkUploadMode ? t('photos.images') || 'Images' : t('photos.image')} *
            </label>
            {bulkUploadMode ? (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setImages(Array.from(e.target.files));
                  }
                }}
                required={images.length === 0}
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(e.target.files[0]);
                  }
                }}
                required
              />
            )}
            {bulkUploadMode && images.length > 0 && (
              <p className="form-help-text">
                {t('photos.selectedImages') || 'Selected'}: {images.length} {t('photos.images') || 'images'}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>{t('photos.date')} *</label>
            <EthiopianDateInput
              value={formData.date}
              onChange={handleDateChange}
              type="date"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {t('common.save')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
              }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="photos-page">
      <div className="page-header">
        <h1>{t('photos.title')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          {t('photos.addPhoto')}
        </button>
      </div>

      <div className="filters">
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('photos.allYears') || 'All Years'}</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          {photos.length === 0 ? (
            <p className="empty-state">{t('photos.noPhotos') || 'No photos found'}</p>
          ) : (
            <div className="photos-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="photo-card" 
                  style={{
                    position: 'relative',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <img 
                    src={photo.image as string} 
                    alt="Photo" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  <button
                    onClick={() => photo.id && handleDelete(photo.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#dc3545',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.color = '#dc3545';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title={t('common.delete')}
                  >
                    ×
                  </button>
                </div>
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

export default PhotosPage;

