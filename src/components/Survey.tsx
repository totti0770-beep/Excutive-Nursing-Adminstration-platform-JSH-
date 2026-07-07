import { Vote, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from './Toast';

export function Survey() {
  const { showToast } = useToast();

  const openSurvey = () => {
    showToast('📝 جاري فتح الاستبيان...');
    setTimeout(() => {
      window.open('https://forms.google.com', '_blank');
    }, 500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-1.5 text-[22px] font-extrabold">استبيان رضا الكادر التمريضي</h2>
      <p className="mb-6 text-[15px] text-text-secondary">صوتكم يصنع الفرق</p>

      <div className="mx-auto max-w-[620px] rounded-2xl border border-gold/15 bg-card-gradient p-7 text-center shadow-2xl">
        <div className="mb-3 text-[44px] text-gold flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-4"><path d="M3 3v18h18"/><path d="M13 17V9"/><path d="M18 17V5"/><path d="M8 17v-3"/></svg>
        </div>
        <h3 className="mb-2 text-[20px] font-bold">زملاءنا وزملاءنا الكرام،</h3>
        <p className="mb-5 text-[15px] leading-relaxed text-text-secondary">
          صوتكم يصنع الفرق، ورأيكم هو الأساس في تطوير بيئة العمل وتحسين تجربة التمريض داخل المستشفى.
          ندعوكم إلى تخصيص بضع دقائق للمشاركة في استبيان رضا الكادر التمريضي بكل شفافية وموضوعية.
          فكل إجابة تمثل فرصة حقيقية للتطوير، وكل ملاحظة تسهم في بناء بيئة عمل أفضل للجميع.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button 
            onClick={openSurvey}
            className="inline-flex items-center gap-2.5 rounded-full bg-accent-gradient px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" /> الانتقال إلى الاستبيان
          </button>
          <button 
            onClick={() => showToast('تم إغلاق الاستبيان حالياً')}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:border-gold hover:text-gold"
          >
            إغلاق
          </button>
        </div>
        <div className="mt-4 text-[13px] text-text-muted flex items-center justify-center gap-1.5">
          <Clock className="h-4 w-4" /> مدة الاستبيان: 5 دقائق
        </div>
      </div>
    </div>
  );
}
