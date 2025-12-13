import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatToEthiopian } from '../utils/dateFormatter';

interface RecentItem {
  id: number;
  name?: string;
  title?: string;
  display_name?: string;
  created_at?: string;
  [key: string]: any;
}

interface RecentListProps {
  title: string;
  items: RecentItem[];
  onItemClick?: (item: RecentItem) => void;
  getItemLabel: (item: RecentItem) => string;
}

const RecentList: React.FC<RecentListProps> = ({ title, items, onItemClick, getItemLabel }) => {
  const { i18n } = useTranslation();
  
  if (!items || items.length === 0) {
    return (
      <div className="recent-list">
        <h3>{title}</h3>
        <p className="empty-state">No recent items</p>
      </div>
    );
  }

  return (
    <div className="recent-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={onItemClick ? 'clickable' : ''}
          >
            {getItemLabel(item)}
            {item.created_at && (
              <span className="date">
                {formatToEthiopian(item.created_at, i18n.language)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentList;

