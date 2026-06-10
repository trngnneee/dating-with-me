"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  ArrowLeft,
  Heart,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import emailjs from "@emailjs/browser";
import FloatingHearts from "../../components/FloatingHearts";
import ActivityCard from "../../components/ActivityCard";
import { triggerSuccessConfetti } from "../../components/ConfettiEffect";

// Helper for formatting date
const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Activity options
const ACTIVITIES = [
  { id: "coffee", title: "Coffee & Dessert", iconName: "Coffee" as const, description: "Cùng đi cafe nói chuyện phiếm & ăn bánh ngọt" },
  { id: "restaurant", title: "Restaurant", iconName: "Utensils" as const, description: "Một bữa tối lãng mạn tại quán ăn ấm cúng" },
  { id: "cinema", title: "Cinema", iconName: "Film" as const, description: "Cùng thưởng thức bộ phim mới nhất" },
  { id: "park", title: "Park Walk", iconName: "Trees" as const, description: "Đi dạo công viên ngắm hoàng hôn lộng gió" },
  { id: "workshop", title: "DIY Workshop", iconName: "Palette" as const, description: "Cùng làm gốm, vẽ tranh hay làm nến thơm" },
  { id: "acoustic", title: "Acoustic Night", iconName: "Music" as const, description: "Lắng nghe những giai điệu tình ca êm dịu" },
  { id: "photobooth", title: "Photobooth", iconName: "Camera" as const, description: "Lưu lại những khoảnh khắc đáng yêu của hai đứa" },
  { id: "custom", title: "Your Plan", iconName: "PenTool" as const, description: "Tớ lên kế hoạch riêng rồi liên hệ với cậu sau nhé!" }
];

// Time of day options
const TIME_OF_DAYS = [
  { id: "morning", label: "Morning", icon: "", time: "08:00 - 11:30" },
  { id: "afternoon", label: "Afternoon", icon: "", time: "13:30 - 17:30" },
  { id: "evening", label: "Evening", icon: "", time: "18:00 - 21:30" },
  { id: "latenight", label: "Late Night", icon: "", time: "22:00 - 23:30" }
];

export default function DateSelection() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (publicKey) emailjs.init(publicKey);
  }, []);

  // Date & Time selection states
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("evening");

  // Activities selection states
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customPlan, setCustomPlan] = useState("");

  // Confirmation Modal and Send Status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Play a cute pop sound on interactions
  const playPop = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
  };

  // Custom calendar helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 is Sunday, 1 is Monday... Let's adjust to 0 is Monday, 6 is Sunday for Vietnam standard
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) {
      setSelectedDate(newDate);
      setIsCalendarOpen(false);
      playPop();
    }
  };

  // Toggle activity selection
  const handleActivityClick = (activityId: string) => {
    playPop();
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  // Submit appointment configuration
  const handleConfirmDate = async () => {
    setIsSending(true);
    setSendError("");

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    const templateParams = {
      nickname,
      date: formatDate(selectedDate),
      time_of_day: TIME_OF_DAYS.find((t) => t.id === selectedTimeOfDay)?.label || selectedTimeOfDay,
      activities: selectedActivities
        .map((id) => ACTIVITIES.find((a) => a.id === id)?.title || id)
        .join(", "),
      custom_plan: customPlan || "Không có",
    };

    if (!serviceId || !templateId) {
      // Dev mode — không có config EmailJS
      console.log("EmailJS chưa cấu hình:", templateParams);
      setTimeout(() => {
        setIsSending(false);
        setIsModalOpen(true);
        triggerSuccessConfetti();
      }, 800);
      return;
    }

    try {
      await emailjs.send(serviceId, templateId, templateParams);
      setIsSending(false);
      setIsModalOpen(true);
      triggerSuccessConfetti();
    } catch (error) {
      console.error("EmailJS error:", error);
      setIsSending(false);
      setSendError("Có lỗi khi gửi thư mời. Vui lòng thử lại!");
    }
  };

  // Render Calendar Grid
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayElements = [];

    // Empty cells for padding
    for (let i = 0; i < startDay; i++) {
      dayElements.push(<div key={`empty-${i}`} className="w-8 h-8 md:w-10 md:h-10"></div>);
    }

    // Days in month
    for (let day = 1; day <= totalDays; day++) {
      const dateToCheck = new Date(year, month, day);
      const isPast = dateToCheck < today;
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      dayElements.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => selectDate(day)}
          className={`w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm rounded-full flex items-center justify-center font-medium transition-all cursor-pointer ${isSelected
            ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-200"
            : isPast
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-700 hover:bg-rose-100/50"
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-3 bg-white rounded-2xl shadow-xl border border-rose-100 absolute z-50 mt-2 top-full left-0 right-0 md:left-auto md:w-72">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm md:text-base text-slate-800">
            Tháng {month + 1}, {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-rose-400 mb-2">
          {weekdays.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{dayElements}</div>
      </div>
    );
  };

  // Progress Bar rendering
  const renderProgress = () => {
    return (
      <div className="w-full flex items-center justify-between mb-8 px-2">
        {[1, 2, 3, 4].map((s) => {
          const isActive = s <= step;
          const isCurrent = s === step;
          return (
            <React.Fragment key={s}>
              <button
                type="button"
                disabled={s > step}
                onClick={() => {
                  playPop();
                  setStep(s);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all relative ${isCurrent
                  ? "bg-rose-500 text-white scale-110 shadow-md shadow-rose-200 border-2 border-rose-300"
                  : isActive
                    ? "bg-rose-200 text-rose-700 cursor-pointer"
                    : "bg-white/50 text-slate-400 border border-white/20"
                  }`}
              >
                {s}
                {isCurrent && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-rose-600 whitespace-nowrap hidden sm:block">
                    {s === 1 ? "Biệt danh" : s === 2 ? "Thời gian" : s === 3 ? "Hoạt động" : "Xác nhận"}
                  </span>
                )}
              </button>
              {s < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded ${s < step ? "bg-rose-300" : "bg-white/30"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-4 md:p-8 overflow-hidden select-none bg-gradient-to-tr from-rose-100 via-pink-50 to-amber-50">
      <FloatingHearts />

      {/* Decorative Orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: "3s" }}></div>

      <div className="max-w-2xl w-full flex-1 flex flex-col justify-center py-6 md:py-12 relative z-10">
        {/* Progress bar */}
        {renderProgress()}

        {/* Card wrapper */}
        <div className="glass rounded-3xl p-6 md:p-8 w-full shadow-xl border border-white/40 min-h-[400px] flex flex-col justify-between transition-all duration-300">

          {/* STEP 1: ENTER NICKNAME */}
          {step === 1 && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="text-center mb-6">
                <span className="text-3xl">🍓</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-2">
                  Tớ Nên Gọi Nàng Thế Nào Nhỉ?
                </h2>
                <p className="text-slate-500 text-sm">
                  Hãy nhập biệt danh đáng yêu nhất của nàng để tớ viết vào thư mời nhaaa!
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  // placeholder="Ví dụ: Bé Dâu 🍓, Công Chúa 👑..."
                  className="w-full text-center py-4 px-6 rounded-2xl border-2 border-rose-200 focus:border-rose-400 bg-white/70 focus:bg-white text-lg font-medium outline-none transition-all shadow-inner placeholder-slate-400 text-slate-700 focus:shadow-md"
                  autoFocus
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={!nickname.trim()}
                  onClick={() => {
                    playPop();
                    setStep(2);
                  }}
                  className={`py-3.5 px-8 rounded-full font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer ${nickname.trim()
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-102 hover:shadow-lg active:scale-98"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                >
                  Tiếp tục <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE DATE & TIME OF DAY */}
          {step === 2 && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="text-center mb-6">
                <span className="text-3xl">📅</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-2">
                  Chúng mình hẹn nhau ngày nào nhỉ?
                </h2>
                {/* <p className="text-slate-500 text-sm">
                  Khi nào thì thuận tiện nhất cho một cuộc gặp ngọt ngào của tụi mình hở cậu? 💕
                </p> */}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4">

                {/* Date Selection Popover Button */}
                <div className="relative flex flex-col gap-2">
                  <label className="text-sm font-semibold text-rose-500 flex items-center gap-1.5 px-1">
                    <CalendarIcon className="w-4 h-4" /> 1. Ngày nào cậu rảnh?
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setIsCalendarOpen(!isCalendarOpen);
                    }}
                    className="w-full bg-white/70 hover:bg-white border-2 border-rose-100 hover:border-rose-300 py-4 px-5 rounded-2xl flex items-center justify-between text-slate-700 text-base font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <span className="tracking-wide">{formatDate(selectedDate)}</span>
                    <CalendarIcon className="w-5 h-5 text-rose-400" />
                  </button>
                  {isCalendarOpen && renderCalendar()}
                </div>

                {/* Time of Day Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-rose-500 flex items-center gap-1.5 px-1">
                    <Clock className="w-4 h-4" /> 2. Buổi nào thích hợp nhất cho cậu?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_OF_DAYS.map((t) => {
                      const isSelected = selectedTimeOfDay === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            playPop();
                            setSelectedTimeOfDay(t.id);
                          }}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${isSelected
                            ? "bg-rose-400 text-white border-rose-400 shadow-md scale-102"
                            : "bg-white/60 text-slate-700 border-white/30 hover:bg-white"
                            }`}
                        >
                          <span className="text-xl mb-1">{t.icon}</span>
                          <span className="text-xs md:text-sm font-semibold whitespace-nowrap">{t.label.split(" ")[0]}</span>
                          <span className={`text-[10px] ${isSelected ? "text-rose-100" : "text-slate-400"}`}>{t.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setStep(1);
                  }}
                  className="py-3.5 px-6 rounded-full font-semibold border-2 border-rose-200 text-rose-600 bg-white/50 hover:bg-white hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Trở lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setStep(3);
                  }}
                  className="py-3.5 px-8 rounded-full font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-102 hover:shadow-lg active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                >
                  Tiếp tục <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT ACTIVITIES */}
          {step === 3 && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="text-center mb-6">
                <span className="text-3xl">☕</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-2">
                  Chúng Mình Sẽ Làm Gì Nhỉ?
                </h2>
                <p className="text-slate-500 text-sm">
                  Chọn những hoạt động cậu muốn chúng mình làm cùng nhau nhé (có thể chọn nhiều tùy chọn) 🥰
                </p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] md:max-h-[380px] pr-1 scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ACTIVITIES.map((act) => (
                    <ActivityCard
                      key={act.id}
                      id={act.id}
                      title={act.title}
                      iconName={act.iconName}
                      description={act.description}
                      selected={selectedActivities.includes(act.id)}
                      onClick={() => handleActivityClick(act.id)}
                    />
                  ))}
                </div>

                {/* Custom Plan Area */}
                {selectedActivities.includes("custom") && (
                  <div className="mt-4 animate-slide-up">
                    <label className="text-sm font-semibold text-rose-500 mb-1 block px-1">
                      ✍️ Chia sẻ ý tưởng của cậu cho cuộc hẹn nhé:
                    </label>
                    <textarea
                      value={customPlan}
                      onChange={(e) => setCustomPlan(e.target.value)}
                      placeholder="Tụi mình có thể leo núi, ngắm sao, hay nấu ăn tại nhà..."
                      className="w-full p-4 rounded-2xl border-2 border-rose-100 focus:border-rose-400 bg-white/70 focus:bg-white outline-none transition-all shadow-inner text-sm md:text-base text-slate-700 min-h-[80px]"
                    />
                  </div>
                )}
              </div>

              {/* Step Navigation */}
              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setStep(2);
                  }}
                  className="py-3.5 px-6 rounded-full font-semibold border-2 border-rose-200 text-rose-600 bg-white/50 hover:bg-white hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Trở lại
                </button>
                <button
                  type="button"
                  disabled={selectedActivities.length === 0}
                  onClick={() => {
                    playPop();
                    setStep(4);
                  }}
                  className={`py-3.5 px-8 rounded-full font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer ${selectedActivities.length > 0
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-102 hover:shadow-lg active:scale-98"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                >
                  Tiếp tục <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="text-center mb-6">
                <span className="text-3xl">💖</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mt-2 mb-2">
                  Xác Nhận Cuộc Hẹn
                </h2>
                <p className="text-slate-500 text-sm">
                  Hãy soát lại một lượt xem kế hoạch đã thật hoàn hảo chưa nha 🥰
                </p>
              </div>

              {/* Summary details */}
              <div className="flex-1 bg-white/80 rounded-2xl p-5 border border-rose-100 flex flex-col gap-4 text-slate-700">
                <div className="flex justify-between items-center pb-3 border-b border-rose-50">
                  <span className="text-sm font-semibold text-slate-400">Biệt danh của nàng</span>
                  <span className="font-bold text-slate-800 text-base">{nickname} 🍒</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-rose-50">
                  <span className="text-sm font-semibold text-slate-400">Ngày hẹn hò</span>
                  <span className="font-bold text-slate-800 text-base">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-rose-50">
                  <span className="text-sm font-semibold text-slate-400">Thời gian (Buổi)</span>
                  <span className="font-bold text-rose-500 text-base">
                    {TIME_OF_DAYS.find((t) => t.id === selectedTimeOfDay)?.label.split(" ")[0]}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-400 mb-3">Hoạt động lựa chọn</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedActivities.map((id) => {
                      const act = ACTIVITIES.find((a) => a.id === id);
                      return (
                        <span key={id} className="bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full border border-rose-100">
                          {act?.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {selectedActivities.includes("custom") && customPlan && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-rose-50">
                    <span className="text-xs font-semibold text-slate-400">Kế hoạch riêng</span>
                    <p className="text-sm text-slate-600 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      "{customPlan}"
                    </p>
                  </div>
                )}
              </div>

              {/* Show email error if any */}
              {sendError && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center">
                  ⚠️ {sendError}
                </div>
              )}

              {/* Step Navigation & Submission */}
              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => {
                    playPop();
                    setStep(3);
                  }}
                  className="py-3.5 px-6 rounded-full font-semibold border-2 border-rose-200 text-rose-600 bg-white/50 hover:bg-white hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Trở lại
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleConfirmDate}
                  className="py-3.5 px-8 flex-1 rounded-full font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-102 hover:shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                      <span>Đang gửi thư mời...</span>
                    </div>
                  ) : (
                    <>
                      <span>Gửi Thư Mời!</span>
                      {/* <Heart className="w-5 h-5 fill-current" /> */}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CONGRATULATIONS DIALOG/MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-rose-50 animate-scale-up">

            {/* Modal Icon */}
            <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-5 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Modal Title */}
            <h3 className="font-serif text-2xl md:text-3xlYa font-bold text-slate-800 mb-3">
              Yaaay! Thành Công Rồi 💕
            </h3>

            {/* Modal Description */}
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
              Hẹn gặp <span className="font-bold text-rose-500">{nickname}</span> vào buổi{" "}
              <span className="font-bold text-rose-500">
                {TIME_OF_DAYS.find((t) => t.id === selectedTimeOfDay)?.label.split(" ")[0]}
              </span>{" "}
              ngày <span className="font-bold text-rose-500">{formatDate(selectedDate)}</span> nhé!
              <br />
            </p>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                playPop();
                setIsModalOpen(false);
                router.push("/");
              }}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3.5 rounded-full hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
            >
              <span>Trở về trang chính</span>
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
