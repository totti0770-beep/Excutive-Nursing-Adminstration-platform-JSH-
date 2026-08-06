import React, { useState, useEffect } from "react";
import { 
  Heart, Crown, Award, Presentation, Smile, ArrowUp, Star, UserRound, 
  Eye, Target, Gem, Clock, Calendar, Bell, Play, Pause, ChevronLeft, 
  ChevronRight, AlertCircle, MapPin, Activity, Sparkles, CheckCircle2,
  Volume2, VolumeX
} from "lucide-react";
import { DATA } from '../data';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from './Modal';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface ActiveShiftState {
  type: string;
  dept: string;
  date: string;
  startTime: Date;
  endTime: Date;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'OFF';
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState(DATA.stats);
  const [departments, setDepartments] = useState(DATA.departments);
  const [topNurses, setTopNurses] = useState(DATA.topNurses);
  const [topHeads, setTopHeads] = useState(DATA.topHeads);

  // News and alerts ticker states
  const [alerts, setAlerts] = useState<any[]>([
    { id: 'default-1', title: '🔴 عاجل: الاستعداد الميداني لتقييم سباهي (CBAHI)', content: 'يرجى الالتزام الكامل بمعايير الجودة ومكافحة العدوى والتوثيق الطبي الدقيق في كافة الملفات والتحضير لجولات المحاكاة.', priority: 'high' },
    { id: 'default-2', title: '🌟 تميز ريادي: تهنئة متميزة لقسم العناية المركزة كبار/ أطفال', content: 'حصل القسم على نسبة رضا مرضى بلغت 100% للأسبوع الثاني على التوالي. هنيئاً للفريق مجهوده الاستثنائي ومثابرته المستمرة في تقديم رعاية فائقة!', priority: 'normal' },
    { id: 'default-3', title: '🏥 تنويه هام: جولات المحاكاة الداخلية لاعتماد JCI', content: 'تبدأ الجولات التفقدية والتدريبية غداً صباحاً في تمام الساعة 08:00 ص لضمان جاهزية جميع الفرق التمريضية وتدريبها على معايير السلامة.', priority: 'high' },
    { id: 'default-4', title: '📢 تعميم طبي: دليل السياسات التمريضية الجديد لعام 2026', content: 'تم تحديث الدليل رسمياً وإضافته لمركز الوثائق. نرجو من جميع الكوادر التمريضية الاطلاع والتوقيع بالاستلام خلال 48 ساعة.', priority: 'normal' }
  ]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isTickerPlaying, setIsTickerPlaying] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // My Shift at a Glance states
  const [userSchedules, setUserSchedules] = useState<any[]>([]);
  const [profileName, setProfileName] = useState('ممرض متميز');
  const [shiftState, setShiftState] = useState<ActiveShiftState | null>(null);
  
  // Welcome popup state for shifts (shows once per login session)
  const [isShiftWelcomeOpen, setIsShiftWelcomeOpen] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('welcome_shift_dismissed');
    if (!isDismissed && user) {
      setIsShiftWelcomeOpen(true);
    }
  }, [user]);

  const handleDismissWelcome = () => {
    sessionStorage.setItem('welcome_shift_dismissed', 'true');
    setIsShiftWelcomeOpen(false);
  };

  useEffect(() => {
    // Sync stats
    const unsubStats = onSnapshot(doc(db, 'system', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as any);
      }
    }, (error) => console.log('Firestore access error, using local data', error));

    // Sync departments
    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      if (!snapshot.empty) {
        setDepartments(snapshot.docs.map(d => d.data() as any));
      }
    }, (error) => console.log('Firestore access error, using local data', error));

    // Sync recognitions
    const unsubRecs = onSnapshot(collection(db, 'recognitions'), (snapshot) => {
      if (!snapshot.empty) {
        const all = snapshot.docs.map(d => d.data() as any);
        setTopNurses(all.filter(r => r.type === 'nurse').sort((a, b) => b.votes - a.votes));
        setTopHeads(all.filter(r => r.type === 'head').sort((a, b) => b.votes - a.votes));
      }
    }, (error) => console.log('Firestore access error, using local data', error));

    // Sync news/announcements to Alerts
    const unsubNews = onSnapshot(collection(db, 'news'), (snapshot) => {
      if (!snapshot.empty) {
        const dbNews = snapshot.docs.map(doc => ({
          id: `db-${doc.id}`,
          title: doc.data().priority === 'high' ? `🔴 عاجل: ${doc.data().title}` : `📢 ${doc.data().title}`,
          content: doc.data().content,
          priority: doc.data().priority
        }));
        // Merge dbNews first, followed by default ones to keep it rich
        setAlerts([...dbNews, ...alerts.filter(a => !a.id.startsWith('db-'))]);
      }
    }, (error) => console.log('Firestore news access error', error));

    // Sync user schedule
    let unsubSchedules = () => {};
    if (user) {
      const q = query(collection(db, 'schedules'), where('nurse_id', '==', user.uid));
      unsubSchedules = onSnapshot(q, (snapshot) => {
        setUserSchedules(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (error) => console.log('Schedules snapshot error', error));
    }

    // Load profile name from storage
    const updateProfileName = () => {
      setProfileName(localStorage.getItem('profile_name') || 'ممرض متميز');
    };
    updateProfileName();
    window.addEventListener('profileNameChanged', updateProfileName);

    return () => {
      unsubStats();
      unsubDepts();
      unsubRecs();
      unsubNews();
      unsubSchedules();
      window.removeEventListener('profileNameChanged', updateProfileName);
    };
  }, [user]);

  // Alert ticker rotation timer
  useEffect(() => {
    if (!isTickerPlaying || alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTickerPlaying, alerts.length]);

  // Helper for shift details parsing
  const getShiftDetails = (dateStr: string, shiftType: string, userDept: string): { startTime: Date, endTime: Date } => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day);

    if (shiftType === 'مناوبة صباحية') {
      start.setHours(7, 0, 0, 0);
      end.setHours(15, 0, 0, 0);
    } else if (shiftType === 'مناوبة مسائية') {
      start.setHours(15, 0, 0, 0);
      end.setHours(23, 0, 0, 0);
    } else if (shiftType === 'مناوبة ليلية') {
      start.setHours(23, 0, 0, 0);
      // Night shift ends at 7:00 AM the NEXT day
      end.setDate(end.getDate() + 1);
      end.setHours(7, 0, 0, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }
    return { startTime: start, endTime: end };
  };

  // Logic to calculate shift countdown state
  const calculateShiftState = (): ActiveShiftState => {
    const now = new Date();
    const userDept = localStorage.getItem('profile_dept') || 'العناية المركزة كبار/ أطفال';
    
    // 1. Map all schedules to detailed objects
    const parsedSchedules = userSchedules
      .filter(s => s.shift_type && s.shift_type !== 'إجازة')
      .map(s => {
        const { startTime, endTime } = getShiftDetails(s.date, s.shift_type, s.department_id || userDept);
        return {
          type: s.shift_type,
          dept: s.department_id || userDept,
          date: s.date,
          startTime,
          endTime
        };
      });

    // 2. Find any ACTIVE shift
    const activeShift = parsedSchedules.find(s => now >= s.startTime && now <= s.endTime);
    if (activeShift) {
      const totalDuration = activeShift.endTime.getTime() - activeShift.startTime.getTime();
      const elapsed = now.getTime() - activeShift.startTime.getTime();
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      const diffMs = activeShift.endTime.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      return {
        type: activeShift.type,
        dept: activeShift.dept,
        date: activeShift.date,
        startTime: activeShift.startTime,
        endTime: activeShift.endTime,
        status: 'ACTIVE',
        hours,
        minutes,
        seconds,
        progress
      };
    }

    // 3. Find closest UPCOMING shift (where startTime > now)
    const upcomingShifts = parsedSchedules
      .filter(s => s.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    if (upcomingShifts.length > 0) {
      const nextShift = upcomingShifts[0];
      const diffMs = nextShift.startTime.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      return {
        type: nextShift.type,
        dept: nextShift.dept,
        date: nextShift.date,
        startTime: nextShift.startTime,
        endTime: nextShift.endTime,
        status: 'UPCOMING',
        hours,
        minutes,
        seconds,
        progress: 0
      };
    }

    // 4. Fallback: If no real shifts are found, create an elegant mock upcoming shift
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const mockShiftType = 'مناوبة صباحية';
    const { startTime, endTime } = getShiftDetails(tomorrowStr, mockShiftType, userDept);
    
    const diffMs = startTime.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return {
      type: mockShiftType,
      dept: userDept,
      date: tomorrowStr,
      startTime,
      endTime,
      status: 'UPCOMING',
      hours,
      minutes,
      seconds,
      progress: 0
    };
  };

  // Real-time ticking updates for shift countdown
  useEffect(() => {
    const updateShift = () => {
      setShiftState(calculateShiftState());
    };
    updateShift();
    const interval = setInterval(updateShift, 1000);
    return () => clearInterval(interval);
  }, [userSchedules]);

  const chartData = {
    labels: departments.map(d => d.name),
    datasets: [{
      data: departments.map(d => d.nurses),
      backgroundColor: ['#d4af37', '#f0d060', '#b8962c', '#2d9cdb', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
      borderColor: '#0b0e1a',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        labels: {
          color: '#a8b2d9',
          font: { family: 'Tajawal' },
        },
      },
    },
  };

  const currentAlert = alerts[currentAlertIndex] || alerts[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. ACCREDITATION & NEWS ALERT TICKER */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-gold/20 bg-bg-card/45 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:border-gold/40">
        <div className="absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-gold via-yellow-500 to-gold"></div>
        <div className="flex flex-col items-stretch p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
          
          {/* Badge Section */}
          <div className="flex shrink-0 items-center gap-2 border-l border-gold/15 pb-2.5 pl-4 sm:pb-0 sm:pl-4">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Bell className="h-4.5 w-4.5 animate-swing" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div>
              <span className="block text-[11px] font-black uppercase tracking-wider text-gold">أخبار المستشفى</span>
              <span className="block text-xs font-bold text-text-primary">التنبيهات العاجلة</span>
            </div>
          </div>

          {/* Dynamic Content Display with Motion */}
          <div className="relative flex min-w-0 flex-1 items-center py-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAlertIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-text-primary">
                    {currentAlert?.title}
                  </h4>
                  <p className="truncate text-xs text-text-secondary">
                    {currentAlert?.content}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAlertModalOpen(true)}
                  className="mt-1.5 shrink-0 self-start text-[11px] font-bold text-gold underline hover:text-gold-light sm:mt-0 sm:self-center"
                >
                  قراءة التفاصيل الكاملة
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions & Navigation Controls */}
          <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-gold/10 pt-2.5 sm:mt-0 sm:gap-2 sm:border-0 sm:pt-0">
            <button 
              onClick={() => setIsTickerPlaying(!isTickerPlaying)}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-text-secondary hover:bg-gold/15 hover:text-gold transition-colors"
              title={isTickerPlaying ? "إيقاف مؤقت" : "تشغيل تلقائي"}
            >
              {isTickerPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentAlertIndex((prev) => (prev - 1 + alerts.length) % alerts.length)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-text-secondary hover:bg-gold/15 hover:text-gold transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentAlertIndex((prev) => (prev + 1) % alerts.length)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-text-secondary hover:bg-gold/15 hover:text-gold transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SHIFT WELCOME OVERLAY MODAL (Shows once per session upon login) */}
      <AnimatePresence>
        {isShiftWelcomeOpen && shiftState && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-[#111428] to-[#0a0c16] p-6 shadow-2xl text-right sm:p-8"
            >
              {/* Gold Top Light Decor */}
              <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"></div>

              {/* Header section */}
              <div className="relative text-center mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/20 mb-4 animate-bounce">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">
                  أهلاً بك مجدداً، {profileName} 👋
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  طاب يومك بكل خير. يسعدنا انضمامك اليوم في المنصة، إليك تفاصيل مناوبتك ومؤشر العد التنازلي التفاعلي للبدء:
                </p>
              </div>

              {/* Embedded Apple-style shift info panel */}
              <div className="relative overflow-hidden rounded-2xl border border-gold/10 bg-[#151934]/60 p-5 shadow-lg mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/15">
                      <Clock className="h-6 w-6 animate-pulse" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                          shiftState.status === 'ACTIVE' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                            : 'bg-gold/10 text-gold border border-gold/20'
                        }`}>
                          {shiftState.status === 'ACTIVE' ? 'مناوبة نشطة الآن' : 'المناوبة القادمة'}
                        </span>
                        <span className="text-[11px] text-text-muted font-bold">📅 {shiftState.date}</span>
                      </div>
                      <h3 className="mt-1 text-base font-extrabold text-text-primary">
                        {shiftState.type} — {shiftState.dept}
                      </h3>
                    </div>
                  </div>

                  {/* Micro Digit Countdown */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-text-muted mb-1">
                      {shiftState.status === 'ACTIVE' ? 'الوقت المتبقي على انتهاء المناوبة:' : 'الوقت المتبقي لبدء المناوبة:'}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <div className="rounded-lg bg-black/40 px-2.5 py-1 text-center border border-gold/5 min-w-[40px]">
                        <span className="text-sm font-black text-gold">{shiftState.hours.toString().padStart(2, '0')}</span>
                        <span className="block text-[8px] text-text-muted">ساعة</span>
                      </div>
                      <span className="text-gold font-bold animate-pulse text-xs">:</span>
                      <div className="rounded-lg bg-black/40 px-2.5 py-1 text-center border border-gold/5 min-w-[40px]">
                        <span className="text-sm font-black text-gold">{shiftState.minutes.toString().padStart(2, '0')}</span>
                        <span className="block text-[8px] text-text-muted">دقيقة</span>
                      </div>
                      <span className="text-gold font-bold animate-pulse text-xs">:</span>
                      <div className="rounded-lg bg-black/40 px-2.5 py-1 text-center border border-gold/5 min-w-[40px]">
                        <span className="text-sm font-black text-gold">{shiftState.seconds.toString().padStart(2, '0')}</span>
                        <span className="block text-[8px] text-text-muted">ثانية</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar if active */}
                {shiftState.status === 'ACTIVE' && (
                  <div className="mt-4 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 font-bold">
                      <span>نسبة إنجاز المناوبة الحالية</span>
                      <span>{Math.round(shiftState.progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold to-yellow-400 transition-all duration-1000"
                        style={{ width: `${shiftState.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Motivational Footer Note */}
              <div className="flex items-center gap-3 rounded-2xl bg-gold/5 p-4 border border-gold/10 mb-6">
                <Heart className="h-5 w-5 text-gold shrink-0 animate-pulse fill-gold" />
                <p className="text-xs leading-relaxed text-text-secondary text-right">
                  مستشفى جازان التخصصي يثمن عالياً جهودك وعطائك الإنساني الاستثنائي، سلامة المرضى تبدأ برعايتك المتميزة وسلوكك الريادي دائماً.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDismissWelcome}
                  className="flex-1 rounded-xl bg-gold text-white px-5 py-3 text-center text-sm font-black tracking-wide shadow-lg hover:bg-gold-light transition-all duration-300"
                >
                  حسناً، الانتقال للوحة التحكم الرئيسية
                </button>
                <button
                  onClick={() => {
                    handleDismissWelcome();
                    onNavigate('schedule');
                  }}
                  className="rounded-xl border border-gold/25 bg-white/5 text-text-primary px-5 py-3 text-center text-sm font-bold tracking-wide hover:bg-white/10 transition-all duration-300"
                >
                  عرض جدولي الكامل
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold/20 hover:shadow-2xl">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="text-[28px] font-extrabold leading-tight">{stats.nurses}</div>
          <div className="mt-1 text-sm text-text-secondary">عدد الممرضين والممرضات</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
            <ArrowUp className="h-3 w-3" /> +12 هذا الشهر
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold/20 hover:shadow-2xl">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Smile className="h-5 w-5" />
          </div>
          <div className="text-[28px] font-extrabold leading-tight">{stats.satisfaction}%</div>
          <div className="mt-1 text-sm text-text-secondary">معدل رضا المريض</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
            <ArrowUp className="h-3 w-3" /> بناءً على 2,882 تقييم
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold/20 hover:shadow-2xl">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Presentation className="h-5 w-5" />
          </div>
          <div className="text-[28px] font-extrabold leading-tight">{stats.training}</div>
          <div className="mt-1 text-sm text-text-secondary">برنامج تدريبي سنوياً</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
            <ArrowUp className="h-3 w-3" /> +5 عن العام الماضي
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold/20 hover:shadow-2xl">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Award className="h-5 w-5" />
          </div>
          <div className="text-[28px] font-extrabold leading-tight">+{stats.experience}</div>
          <div className="mt-1 text-sm text-text-secondary">سنوات من الخدمة المتميزة</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
            <Star className="h-3 w-3 text-gold" /> إنجاز تاريخي
          </div>
        </div>
      </div>

      {/* Recognition & Quick */}
      <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">
              <Heart className="ml-2 h-4 w-4 text-gold fill-gold" /> أكثر الممرضين تقديراً
            </h3>
            <button onClick={() => onNavigate('recognition')} className="text-[13px] font-semibold text-gold hover:text-gold-light">عرض الكل</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {topNurses.slice(0, 3).map((n, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-md bg-white/5 p-2.5 transition-colors hover:bg-gold/5">
                <span className="w-[26px] text-center text-sm font-extrabold text-gold">#{i + 1}</span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white shadow-sm">
                  {n.name?.charAt(0) || "م"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{n.name || "ممرض متميز"}</div>
                  <div className="text-xs text-text-muted">{n.dept}</div>
                </div>
                <span className="text-[13px] font-semibold text-gold">❤️ {n.votes?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center text-[17px] font-bold">
              <Crown className="ml-2 h-4 w-4 text-gold fill-gold" /> أكثر رؤساء الأقسام تقديراً
            </h3>
            <button onClick={() => onNavigate('recognition')} className="text-[13px] font-semibold text-gold hover:text-gold-light">عرض الكل</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {topHeads.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-md bg-white/5 p-2.5 transition-colors hover:bg-gold/5">
                <span className="w-[26px] text-center text-sm font-extrabold text-gold">#{i + 1}</span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white shadow-sm">
                  {h.name?.charAt(0) || "ر"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{h.name || "رئيس متميز"}</div>
                  <div className="text-xs text-text-muted">{h.dept}</div>
                </div>
                <span className="text-[13px] font-semibold text-gold">🏆 {h.votes?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="rounded-2xl border border-gold/10 bg-bg-card p-6">
        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-4 h-1 w-12 rounded bg-accent-gradient"></div>
            <h3 className="flex items-center text-lg font-bold text-gold">
              <Eye className="ml-2.5 h-5 w-5" /> الرؤية
            </h3>
            <p className="mt-1.5 border-r-4 border-gold pr-4 text-[15px] leading-relaxed text-text-secondary">
              أن نكون الفريق التمريضي الرائد في تقديم رعاية تخصصية مبتكرة ورحيمة.
            </p>
          </div>
          <div>
            <h3 className="flex items-center text-lg font-bold text-gold">
              <Target className="ml-2.5 h-5 w-5" /> الرسالة
            </h3>
            <p className="mt-1.5 border-r-4 border-gold pr-4 text-[15px] leading-relaxed text-text-secondary">
              تقديم رعاية تخصصية عالية الجودة باستخدام التقنيات المتقدمة، من خلال كوادر تمريضية مؤهلة وذات حس إنساني، بما يسهم في تحسين جودة الحياة.
            </p>
          </div>
          <div>
            <h3 className="flex items-center text-lg font-bold text-gold">
              <Gem className="ml-2.5 h-5 w-5" /> قيمنا
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {['السلامة', 'الاحترافية', 'التميز', 'الرحمة', 'الابتكار', 'المساءلة', 'القيادة'].map((val) => (
                <span key={val} className="rounded-full border border-gold/15 bg-gold/10 px-4 py-1.5 text-sm font-medium">
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mx-auto mt-5 max-w-[500px] rounded-2xl border border-gold/5 bg-bg-card p-5">
        <h4 className="mb-3 text-center font-bold">توزيع الممرضين حسب الأقسام</h4>
        <div className="h-[250px]">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Dynamic News / Alert Detail Modal */}
      <Modal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
        title={currentAlert?.title}
        subtitle="تفاصيل التعميم الهام للتمريض"
      >
        <div className="mt-4 flex flex-col gap-4 text-right">
          <div className="rounded-xl bg-gold/5 p-4 border border-gold/10 text-sm leading-relaxed text-text-primary">
            {currentAlert?.content}
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-muted">
            <Sparkles className="h-4 w-4 text-gold" />
            <span>يرجى الالتزام بالتعليمات الواردة وإبلاغ كافة ممرضي المناوبة.</span>
          </div>
        </div>
      </Modal>

    </div>
  );
}
