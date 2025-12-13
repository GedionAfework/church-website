/**
 * Convert Ethiopian date to Gregorian date
 * Ethiopian calendar is approximately 7-8 years behind Gregorian
 */
export const ethiopianToGregorian = (ethYear: number, ethMonth: number, ethDay: number): { year: number; month: number; day: number } => {
  // Ethiopian New Year is around September 11/12 in Gregorian calendar
  // Ethiopian year is approximately 7-8 years behind Gregorian
  let gregorianYear = ethYear + 7;
  
  // Adjust for months that cross the year boundary
  // Months 1-5 (Meskerem to Tir) are in the later part of the Gregorian year
  if (ethMonth >= 1 && ethMonth <= 5) {
    gregorianYear = ethYear + 8;
  }
  
  // Ethiopian months have 30 days each (except Pagume which has 5 or 6)
  const ethiopianMonths = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5]; // 13 months
  let daysFromNewYear = 0;
  for (let i = 0; i < ethMonth - 1; i++) {
    daysFromNewYear += ethiopianMonths[i];
  }
  daysFromNewYear += ethDay - 1;
  
  // Ethiopian New Year is around September 11
  const gregorianNewYear = new Date(gregorianYear, 8, 11); // September is month 8 (0-indexed)
  const gregorianDate = new Date(gregorianNewYear);
  gregorianDate.setDate(gregorianDate.getDate() + daysFromNewYear);
  
  return {
    year: gregorianDate.getFullYear(),
    month: gregorianDate.getMonth() + 1,
    day: gregorianDate.getDate(),
  };
};

