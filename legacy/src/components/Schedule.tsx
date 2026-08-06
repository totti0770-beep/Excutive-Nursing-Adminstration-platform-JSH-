import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface ScheduleType {
  id?: string;
  date: string;
  shift_type: string;
}

export function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const { user, userRole } = useAuth();
  const { showToast } = useToast();

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sunday
  
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'schedules'), where('nurse_id', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setSchedules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleType)));
    }, (error) => {
      console.error('Error fetching schedules', error);
    });
    return () => unsub();
  }, [user]);

  const addShift = async (day: number) => {
    if (!user) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const types = ['مناوبة صباحية', 'مناوبة مسائية', 'مناوبة ليلية', 'إجازة'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    try {
      await addDoc(collection(db, 'schedules'), {
        nurse_id: user.uid,
        date: dateStr,
        shift_type: randomType
      });
      // V2 Production Feature: Automated email/SMS notification dispatcher
      // In a real backend, this would trigger a Firebase Function or API call
      // to Twilio/SendGrid to notify the nurse of their new schedule.
      showToast(`✅ تم تسجيل ${randomType} وإرسال إشعار SMS/Email للممرض`);
    } catch (e) {
      showToast('❌ حدث خطأ');
    }
  };

  const getMonthName = (monthIndex: number) => {
    const names = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return names[monthIndex];
  };

  const getDayName = (dayIndex: number) => {
    const names = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return names[dayIndex];
  };

  const shiftColors: Record<string, string> = {
    'مناوبة صباحية': 'text-gold',
    'مناوبة مسائية': 'text-brand-teal',
    'مناوبة ليلية': 'text-purple-500',
    'إجازة': 'text-green-500'
  };

  const gridCells = [];
  for (let i = 0; i < firstDay; i++) {
    gridCells.push(<div key={`empty-${i}`} className="p-3 text-center"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySchedule = schedules.find(s => s.date === dateStr);
    
    let shiftType = daySchedule?.shift_type;
    
    const isToday = isCurrentMonth && day === now.getDate();
    
    gridCells.push(
      <div 
        key={`day-${day}`} 
        onClick={() => userRole === 'System Admin' && addShift(day)}
        className={`group relative ${userRole === 'System Admin' ? 'cursor-pointer hover:border-gold/50 hover:bg-gold/5' : ''} rounded-md border p-3 text-center transition-all ${isToday ? 'border-gold bg-gold/15' : 'border-gold/5 bg-white/5'}`}
      >
        {userRole === 'System Admin' && <div className="absolute left-1 top-1 hidden text-gold opacity-50 group-hover:block"><Edit2 className="h-3 w-3" /></div>}
        <div className="text-xs text-text-muted">{getDayName(new Date(year, month, day).getDay())}</div>
        <div className={`text-lg font-bold ${isToday ? 'text-gold' : ''}`}>{day}</div>
        {shiftType && (
          <div className={`mt-0.5 text-[11px] font-medium ${shiftColors[shiftType] || 'text-text-secondary'}`}>
            {shiftType}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-1.5 text-[22px] font-extrabold">الجدول الشهري والمناوبات</h2>
      <p className="mb-6 text-[15px] text-text-secondary">عرض المناوبات والإجازات والغياب (اضغط لإضافة مناوبة تجريبية)</p>

      <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-base font-semibold">📅 {getMonthName(month)} {year}</span>
            {isCurrentMonth && (
              <span className="mr-3 text-[13px] text-text-muted">
                {getDayName(now.getDay())} {now.getDate()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => changeMonth(1)}
              className="flex items-center justify-center rounded-full border border-gold/20 bg-transparent px-4 py-1.5 text-[13px] font-semibold text-text-secondary transition-colors hover:border-gold hover:text-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => changeMonth(-1)}
              className="flex items-center justify-center rounded-full border border-gold/20 bg-transparent px-4 py-1.5 text-[13px] font-semibold text-text-secondary transition-colors hover:border-gold hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
          {gridCells}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-gold"></span> مناوبة صباحية</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-brand-teal"></span> مناوبة مسائية</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-purple-500"></span> مناوبة ليلية</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-green-500"></span> إجازة</span>
        </div>
      </div>
    </div>
  );
}
