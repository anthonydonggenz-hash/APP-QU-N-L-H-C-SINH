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

export function parseDateSafe(date: Date | string): Date {
  if (date instanceof Date) return date;
  if (typeof date === "string") {
    // If format is YYYY-MM-DD
    const isoMatch = date.split("T")[0].match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      return new Date(year, month, day);
    }
    // If format is DD/MM/YYYY
    const viMatch = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (viMatch) {
      const day = parseInt(viMatch[1], 10);
      const month = parseInt(viMatch[2], 10) - 1;
      const year = parseInt(viMatch[3], 10);
      return new Date(year, month, day);
    }
    return new Date(date);
  }
  return new Date();
}

export function formatDayOfWeekVi(date: Date | string = new Date()): string {
  const d = parseDateSafe(date);
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return days[d.getDay()];
}

export function formatDateVi(date: Date | string = new Date()): string {
  if (typeof date === "string") {
    const isoMatch = date.split("T")[0].match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const day = isoMatch[3].padStart(2, "0");
      const month = isoMatch[2].padStart(2, "0");
      const year = isoMatch[1];
      return `${day}/${month}/${year}`;
    }
  }
  const d = parseDateSafe(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatFullDateVi(date: Date | string = new Date()): string {
  const d = parseDateSafe(date);
  const dayOfWeek = formatDayOfWeekVi(d);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${dayOfWeek}, ngày ${day}/${month}/${year}`;
}

export function formatFormalDateVi(date: Date | string = new Date()): string {
  const d = parseDateSafe(date);
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

/**
 * Steps a dateISO string (YYYY-MM-DD) by delta days.
 */
export function stepDateISO(dateISO: string, deltaDays: number): string {
  try {
    const parts = dateISO.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + deltaDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return dateISO;
  }
}

/**
 * Returns the list of months in the 2026-2027 school year.
 */
export function getSchoolYearMonths(): Array<{ key: string; month: number; year: number; label: string }> {
  return [
    { key: "2026-09", month: 9, year: 2026, label: "Tháng 09/2026" },
    { key: "2026-10", month: 10, year: 2026, label: "Tháng 10/2026" },
    { key: "2026-11", month: 11, year: 2026, label: "Tháng 11/2026" },
    { key: "2026-12", month: 12, year: 2026, label: "Tháng 12/2026" },
    { key: "2027-01", month: 1, year: 2027, label: "Tháng 01/2027" },
    { key: "2027-02", month: 2, year: 2027, label: "Tháng 02/2027" },
    { key: "2027-03", month: 3, year: 2027, label: "Tháng 03/2027" },
    { key: "2027-04", month: 4, year: 2027, label: "Tháng 04/2027" },
    { key: "2027-05", month: 5, year: 2027, label: "Tháng 05/2027" },
  ];
}
