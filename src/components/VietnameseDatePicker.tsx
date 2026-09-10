import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { parseDateSafe, formatDateVi, formatDayOfWeekVi } from "../utils/dateUtils.ts";

interface VietnameseDatePickerProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (dateISO: string) => void;
  label?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  className?: string;
  idPrefix?: string;
}

export const VietnameseDatePicker: React.FC<VietnameseDatePickerProps> = ({
  value,
  onChange,
  label = "Chọn ngày:",
  minDate = "2026-09-01",
  maxDate = "2027-06-30",
  className = "",
  idPrefix = "vi-datepicker",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Parse current value
  const parsed = useMemo(() => {
    const parts = value.split("-");
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10), // 1-12
        day: parseInt(parts[2], 10),
      };
    }
    const d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }, [value]);

  // Calendar navigation state
  const [navYear, setNavYear] = useState<number>(parsed.year);
  const [navMonth, setNavMonth] = useState<number>(parsed.month); // 1-12

  // Sync nav state when value changes
  useEffect(() => {
    setNavYear(parsed.year);
    setNavMonth(parsed.month);
  }, [parsed.year, parsed.month]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format display string strictly as DD/MM/YYYY
  const displayFormatted = useMemo(() => {
    const d = String(parsed.day).padStart(2, "0");
    const m = String(parsed.month).padStart(2, "0");
    return `${d}/${m}/${parsed.year}`;
  }, [parsed]);

  // Day of week label
  const dayOfWeekLabel = useMemo(() => {
    const d = parseDateSafe(value);
    return formatDayOfWeekVi(d);
  }, [value]);

  // Days in month calculation for the calendar grid
  const daysInMonth = useMemo(() => {
    return new Date(navYear, navMonth, 0).getDate();
  }, [navYear, navMonth]);

  // Day of week of the 1st day of month (Monday = 1, Sunday = 7 in Vietnamese convention)
  const firstDayOfWeek = useMemo(() => {
    const jsDay = new Date(navYear, navMonth - 1, 1).getDay(); // 0 is Sunday, 1 is Mon
    return jsDay === 0 ? 7 : jsDay;
  }, [navYear, navMonth]);

  const handleSelectDay = (day: number) => {
    const mStr = String(navMonth).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const newISO = `${navYear}-${mStr}-${dStr}`;
    onChange(newISO);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (navMonth === 1) {
      setNavMonth(12);
      setNavYear((prev) => prev - 1);
    } else {
      setNavMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 12) {
      setNavMonth(1);
      setNavYear((prev) => prev + 1);
    } else {
      setNavMonth((prev) => prev + 1);
    }
  };

  // Quick preset dates
  const handleQuickPreset = (targetISO: string) => {
    onChange(targetISO);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button showing standard DD/MM/YYYY */}
      <div className="flex items-center gap-1.5 bg-white border border-purple-300 hover:border-purple-500 rounded-xl px-2.5 py-1 shadow-2xs transition">
        {label && (
          <span className="text-[11px] text-purple-900 font-bold whitespace-nowrap">
            {label}
          </span>
        )}

        <button
          type="button"
          id={`${idPrefix}-trigger`}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs tracking-wide transition cursor-pointer border border-purple-200"
          title="Bấm để chọn ngày (Định dạng chuẩn: Ngày/Tháng/Năm)"
        >
          <span className="font-mono text-xs text-[#6D28D9] font-black">
            {displayFormatted}
          </span>
          <CalendarIcon className="w-3.5 h-3.5 text-purple-700 ml-0.5 flex-shrink-0" />
        </button>

        {/* Hidden native input fallback for accessibility */}
        <input
          type="date"
          ref={hiddenInputRef}
          value={value}
          min={minDate}
          max={maxDate}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-purple-200 p-4 animate-in fade-in duration-150">
          {/* Header info */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-600">
                Định dạng: Ngày / Tháng / Năm
              </div>
              <div className="text-xs font-bold text-slate-800">
                {dayOfWeekLabel}, <span className="text-[#6D28D9]">{displayFormatted}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Month & Year Stepper */}
          <div className="flex items-center justify-between gap-1 mb-2.5 bg-slate-50 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-purple-700 transition cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Select Month */}
              <select
                value={navMonth}
                onChange={(e) => setNavMonth(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>

              {/* Select Year */}
              <select
                value={navYear}
                onChange={(e) => setNavYear(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-purple-700 transition cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick 3-field picker: Ngày - Tháng - Năm */}
          <div className="flex items-center justify-between gap-1 mb-3 px-1 py-1.5 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px]">
            <span className="font-bold text-purple-900 pl-1">Chọn nhanh:</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-semibold">Ngày</span>
              <select
                value={parsed.day}
                onChange={(e) => {
                  const day = parseInt(e.target.value, 10);
                  handleSelectDay(day);
                }}
                className="text-xs font-bold bg-white text-purple-900 border border-purple-200 rounded px-1.5 py-0.5 cursor-pointer"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {String(d).padStart(2, "0")}
                  </option>
                ))}
              </select>

              <span className="text-slate-500 font-semibold">/ Th</span>
              <select
                value={parsed.month}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  const mStr = String(m).padStart(2, "0");
                  const dStr = String(Math.min(parsed.day, new Date(parsed.year, m, 0).getDate())).padStart(2, "0");
                  onChange(`${parsed.year}-${mStr}-${dStr}`);
                  setNavMonth(m);
                }}
                className="text-xs font-bold bg-white text-purple-900 border border-purple-200 rounded px-1.5 py-0.5 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>

              <span className="text-slate-500 font-semibold">/ Năm</span>
              <select
                value={parsed.year}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10);
                  const mStr = String(parsed.month).padStart(2, "0");
                  const dStr = String(parsed.day).padStart(2, "0");
                  onChange(`${y}-${mStr}-${dStr}`);
                  setNavYear(y);
                }}
                className="text-xs font-bold bg-white text-purple-900 border border-purple-200 rounded px-1 py-0.5 cursor-pointer"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Vietnamese Calendar Grid */}
          <div className="mb-3">
            {/* Weekday headers: T2 - CN */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-1">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span className="text-purple-600">T7</span>
              <span className="text-rose-500">CN</span>
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Blank offset before 1st day of month */}
              {Array.from({ length: firstDayOfWeek - 1 }).map((_, idx) => (
                <div key={`blank-${idx}`} className="h-7 w-7" />
              ))}

              {/* Days 1 to daysInMonth */}
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const day = idx + 1;
                const isSelected =
                  parsed.day === day &&
                  parsed.month === navMonth &&
                  parsed.year === navYear;
                const isToday =
                  day === 11 && navMonth === 9 && navYear === 2026;

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-7 w-7 rounded-lg font-bold flex items-center justify-center transition cursor-pointer text-xs ${
                      isSelected
                        ? "bg-[#6D28D9] text-white shadow-xs scale-105"
                        : isToday
                        ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                        : "text-slate-700 hover:bg-purple-100 hover:text-purple-900"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset("2026-09-11")}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
            >
              Hôm nay (11/09)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("2026-09-10")}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
            >
              Hôm qua (10/09)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("2026-09-03")}
              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-[11px] transition cursor-pointer"
            >
              03/09/2026
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
