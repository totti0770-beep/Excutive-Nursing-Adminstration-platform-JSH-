import React, { useState, useEffect } from 'react';
import { Heart, Mail, UserCheck, Crown, Trophy, Edit2, Save, RotateCcw } from 'lucide-react';
import { DATA } from '../data';
import { useToast } from './Toast';

interface RecognitionType {
  id: string;
  name: string;
  dept: string;
  votes: number;
  type: string;
}

interface AnnualAwardsType {
  winner1: string;
  winner1Role: string;
  winner1Votes: string;
  winner2: string;
  winner2Role: string;
  winner3: string;
  winner3Role: string;
}

export function Recognition() {
  const { showToast } = useToast();
  const iconMap: Record<string, any> = { Heart, Mail, UserCheck };
  
  // State for recognitions (Top Voted Nurses and Top Voted Heads)
  const [recognitions, setRecognitions] = useState<RecognitionType[]>([]);
  
  // State for annual awards
  const [annualAwards, setAnnualAwards] = useState<AnnualAwardsType>({
    winner1: '',
    winner1Role: '',
    winner1Votes: '',
    winner2: '',
    winner2Role: '',
    winner3: '',
    winner3Role: ''
  });

  // State for overall statistics
  const [stats, setStats] = useState({
    nurseVotes: '0',
    totalLetters: '0',
    supervisorsRecognized: '0'
  });

  // Toggle Edit Panel
  const [isEditing, setIsEditing] = useState(false);

  // Load from local storage or set initial values with no personal names
  useEffect(() => {
    const savedRecs = localStorage.getItem('nursing_recognition_list');
    const savedAwards = localStorage.getItem('nursing_recognition_awards');
    const savedStats = localStorage.getItem('nursing_recognition_stats');

    if (savedRecs) {
      try { setRecognitions(JSON.parse(savedRecs)); } catch (e) { resetToDefaults(); }
    } else {
      resetToDefaults();
    }

    if (savedAwards) {
      try { setAnnualAwards(JSON.parse(savedAwards)); } catch (e) { resetAwardsDefaults(); }
    } else {
      resetAwardsDefaults();
    }

    if (savedStats) {
      try { setStats(JSON.parse(savedStats)); } catch (e) { resetStatsDefaults(); }
    } else {
      resetStatsDefaults();
    }
  }, []);

  const resetToDefaults = () => {
    const defaults: RecognitionType[] = [
      { id: 'n1', name: '', dept: 'العناية المركزة كبار/ أطفال', votes: 4900, type: 'nurse' },
      { id: 'n2', name: '', dept: 'قسم الطوارئ', votes: 4200, type: 'nurse' },
      { id: 'n3', name: '', dept: 'العيادات الخارجية', votes: 3800, type: 'nurse' },
      { id: 'n4', name: '', dept: 'العمليات', votes: 3400, type: 'nurse' },
      { id: 'n5', name: '', dept: 'أمراض الدم', votes: 3100, type: 'nurse' },
      { id: 'h1', name: '', dept: 'قسم التمريض', votes: 5303, type: 'head' },
      { id: 'h2', name: '', dept: 'قسم الأورام - كبار', votes: 4800, type: 'head' },
      { id: 'h3', name: '', dept: 'جراحة الأورام', votes: 4100, type: 'head' },
      { id: 'h4', name: '', dept: 'عناية اليوم الواحد', votes: 3700, type: 'head' },
      { id: 'h5', name: '', dept: 'الأورام - أطفال', votes: 3300, type: 'head' }
    ];
    setRecognitions(defaults);
    localStorage.setItem('nursing_recognition_list', JSON.stringify(defaults));
  };

  const resetAwardsDefaults = () => {
    const defaults: AnnualAwardsType = {
      winner1: '',
      winner1Role: 'رئيس قسم التمريض',
      winner1Votes: '10,674',
      winner2: '',
      winner2Role: 'الحروق — أفضل رئيس قسم',
      winner3: '',
      winner3Role: 'العناية المركزة — أفضل مشرف'
    };
    setAnnualAwards(defaults);
    localStorage.setItem('nursing_recognition_awards', JSON.stringify(defaults));
  };

  const resetStatsDefaults = () => {
    const defaults = {
      nurseVotes: '4,900',
      totalLetters: '5,303',
      supervisorsRecognized: '389'
    };
    setStats(defaults);
    localStorage.setItem('nursing_recognition_stats', JSON.stringify(defaults));
  };

  const handleSaveAll = () => {
    localStorage.setItem('nursing_recognition_list', JSON.stringify(recognitions));
    localStorage.setItem('nursing_recognition_awards', JSON.stringify(annualAwards));
    localStorage.setItem('nursing_recognition_stats', JSON.stringify(stats));
    setIsEditing(false);
    showToast('✅ تم حفظ كافة أسماء وجوائز التقدير بنجاح');
  };

  const handleUpdateItem = (id: string, field: 'name' | 'dept' | 'votes', value: string | number) => {
    const updated = recognitions.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setRecognitions(updated);
  };

  const topNurses = recognitions.filter(r => r.type === 'nurse').sort((a, b) => b.votes - a.votes);
  const topHeads = recognitions.filter(r => r.type === 'head').sort((a, b) => b.votes - a.votes);

  const displayStats = [
    { label: 'للممرضين والممرضات', value: stats.nurseVotes, icon: 'Heart' },
    { label: 'إجمالي رسائل التقدير', value: stats.totalLetters, icon: 'Mail' },
    { label: 'لرؤساء تمريض الأقسام', value: stats.supervisorsRecognized, icon: 'UserCheck' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-[22px] font-extrabold">رسائل التقدير والشكر</h2>
          <p className="mb-0 text-[15px] text-text-secondary">تكريم الكوادر التمريضية المتميزة على مستوى المستشفى</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-all ${isEditing ? 'border-gold bg-gold text-white' : 'border-gold/20 bg-gold/10 text-gold hover:bg-gold/20'}`}
        >
          <Edit2 className="h-4 w-4" />
          {isEditing ? 'إغلاق لوحة التعديل' : 'تعيين وتعديل الأسماء والجوائز'}
        </button>
      </div>

      {/* Editing panel */}
      {isEditing && (
        <div className="mb-7 rounded-2xl border border-gold/25 bg-bg-card p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="mb-4 text-base font-bold text-gold flex items-center gap-2">🛠️ لوحة تخصيص وتعيين أسماء المتميزين</h3>
          
          <div className="space-y-6">
            {/* Annual Awards Winners */}
            <div className="rounded-xl border border-gold/10 bg-white/5 p-4">
              <h4 className="mb-3 text-[14px] font-bold text-gold flex items-center gap-1.5">
                <Trophy className="h-4 w-4" /> جائزة فلورانس بالتصويت الشعبي (السنوية)
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">الفائز الأول (رئيس قسم التمريض):</label>
                  <input
                    type="text"
                    value={annualAwards.winner1}
                    onChange={(e) => setAnnualAwards({ ...annualAwards, winner1: e.target.value })}
                    className="w-full rounded-lg border border-gold/20 bg-bg-primary px-3 py-1.5 text-sm outline-none focus:border-gold"
                    placeholder="مثال: أسماء كريري"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">الفائز الثاني (أفضل رئيس قسم):</label>
                  <input
                    type="text"
                    value={annualAwards.winner2}
                    onChange={(e) => setAnnualAwards({ ...annualAwards, winner2: e.target.value })}
                    className="w-full rounded-lg border border-gold/20 bg-bg-primary px-3 py-1.5 text-sm outline-none focus:border-gold"
                    placeholder="مثال: يحيى مجرشي"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">الفائز الثالث (أفضل مشرف):</label>
                  <input
                    type="text"
                    value={annualAwards.winner3}
                    onChange={(e) => setAnnualAwards({ ...annualAwards, winner3: e.target.value })}
                    className="w-full rounded-lg border border-gold/20 bg-bg-primary px-3 py-1.5 text-sm outline-none focus:border-gold"
                    placeholder="مثال: مريم خبراني"
                  />
                </div>
              </div>
            </div>

            {/* Top Voted Nurses & Heads list */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-gold/10 bg-white/5 p-4">
                <h4 className="mb-3 text-[14px] font-bold text-gold flex items-center gap-1.5">
                  <Heart className="h-4 w-4" /> تعديل قائمة الممرضين الأكثر تقديراً
                </h4>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {recognitions.filter(item => item.type === 'nurse').map(item => (
                    <div key={item.id} className="flex gap-2 items-center bg-bg-primary p-2 rounded-lg border border-white/5">
                      <span className="text-xs text-text-muted font-bold w-6 text-center">#{item.id.replace('n', '')}</span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-b border-gold/20 text-sm outline-none px-1 text-text-primary focus:border-gold"
                        placeholder="أدخل اسم الممرض..."
                      />
                      <input
                        type="text"
                        value={item.dept}
                        onChange={(e) => handleUpdateItem(item.id, 'dept', e.target.value)}
                        className="w-24 bg-transparent border-b border-gold/20 text-xs outline-none px-1 text-text-secondary focus:border-gold"
                        placeholder="القسم"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gold/10 bg-white/5 p-4">
                <h4 className="mb-3 text-[14px] font-bold text-gold flex items-center gap-1.5">
                  <Crown className="h-4 w-4" /> تعديل قائمة رؤساء الأقسام الأكثر تقديراً
                </h4>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {recognitions.filter(item => item.type === 'head').map(item => (
                    <div key={item.id} className="flex gap-2 items-center bg-bg-primary p-2 rounded-lg border border-white/5">
                      <span className="text-xs text-text-muted font-bold w-6 text-center">#{item.id.replace('h', '')}</span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-b border-gold/20 text-sm outline-none px-1 text-text-primary focus:border-gold"
                        placeholder="أدخل اسم رئيس القسم..."
                      />
                      <input
                        type="text"
                        value={item.dept}
                        onChange={(e) => handleUpdateItem(item.id, 'dept', e.target.value)}
                        className="w-24 bg-transparent border-b border-gold/20 text-xs outline-none px-1 text-text-secondary focus:border-gold"
                        placeholder="القسم"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons inside the editor */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gold-light"
              >
                <Save className="h-4 w-4" />
                حفظ كافة الأسماء المعينة
              </button>
              <button
                onClick={() => {
                  if (confirm('هل تريد إعادة تعيين كافة القيم إلى شاغرة؟')) {
                    resetToDefaults();
                    resetAwardsDefaults();
                    showToast('🔄 تم مسح كافة الأسماء بنجاح');
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20"
              >
                <RotateCcw className="h-4 w-4" />
                مسح الأسماء وإعادة التعيين
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats display */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {displayStats.map(stat => {
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

      {/* Main Boards */}
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
                  {n.name ? n.name.trim().charAt(0) : '؟'}
                </div>
                <div className="flex-1">
                  {n.name ? (
                    <div className="text-sm font-semibold text-text-primary">{n.name}</div>
                  ) : (
                    <div className="text-xs text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded inline-block">شاغر (اضغط للتعيين)</div>
                  )}
                  <div className="text-xs text-text-muted mt-0.5">{n.dept}</div>
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
                  {h.name ? h.name.trim().charAt(0) : '؟'}
                </div>
                <div className="flex-1">
                  {h.name ? (
                    <div className="text-sm font-semibold text-text-primary">{h.name}</div>
                  ) : (
                    <div className="text-xs text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded inline-block">شاغر (اضغط للتعيين)</div>
                  )}
                  <div className="text-xs text-text-muted mt-0.5">{h.dept}</div>
                </div>
                <span className="text-[13px] font-semibold text-gold">🏆 {h.votes.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Annual Awards Display */}
      <div className="rounded-2xl border border-gold/15 bg-card-gradient p-6 shadow-2xl transition-all">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[160px] flex-1">
            <h3 className="flex items-center text-lg font-bold">
              <Trophy className="ml-2 h-5 w-5 text-gold" /> جائزة فلورانس بالتصويت الشعبي
            </h3>
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gold border border-gold/30 rounded px-1.5 py-0.5">المرتبة الأولى</span>
                {annualAwards.winner1 ? (
                  <span className="font-bold text-text-primary">{annualAwards.winner1}</span>
                ) : (
                  <span className="text-xs text-red-400 bg-red-500/5 rounded px-1.5">شاغر (اضغط للتعيين)</span>
                )}
                <span className="text-[13px] text-text-muted">— {annualAwards.winner1Role}</span>
                <span className="text-[13px] font-semibold text-gold">{annualAwards.winner1Votes} صوت</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gold/80 border border-gold/20 rounded px-1.5 py-0.5">أفضل رئيس قسم</span>
                {annualAwards.winner2 ? (
                  <span className="font-bold text-text-primary">{annualAwards.winner2}</span>
                ) : (
                  <span className="text-xs text-red-400 bg-red-500/5 rounded px-1.5">شاغر</span>
                )}
                <span className="text-[13px] text-text-muted">— {annualAwards.winner2Role}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gold/80 border border-gold/20 rounded px-1.5 py-0.5">أفضل مشرف تمريض</span>
                {annualAwards.winner3 ? (
                  <span className="font-bold text-text-primary">{annualAwards.winner3}</span>
                ) : (
                  <span className="text-xs text-red-400 bg-red-500/5 rounded px-1.5">شاغر</span>
                )}
                <span className="text-[13px] text-text-muted">— {annualAwards.winner3Role}</span>
              </div>
            </div>
          </div>
          <div className="rounded-md border-r-4 border-gold bg-gold/5 px-5 py-3 text-left">
            <div className="text-[13px] text-text-secondary">🏅 الجوائز السنوية</div>
            <div className="text-[15px] font-bold text-gold">2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}
