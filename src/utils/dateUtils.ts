/**
 * Helper utilities to compute real-time dates, weeks, and school terms
 * in Vietnamese format.
 */

export function getCurrentDate(): Date {
  return new Date();
}

export function getCurrentDateISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDayOfWeekVi(date: Date = new Date()): string {
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return days[date.getDay()];
}

export function formatDateVi(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatFullDateVi(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dayOfWeek = formatDayOfWeekVi(d);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${dayOfWeek}, ngày ${day}/${month}/${year}`;
}

export function formatFormalDateVi(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `Ngày ${day} tháng ${month} năm ${year}`;
}

/**
 * Calculates current school week based on Vietnamese school year
 * (typically beginning the first week of September).
 */
export function getCurrentWeekRange(date: Date = new Date()): {
  weekNumber: number;
  label: string;
  startDateStr: string;
  endDateStr: string;
  rangeText: string;
} {
  const d = new Date(date);
  const currentDay = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  // Approximate school week starting from Sept 5
  // For Sept 2026: Sept 7 - 12 is Week 1
  const startOfSchool = new Date(d.getFullYear(), 8, 5); // Sept 5
  const diffTime = monday.getTime() - startOfSchool.getTime();
  let weekNumber = Math.max(1, Math.ceil(diffTime / (7 * 24 * 3600 * 1000)));
  if (d.getMonth() < 8) {
    // If in second semester (Jan - May)
    weekNumber = 19 + Math.max(1, Math.floor(d.getMonth() * 4));
  }

  const startDateStr = formatDateVi(monday);
  const endDateStr = formatDateVi(saturday);

  return {
    weekNumber,
    label: `Tuần ${weekNumber}`,
    startDateStr,
    endDateStr,
    rangeText: `Từ ${startDateStr} đến ${endDateStr}`,
  };
}

export function getLastWeekRange(date: Date = new Date()): {
  weekNumber: number;
  label: string;
  startDateStr: string;
  endDateStr: string;
  rangeText: string;
} {
  const lastWeekDate = new Date(date);
  lastWeekDate.setDate(date.getDate() - 7);
  const current = getCurrentWeekRange(lastWeekDate);
  return {
    ...current,
    label: current.weekNumber > 0 ? `Tuần ${current.weekNumber}` : "Tuần tựu trường",
  };
}

export function getMonthInfo(date: Date = new Date(), monthOffset = 0): {
  month: number;
  year: number;
  label: string;
  title: string;
  subtitle: string;
} {
  const targetDate = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const month = targetDate.getMonth() + 1;
  const year = targetDate.getFullYear();
  const monthPadded = String(month).padStart(2, "0");

  return {
    month,
    year,
    label: `Tháng ${monthPadded}`,
    title: `Tháng ${monthPadded}/${year}`,
    subtitle: `Tháng ${monthPadded}/${year} (Năm học ${year}-${year + 1})`,
  };
}
