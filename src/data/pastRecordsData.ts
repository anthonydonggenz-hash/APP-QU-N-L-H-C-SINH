import { Student, DailyRecordEntry, DailyHistoryMap } from "../types.ts";
import { formatDateVi, formatDayOfWeekVi } from "../utils/dateUtils.ts";

const STORAGE_KEY = "thaydong_past_daily_records";

/**
 * Builds default historical data for previous school days of early September 2026.
 */
export function buildDefaultHistoricalRecords(students: Student[]): DailyHistoryMap {
  const history: DailyHistoryMap = {};

  // 1. Thứ Năm - 10/09/2026: 19/20 có mặt, 1 vắng phép (Lê Ngọc Hân bị cảm sốt)
  history["2026-09-10"] = {};
  students.forEach((s) => {
    if (s.id === 3) {
      // Lê Ngọc Hân
      history["2026-09-10"][s.id] = {
        attendance: "Vắng phép",
        status: "Bình thường",
        stars: 0,
        note: "Sốt nhẹ, phụ huynh gọi điện xin phép nghỉ 1 buổi.",
      };
    } else if (s.id === 2) {
      // Trần Bảo Khoa
      history["2026-09-10"][s.id] = {
        attendance: "Có mặt",
        status: "Tốt",
        stars: 3,
        note: "Phát biểu hăng hái, giải nhanh bài toán khó trên bảng.",
      };
    } else {
      history["2026-09-10"][s.id] = {
        attendance: "Có mặt",
        status: s.status || "Tốt",
        stars: Math.max(1, (s.stars || 10) % 3 + 1),
        note: "Hoàn thành tốt nhiệm vụ học tập trong ngày.",
      };
    }
  });

  // 2. Thứ Tư - 09/09/2026: 20/20 có mặt đầy đủ, Kiểm tra đầu năm môn Toán
  history["2026-09-09"] = {};
  students.forEach((s) => {
    history["2026-09-09"][s.id] = {
      attendance: "Có mặt",
      status: s.status === "Cần quan tâm" ? "Tiến bộ" : "Tốt",
      stars: 2,
      note: "Cả lớp làm bài khảo sát năng lực đầu năm nghiêm túc.",
    };
  });

  // 3. Thứ Ba - 08/09/2026: 19/20 có mặt, 1 em đi muộn 10 phút do mưa
  history["2026-09-08"] = {};
  students.forEach((s) => {
    if (s.id === 1) {
      history["2026-09-08"][s.id] = {
        attendance: "Có mặt",
        status: "Tốt",
        stars: 3,
        note: "Quản lớp xếp hàng ra vào lớp nghiêm túc, tác phong mẫu mực.",
      };
    } else if (s.id === 4) {
      history["2026-09-08"][s.id] = {
        attendance: "Đi muộn",
        status: "Bình thường",
        stars: 1,
        note: "Đến muộn 10 phút do trời mưa to kẹt xe.",
      };
    } else {
      history["2026-09-08"][s.id] = {
        attendance: "Có mặt",
        status: s.status || "Tốt",
        stars: 2,
        note: "Tập trung nghe giảng, chuẩn bị đầy đủ sách vở.",
      };
    }
  });

  // 4. Thứ Hai - 07/09/2026: Tiết chào cờ đầu tuần đầu tiên của năm học
  history["2026-09-07"] = {};
  students.forEach((s) => {
    history["2026-09-07"][s.id] = {
      attendance: "Có mặt",
      status: "Tốt",
      stars: 3,
      note: "Chào cờ đầu tuần nghiêm túc, hát Quốc ca to rõ.",
    };
  });

  // 5. Thứ Bảy - 05/09/2026: Lễ Khai giảng năm học mới 2026 - 2027
  history["2026-09-05"] = {};
  students.forEach((s) => {
    history["2026-09-05"][s.id] = {
      attendance: "Có mặt",
      status: "Tốt",
      stars: 5,
      note: "Dự lễ khai giảng trang nghiêm, đồng phục chỉnh tề, hân hoan đón năm học mới.",
    };
  });

  return history;
}

/**
 * Loads daily history from localStorage or initializes with defaults.
 */
export function loadDailyHistory(students: Student[]): DailyHistoryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading daily history:", e);
  }

  const defaults = buildDefaultHistoricalRecords(students);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch (e) {
    console.error(e);
  }
  return defaults;
}

/**
 * Persists daily history map to localStorage.
 */
export function saveDailyHistory(history: DailyHistoryMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Error saving daily history:", e);
  }
}

/**
 * Retrieves records for a specific date (ISO format YYYY-MM-DD).
 * If no record exists, dynamically creates a sensible baseline from current students.
 */
export function getDailyRecordForDate(
  dateISO: string,
  history: DailyHistoryMap,
  students: Student[]
): Record<number, DailyRecordEntry> {
  if (history[dateISO]) {
    return history[dateISO];
  }

  // Create baseline if not recorded yet
  const baseline: Record<number, DailyRecordEntry> = {};
  students.forEach((s) => {
    baseline[s.id] = {
      attendance: "Có mặt",
      status: s.status || "Tốt",
      stars: 2,
      note: "Hoàn thành nhiệm vụ học tập.",
    };
  });
  return baseline;
}

/**
 * Gets a sorted list of recorded past dates and school year milestones.
 */
export function getAvailableRecordedDates(
  history: DailyHistoryMap,
  excludeDateISO?: string
): Array<{ dateISO: string; label: string; dateFormatted: string; dayOfWeek: string; isRecorded?: boolean }> {
  // Combine custom recorded dates with school year key dates
  const recordedSet = new Set(Object.keys(history));

  // Key school year milestone dates (2026 - 2027)
  const milestoneDates: Array<{ dateISO: string; eventName: string }> = [
    { dateISO: "2026-09-03", eventName: "Tháng 9: Tập trung nhận lớp & SGK đầu năm" },
    { dateISO: "2026-09-04", eventName: "Tháng 9: Tập dượt Lễ Khai giảng" },
    { dateISO: "2026-09-05", eventName: "Lễ Khai giảng năm học mới 2026 - 2027" },
    { dateISO: "2026-09-07", eventName: "Tuần 1: Tiết Chào cờ đầu tiên" },
    { dateISO: "2026-09-08", eventName: "Tuần 1: Rèn nề nếp xếp hàng" },
    { dateISO: "2026-09-09", eventName: "Tuần 1: Khảo sát Toán đầu năm" },
    { dateISO: "2026-09-10", eventName: "Hôm qua: Hoạt động học sôi nổi" },
    { dateISO: "2026-09-11", eventName: "Hôm nay: Sinh hoạt lớp cuối tuần" },
    { dateISO: "2026-09-15", eventName: "Tuần 2: Thi đua hoa điểm 10" },
    { dateISO: "2026-09-21", eventName: "Tuần 3: Sinh hoạt Sao nhi đồng" },
    { dateISO: "2026-10-05", eventName: "Tháng 10: Tuần lễ hưởng ứng học tập suốt đời" },
    { dateISO: "2026-10-15", eventName: "Tháng 10: Hội thi Vở sạch - Chữ đẹp" },
    { dateISO: "2026-10-20", eventName: "Tháng 10: Hoạt động chào mừng 20/10" },
    { dateISO: "2026-11-02", eventName: "Tháng 11: Phát động đợt thi đua 20/11" },
    { dateISO: "2026-11-20", eventName: "Tháng 11: Ngày Nhà giáo Việt Nam" },
    { dateISO: "2026-12-07", eventName: "Tháng 12: Ôn tập học kỳ I" },
    { dateISO: "2026-12-22", eventName: "Tháng 12: Kỷ niệm ngày thành lập QĐNDVN" },
    { dateISO: "2026-12-25", eventName: "Tháng 12: Kiểm tra định kỳ cuối HK1" },
    { dateISO: "2027-01-04", eventName: "Tháng 1: Khởi động Học kỳ II" },
    { dateISO: "2027-01-15", eventName: "Tháng 1: Sơ kết học kỳ I" },
    { dateISO: "2027-01-22", eventName: "Tháng 1: Hội xuân & Đón Tết Nguyên Đán" },
    { dateISO: "2027-02-08", eventName: "Tháng 2: Tựu trường sau Tết" },
    { dateISO: "2027-03-08", eventName: "Tháng 3: Kỷ niệm Quốc tế Phụ nữ" },
    { dateISO: "2027-03-26", eventName: "Tháng 3: Ngày thành lập Đoàn TNCS" },
    { dateISO: "2027-04-16", eventName: "Tháng 4: Giỗ Tổ Hùng Vương" },
    { dateISO: "2027-04-30", eventName: "Tháng 4: Chào mừng 30/4 - 1/5" },
    { dateISO: "2027-05-15", eventName: "Tháng 5: Kiểm tra cuối Học kỳ II" },
    { dateISO: "2027-05-19", eventName: "Tháng 5: Kỷ niệm sinh nhật Bác Hồ" },
    { dateISO: "2027-05-25", eventName: "Tháng 5: Lễ Bế giảng năm học 2026-2027" },
  ];

  milestoneDates.forEach((m) => recordedSet.add(m.dateISO));
  if (excludeDateISO) {
    recordedSet.delete(excludeDateISO);
  }

  const allDates = Array.from(recordedSet);
  // Sort by date: show September 2026 first or chronologically
  allDates.sort((a, b) => a.localeCompare(b));

  return allDates.map((dateISO) => {
    const parts = dateISO.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = formatDayOfWeekVi(d);
    const dateFormatted = formatDateVi(d);
    const milestone = milestoneDates.find((m) => m.dateISO === dateISO);

    let label = `${dateFormatted} (${dayOfWeek})`;
    if (milestone) {
      label = `${dateFormatted} (${dayOfWeek}) - ${milestone.eventName}`;
    } else if (dateISO === "2026-09-10") {
      label = `10/09/2026 (Thứ Năm) - Hôm qua`;
    }

    return {
      dateISO,
      label,
      dateFormatted,
      dayOfWeek,
      isRecorded: !!history[dateISO],
    };
  });
}
