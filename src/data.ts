export const DATA = {
  stats: {
    nurses: 719,
    satisfaction: 99,
    training: 33,
    experience: 30,
  },
  departments: [
    { name: 'العناية المركزة كبار/ أطفال', supervisor: '', nurses: 4, shifts: 4 },
    { name: 'قسم الطوارئ', supervisor: '', nurses: 4, shifts: 3 },
    { name: 'العيادات الخارجية', supervisor: '', nurses: 4, shifts: 1 },
    { name: 'العمليات', supervisor: '', nurses: 4, shifts: 2 },
    { name: 'أمراض الدم', supervisor: '', nurses: 4, shifts: 2 },
    { name: 'قسم الأورام - كبار', supervisor: '', nurses: 4, shifts: 2 },
    { name: 'جراحة الأورام', supervisor: '', nurses: 4, shifts: 2 },
    { name: 'عناية اليوم الواحد', supervisor: '', nurses: 4, shifts: 1 },
    { name: 'الأورام - أطفال', supervisor: '', nurses: 4, shifts: 2 },
  ],
  topNurses: [
    { name: '', dept: 'العناية المركزة كبار/ أطفال', votes: 4900 },
    { name: '', dept: 'قسم الطوارئ', votes: 4200 },
    { name: '', dept: 'العيادات الخارجية', votes: 3800 },
    { name: '', dept: 'العمليات', votes: 3400 },
    { name: '', dept: 'أمراض الدم', votes: 3100 },
  ],
  topHeads: [
    { name: '', dept: 'قسم التمريض', votes: 5303 },
    { name: '', dept: 'قسم الأورام - كبار', votes: 4800 },
    { name: '', dept: 'جراحة الأورام', votes: 4100 },
    { name: '', dept: 'عناية اليوم الواحد', votes: 3700 },
    { name: '', dept: 'الأورام - أطفال', votes: 3300 },
  ],
  nurseNames: [
    '', '', '',
    '', '', '',
    '', '', '',
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
