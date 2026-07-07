import React, { useState, useEffect } from 'react';
import { Heart, Mail, UserCheck, Crown, Trophy } from 'lucide-react';
import { DATA } from '../data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RecognitionType {
  id: string;
  name: string;
  dept: string;
  votes: number;
  type: string;
}

export function Recognition() {
  const iconMap: Record<string, any> = { Heart, Mail, UserCheck };
  const [recognitions, setRecognitions] = useState<RecognitionType[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'recognitions'), (snapshot) => {
      setRecognitions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecognitionType)));
    }, (error) => {
      console.error('Error fetching recognitions', error);
      // Fallback
      setRecognitions([
        ...DATA.topNurses.map(n => ({...n, id: n.name, type: 'nurse'})),
        ...DATA.topHeads.map(h => ({...h, id: h.name, type: 'head'}))
      ]);
    });
    return () => unsub();
  }, []);

  const topNurses = recognitions.filter(r => r.type === 'nurse').sort((a, b) => b.votes - a.votes);
  const topHeads = recognitions.filter(r => r.type === 'head').sort((a, b) => b.votes - a.votes);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-1.5 text-[22px] font-extrabold">رسائل التقدير والشكر</h2>
      <p className="mb-6 text-[15px] text-text-secondary">تكريم الكوادر التمريضية المتميزة</p>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DATA.recognitionStats.map(stat => {
          const Icon = iconMap[stat.icon];
          return (
            <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-red-500/30 hover:shadow-2xl">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Icon className="h-5 w-5 fill-current opacity-20" />
              </div>
              <div className="text-[28px] font-extrabold leading-tight">{stat.value}</div>
              <div className="mt-1 text-sm text-text-secondary">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
          <div className="mb-4">
            <h3 className="flex items-center text-[17px] font-bold">
              <Heart className="ml-2 h-4 w-4 text-gold fill-gold" /> أكثر الممرضين تقديراً
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {topNurses.slice(0, 5).map((n, i) => (
              <div key={n.id} className="flex items-center gap-3.5 rounded-md bg-white/5 p-2.5 transition-colors hover:bg-gold/5">
                <span className="w-[26px] text-center text-sm font-extrabold text-gold">#{i + 1}</span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white shadow-sm">
                  {n.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{n.name}</div>
                  <div className="text-xs text-text-muted">{n.dept}</div>
                </div>
                <span className="text-[13px] font-semibold text-gold">❤️ {n.votes.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
          <div className="mb-4">
            <h3 className="flex items-center text-[17px] font-bold">
              <Crown className="ml-2 h-4 w-4 text-gold fill-gold" /> أكثر رؤساء الأقسام تقديراً
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {topHeads.slice(0, 5).map((h, i) => (
              <div key={h.id} className="flex items-center gap-3.5 rounded-md bg-white/5 p-2.5 transition-colors hover:bg-gold/5">
                <span className="w-[26px] text-center text-sm font-extrabold text-gold">#{i + 1}</span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white shadow-sm">
                  {h.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{h.name}</div>
                  <div className="text-xs text-text-muted">{h.dept}</div>
                </div>
                <span className="text-[13px] font-semibold text-gold">🏆 {h.votes.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/15 bg-card-gradient p-6 shadow-2xl transition-all">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[160px] flex-1">
            <h3 className="flex items-center text-lg font-bold">
              <Trophy className="ml-2 h-5 w-5 text-gold" /> جائزة فلورانس بالتصويت الشعبي
            </h3>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">حنان ثابت حكمي</span>
                <span className="text-[13px] text-text-muted">رئيس قسم التمريض</span>
                <span className="text-[13px] font-semibold text-gold">10,674 صوت</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">فاطمة سالم مجرشي</span>
                <span className="text-[13px] text-text-muted">الحروق — أفضل رئيس قسم</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">حسن احمد فتحي</span>
                <span className="text-[13px] text-text-muted">العناية المركزة — أفضل مشرف</span>
              </div>
            </div>
          </div>
          <div className="rounded-md border-r-4 border-gold bg-gold/5 px-5 py-3">
            <div className="text-[13px] text-text-secondary">🏅 الجوائز السنوية</div>
            <div className="text-[15px] font-bold text-gold">2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}
