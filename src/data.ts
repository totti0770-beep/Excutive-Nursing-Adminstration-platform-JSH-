export const DATA = {
  stats: {
    nurses: 719,
    satisfaction: 99,
    training: 33,
    experience: 30,
  },
  departments: [
    { name: 'العيادات الخارجية', supervisor: '', nurses: 4, shifts: 1 },
    { name: 'النساء والولادة', supervisor: '', nurses: 4, shifts: 4 },
    { name: 'مركز السكري', supervisor: '', nurses: 4, shifts: 1 },
    { name: 'غرف العمليات', supervisor: '', nurses: 4, shifts: 2 },
  ],
  topNurses: [
    { name: '', dept: 'العناية المركزة', votes: 4900 },
    { name: '', dept: 'الطوارئ', votes: 4200 },
    { name: '', dept: 'العيادات الخارجية', votes: 3800 },
    { name: '', dept: 'النساء والولادة', votes: 3400 },
    { name: '', dept: 'مركز السكري', votes: 3100 },
  ],
  topHeads: [
    { name: '', dept: 'قسم التمريض', votes: 5303 },
    { name: '', dept: 'العناية المركزة', votes: 4800 },
    { name: '', dept: 'الحروق', votes: 4100 },
    { name: '', dept: 'الطوارئ', votes: 3700 },
    { name: '', dept: 'العيادات الخارجية', votes: 3300 },
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
