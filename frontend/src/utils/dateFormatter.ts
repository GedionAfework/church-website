import { gregorianToEthiopic, format, monthNames } from 'ethiopian-calendar-finova';

/**
 * Format a date string or Date object to Ethiopian calendar
 * @param date - Date string or Date object
 * @param locale - Locale for formatting ('am' for Amharic, 'en' for English)
 * @returns Formatted Ethiopian date string
 */
export const formatToEthiopian = (date: string | Date, locale: string = 'en'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    // Convert Gregorian to Ethiopian - the function expects a Date object
    const ethiopianDate = gregorianToEthiopic(dateObj);

    // Get month name based on locale (month is 0-indexed in the array, but ethiopianDate.month is 1-indexed)
    const monthName = monthNames[locale === 'am' ? 'am' : 'en'][ethiopianDate.month - 1];
    
    // Format: Day Month Year (e.g., "15 መጋቢት 2016" or "15 Megabit 2016")
    return `${ethiopianDate.day} ${monthName} ${ethiopianDate.year}`;
  } catch (error) {
    console.error('Error formatting Ethiopian date:', error);
    // Fallback to Gregorian date if conversion fails
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format a date to Ethiopian calendar with time (if time is available)
 * @param date - Date string or Date object
 * @param locale - Locale for formatting
 * @param includeTime - Whether to include time in the output
 * @returns Formatted Ethiopian date string with optional time
 */
export const formatToEthiopianWithTime = (
  date: string | Date,
  locale: string = 'en',
  includeTime: boolean = false
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    // Convert Gregorian to Ethiopian - the function expects a Date object
    const ethiopianDate = gregorianToEthiopic(dateObj);

    // Get month name based on locale (month is 0-indexed in the array, but ethiopianDate.month is 1-indexed)
    const monthName = monthNames[locale === 'am' ? 'am' : 'en'][ethiopianDate.month - 1];
    const formatted = `${ethiopianDate.day} ${monthName} ${ethiopianDate.year}`;

    if (includeTime) {
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${formatted} ${hours}:${minutes}`;
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting Ethiopian date:', error);
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  }
};

