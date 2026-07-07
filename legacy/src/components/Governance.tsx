import React from 'react';
import { Quote } from 'lucide-react';

export function Governance() {
  const members = [
    'أ. بندر قحل', 'Emad Fagehi', 'Jubran Sahli', 
    'Nowayer Maddhali', 'Mohammad Sabie', 'Eatem'
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-1.5 text-[22px] font-extrabold">مجالس الحوكمة التمريضية</h2>
      <p className="mb-6 text-[15px] text-text-secondary">هيكل القيادة التمريضية في مستشفى جازان التخصصي</p>

      <div className="mb-5.5 rounded-2xl border border-gold/10 bg-bg-card p-6 transition-colors hover:border-gold/20">
        <div className="mb-1 text-[20px] font-bold text-gold">المجلس التنفيذي للتمريض</div>
        <div className="mb-3 text-sm text-text-secondary">أعلى هيئة تمريضية في المستشفى</div>
        <div className="mb-4 text-sm leading-relaxed text-text-secondary">
          تضم كبار القيادات التمريضية وتختص بوضع السياسات الاستراتيجية والإشراف العام على جميع المجالس التمريضية.
        </div>
        <div className="flex flex-wrap gap-2.5">
          {members.map(member => (
            <span key={member} className="rounded-full border border-gold/10 bg-gold/10 px-4 py-1.5 text-sm font-medium">
              {member}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gold/10 bg-bg-card p-6 transition-colors hover:border-gold/20">
          <div className="text-[15px] font-bold text-gold">مجلس الجودة</div>
          <div className="mt-1 text-[13px] text-text-secondary">جودة التمريض وسلامة المرضى</div>
        </div>
        <div className="rounded-2xl border border-gold/10 bg-bg-card p-6 transition-colors hover:border-gold/20">
          <div className="text-[15px] font-bold text-gold">مجلس التعليم</div>
          <div className="mt-1 text-[13px] text-text-secondary">تعليم وتطوير الكوادر</div>
        </div>
        <div className="rounded-2xl border border-gold/10 bg-bg-card p-6 transition-colors hover:border-gold/20">
          <div className="text-[15px] font-bold text-gold">مجلس الممارسة</div>
          <div className="mt-1 text-[13px] text-text-secondary">الممارسة المهنية والبحوث</div>
        </div>
      </div>

      <div className="mt-5 rounded-md border-r-4 border-gold bg-gold/5 p-4 sm:px-5">
        <p className="flex items-start text-sm text-text-secondary">
          <Quote className="ml-2 h-4 w-4 shrink-0 text-gold" />
          بيئة تشاركية تعزز صوت التمريض في صناعة القرار وتطوير الممارسات المهنية، تدعم التميز في جودة الرعاية الصحية.
        </p>
      </div>
    </div>
  );
}
