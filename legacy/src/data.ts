export const DATA = {
  stats: {
    nurses: 719,
    satisfaction: 99,
    training: 33,
    experience: 30,
  },
  departments: [
    { name: 'العيادات الخارجية', supervisor: 'عبد مصبحي', nurses: 4, shifts: 1 },
    { name: 'النساء والولادة', supervisor: 'أروى اسماعيل', nurses: 4, shifts: 4 },
    { name: 'مركز السكري', supervisor: 'أمل حمزي', nurses: 4, shifts: 1 },
    { name: 'غرف العمليات', supervisor: 'خالد شراحيلي', nurses: 4, shifts: 2 },
  ],
  topNurses: [
    { name: 'اميره محمد مضوي', dept: 'العناية المركزة', votes: 4900 },
    { name: 'عائشة ولي حكمي', dept: 'الطوارئ', votes: 4200 },
    { name: 'خريبة محمد كاملي', dept: 'العيادات الخارجية', votes: 3800 },
    { name: 'اشواق محمد مبارك', dept: 'النساء والولادة', votes: 3400 },
    { name: 'مها حسن عقدي', dept: 'مركز السكري', votes: 3100 },
  ],
  topHeads: [
    { name: 'نجوم حسن حكمي', dept: 'قسم التمريض', votes: 5303 },
    { name: 'نوره علي حطاباني', dept: 'العناية المركزة', votes: 4800 },
    { name: 'عبيسه محمد علي بوريزه', dept: 'الحروق', votes: 4100 },
    { name: 'كريمة الشحات سيد احمد', dept: 'الطوارئ', votes: 3700 },
    { name: 'منال حكمي', dept: 'العيادات الخارجية', votes: 3300 },
  ],
  nurseNames: [
    'أحمد محمد علي', 'فاطمة حسن إبراهيم', 'سارة خالد عبدالله',
    'نورة سعيد العمري', 'مريم عوض الزهراني', 'علياء صالح الغامدي',
    'خالد عبدالرحمن', 'منى يوسف السيد', 'ريما ناصر القحطاني',
  ],
  qualityStats: [
    { label: 'جودة الخدمة التمريضية', value: '100%', sub: 'بناءً على 474 تقييم', icon: 'ClipboardCheck', color: '#2d9cdb' },
    { label: 'تعديل', value: '0', sub: 'المعدل العام للسقوط', icon: 'FileText', color: '#2d9cdb' },
    { label: 'معدل رضا المريض', value: '99%', sub: '2,882 تقييم للأقسام', icon: 'UserRound', color: '#2d9cdb' },
  ],
  recognitionStats: [
    { label: 'للممرضين', value: '4,900', icon: 'Heart', color: '#ef4444' },
    { label: 'إجمالي رسائل التقدير', value: '5,303', icon: 'Mail', color: '#ef4444' },
    { label: 'للإرساء التمريض', value: '389', icon: 'UserCheck', color: '#ef4444' },
  ],
};
