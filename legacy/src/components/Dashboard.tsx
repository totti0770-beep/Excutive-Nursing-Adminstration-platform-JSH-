import React from "react";
import { Heart, Crown, Award, Presentation, Smile, ArrowUp, Star, UserRound, Eye, Target, Gem } from "lucide-react";
import { DATA } from '../data';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState(DATA.stats);
  const [departments, setDepartments] = useState(DATA.departments);
  const [topNurses, setTopNurses] = useState(DATA.topNurses);
  const [topHeads, setTopHeads] = useState(DATA.topHeads);

  useEffect(() => {
    const unsubStats = onSnapshot(doc(db, 'system', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as any);
      }
    }, (error) => console.log('Firestore access error, using local data', error));

    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      if (!snapshot.empty) {
        setDepartments(snapshot.docs.map(d => d.data() as any));
      }
    }, (error) => console.log('Firestore access error, using local data', error));

    const unsubRecs = onSnapshot(collection(db, 'recognitions'), (snapshot) => {
      if (!snapshot.empty) {
        const all = snapshot.docs.map(d => d.data() as any);
        setTopNurses(all.filter(r => r.type === 'nurse').sort((a, b) => b.votes - a.votes));
        setTopHeads(all.filter(r => r.type === 'head').sort((a, b) => b.votes - a.votes));
      }
    }, (error) => console.log('Firestore access error, using local data', error));

    return () => {
      unsubStats();
      unsubDepts();
      unsubRecs();
    };
  }, []);

  const chartData = {
    labels: departments.map(d => d.name),
    datasets: [{
      data: departments.map(d => d.nurses),
      backgroundColor: ['#d4af37', '#f0d060', '#b8962c', '#2d9cdb'],
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </div>
  );
}
