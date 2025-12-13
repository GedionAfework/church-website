import React, { useState, useEffect } from 'react';
import { gregorianToEthiopic } from 'ethiopian-calendar-finova';
import { monthNames } from 'ethiopian-calendar-finova';
import { useTranslation } from 'react-i18next';
import { ethiopianToGregorian } from '../utils/ethiopianConverter';

interface EthiopianDateInputProps {
  value: string; // ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  onChange: (value: string) => void;
  type?: 'date' | 'datetime-local';
  required?: boolean;
  className?: string;
}

const EthiopianDateInput: React.FC<EthiopianDateInputProps> = ({
  value,
  onChange,
  type = 'date',
  required = false,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  // Convert Gregorian to Ethiopian for display
  const getEthiopianDate = (gregorianDate: string): { day: number; month: number; year: number } | null => {
    if (!gregorianDate) return null;
    try {
      const date = new Date(gregorianDate);
      if (isNaN(date.getTime())) return null;
      return gregorianToEthiopic(date);
    } catch {
      return null;
    }
  };

  // Convert Ethiopian to Gregorian for storage
  const convertToGregorian = (day: number, month: number, year: number): string => {
    try {
      const gregorianDate = ethiopianToGregorian(year, month, day);
      const date = new Date(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day);
      
      if (type === 'datetime-local' && value && value.includes('T')) {
        // Preserve time if it's datetime-local
        const timePart = value.split('T')[1];
        return `${date.toISOString().split('T')[0]}T${timePart || '00:00'}`;
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error converting Ethiopian to Gregorian:', error);
      return '';
    }
  };

  const ethDate = getEthiopianDate(value);
  const [day, setDay] = useState(ethDate?.day || '');
  const [month, setMonth] = useState(ethDate?.month || '');
  const [year, setYear] = useState(ethDate?.year || '');

  useEffect(() => {
    const ethDate = getEthiopianDate(value);
    if (ethDate) {
      setDay(ethDate.day);
      setMonth(ethDate.month);
      setYear(ethDate.year);
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = parseInt(e.target.value) || 0;
    if (newDay >= 1 && newDay <= 30 && month && year) {
      setDay(newDay);
      onChange(convertToGregorian(newDay, month, year));
    } else {
      setDay(newDay || '');
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value) || 0;
    if (newMonth >= 1 && newMonth <= 13 && day && year) {
      setMonth(newMonth);
      onChange(convertToGregorian(day, newMonth, year));
    } else {
      setMonth(newMonth || '');
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value) || 0;
    if (newYear >= 1900 && newYear <= 2100 && day && month) {
      setYear(newYear);
      onChange(convertToGregorian(day, month, newYear));
    } else {
      setYear(newYear || '');
    }
  };

  const monthOptions = monthNames[locale === 'am' ? 'am' : 'en'].map((name, index) => ({
    value: index + 1,
    label: name,
  }));

  return (
    <div className={`ethiopian-date-input ${className}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        type="number"
        placeholder="Day"
        value={day || ''}
        onChange={handleDayChange}
        min={1}
        max={30}
        style={{ width: '60px', padding: '8px' }}
        required={required}
      />
      <select
        value={month || ''}
        onChange={handleMonthChange}
        style={{ flex: 1, padding: '8px' }}
        required={required}
      >
        <option value="">Month</option>
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Year"
        value={year || ''}
        onChange={handleYearChange}
        min={1900}
        max={2100}
        style={{ width: '80px', padding: '8px' }}
        required={required}
      />
      {type === 'datetime-local' && value && (
        <input
          type="time"
          value={value.includes('T') ? value.split('T')[1] : '00:00'}
          onChange={(e) => {
            const datePart = value.split('T')[0];
            onChange(`${datePart}T${e.target.value}`);
          }}
          style={{ padding: '8px' }}
        />
      )}
    </div>
  );
};

export default EthiopianDateInput;

