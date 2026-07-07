import React, { useState, useEffect } from 'react';
import { ClipboardCheck, FileText, UserRound } from 'lucide-react';
import { DATA } from '../data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Quality() {
  const iconMap: Record<string, any> = {
    ClipboardCheck,
    FileText,
    UserRound
  };

  const [qualityStats, setQualityStats] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quality'), (snapshot) => {
      setQualityStats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('Error fetching quality', error);
    });
    return () => unsub();
  }, []);

  const displayStats = qualityStats.length > 0 ? qualityStats : DATA.qualityStats;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-1.5 text-[22px] font-extrabold">الجودة وسلامة المرضى</h2>
      <p className="mb-6 text-[15px] text-text-secondary">مؤشرات الأداء ومعايير الجودة</p>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {displayStats.map(stat => {
          const Icon = iconMap[stat.icon || 'ClipboardCheck'];
          return (
            <div key={stat.label || stat.metric} className="group relative overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-brand-teal/30 hover:shadow-2xl">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <div className="text-[28px] font-extrabold leading-tight">{stat.value || stat.score}</div>
              <div className="mt-1 text-sm text-text-secondary">{stat.label || stat.metric}</div>
              {stat.sub && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-semibold text-brand-teal">
                  {stat.sub}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
        <h3 className="mb-3 text-[17px] font-bold">📊 مؤشرات التشغيل اليومية</h3>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="rounded-md bg-white/5 p-3.5 text-center">
            <div className="text-xs text-text-muted">نسبة الإشغال</div>
            <div className="text-[22px] font-bold text-gold">87%</div>
          </div>
          <div className="rounded-md bg-white/5 p-3.5 text-center">
            <div className="text-xs text-text-muted">متوسط وقت الانتظار</div>
            <div className="text-[22px] font-bold text-gold">12 د</div>
          </div>
          <div className="rounded-md bg-white/5 p-3.5 text-center">
            <div className="text-xs text-text-muted">عدد العمليات اليوم</div>
            <div className="text-[22px] font-bold text-gold">34</div>
          </div>
        </div>
      </div>
    </div>
  );
}
