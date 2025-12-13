import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contentService, type Photo } from '../../services/contentService';
import { formatToEthiopian } from '../../utils/dateFormatter';

const PhotosPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Group photos by date for display
  const groupedPhotos = photos.reduce((acc, photo) => {
    const date = photo.date || '';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <div className="photos-page public">
      <div className="page-header">
        <h1>{t('photos.title') || 'Photos'}</h1>
      </div>

      <div className="filters" style={{ marginBottom: '30px' }}>
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setPage(1);
          }}
          style={{ padding: '10px', fontSize: '16px' }}
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
            <>
              {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
                <div key={date} className="photo-date-group" style={{ marginBottom: '40px' }}>
                  <h2 className="photo-date-header" style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    marginBottom: '20px',
                    color: '#333',
                    borderBottom: '2px solid #667eea',
                    paddingBottom: '10px'
                  }}>
                    {formatToEthiopian(date, i18n.language)}
                  </h2>
                  <div className="photos-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    {datePhotos.map((photo) => (
                      <div key={photo.id} className="photo-card" style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        // Open image in lightbox or new tab
                        window.open(photo.image as string, '_blank');
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
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
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {totalPages > 1 && (
            <div className="pagination" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              marginTop: '40px'
            }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                {t('common.previous')}
              </button>
              <span style={{ fontSize: '16px' }}>
                {t('common.page')} {page} {t('common.of')} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
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

