import React, { useState, useEffect } from 'react';
import { Award, University, GraduationCap, Globe, CheckCircle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Training() {
  const [trainings, setTrainings] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'training'), (snapshot) => {
      setTrainings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('Error fetching training', error);
    });
    return () => unsub();
  }, []);

  const trainingItems = [
    { name: 'برامج تدريبية داخلية', count: '12 برنامج', icon: Award },
    { name: 'برامج الدبلومات', count: '8 برامج', icon: University },
    { name: 'سنة الامتياز', count: '6 برامج', icon: GraduationCap },
    { name: 'برامج خارجية', count: '7 برامج', icon: Globe },
  ];

  const fallbackCertificates = [
    { name: 'شهادة التمريض المتقدم', count: '15 ممرض' },
    { name: 'دورة العناية المركزة', count: '22 ممرض' },
    { name: 'تدريب قادة التمريض', count: '8 مشرفين' },
    { name: 'برنامج سلامة المرضى', count: '34 ممرض' },
  ];

  const displayCerts = trainings.length > 0 ? trainings : fallbackCertificates;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-1.5 text-[22px] font-extrabold">التطوير المهني</h2>
      <p className="mb-6 text-[15px] text-text-secondary">برامج تدريبية وشهادات مهنية</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trainingItems.map(item => (
          <div key={item.name} className="rounded-md border border-gold/5 bg-bg-card px-5 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold/20 hover:shadow-2xl">
            <item.icon className="mx-auto mb-2 h-7 w-7 text-gold" />
            <div className="text-[15px] font-semibold">{item.name}</div>
            <div className="mt-1 text-[13px] text-text-muted">{item.count}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-gold/5 bg-bg-card p-6 transition-all hover:border-gold/15 hover:shadow-2xl">
        <h3 className="mb-2 text-[17px] font-bold">📜 الشهادات والتدريب (من قاعدة البيانات)</h3>
        <ul className="flex flex-col gap-2 text-sm text-text-secondary">
          {displayCerts.map((cert, index) => (
            <li 
              key={cert.id || cert.name} 
              className={`flex items-center gap-2.5 py-1.5 ${index !== displayCerts.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <CheckCircle className="h-4 w-4 text-gold" />
              {cert.name || cert.title} – {cert.count || 'تدريب جديد'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
