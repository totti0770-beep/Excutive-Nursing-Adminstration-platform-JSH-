import React, { useState, useEffect } from 'react';
import { 
  Quote, Download, Users, ShieldCheck, Award, 
  Search, Activity, Calendar, Clock, 
  CheckCircle, ArrowUpRight, GraduationCap, 
  Briefcase, ChevronRight, Edit2, Save, Plus, Trash2, RotateCcw
} from 'lucide-react';
import { useToast } from './Toast';

export interface CouncilNode {
  id: string;
  name: string;
  type: 'executive' | 'council' | 'committee';
  chairperson: string;
  role: string;
  members: string[];
  objectives: string[];
  frequency: string;
  parentId?: string;
  icon?: React.ReactNode;
  description: string;
  committees: {
    id: string;
    name: string;
    chairperson: string;
    members: string[];
    objectives: string[];
    frequency: string;
  }[];
}

const INITIAL_NODES_DATA: Omit<CouncilNode, 'icon'>[] = [
  {
    id: 'executive_council',
    name: 'المجلس التنفيذي للتمريض',
    type: 'executive',
    chairperson: '', // Cleared
    role: 'مدير إدارة التمريض العام',
    members: [], // Cleared
    objectives: [
      'صياغة الرؤية والتوجهات الاستراتيجية للخدمات التمريضية بالمستشفى',
      'اعتماد السياسات والقرارات التمريضية الكبرى والمصادقة عليها',
      'التنسيق والربط المتكامل بين جميع المجالس واللجان التمريضية الفرعية',
      'متابعة الخطط التشغيلية وخطط القوى العاملة للتمريض وإقرار الميزانيات'
    ],
    frequency: 'شهرياً (أول ثلاثاء من كل شهر)',
    description: 'أعلى هيئة تمريضية في المستشفى ومظلة الحوكمة الشاملة لكافة القرارات والسياسات المهنية.',
    committees: []
  },
  {
    id: 'quality_council',
    name: 'مجلس الجودة وسلامة المرضى',
    type: 'council',
    chairperson: '', // Cleared
    role: 'رئيس وحدة الجودة التمريضية',
    parentId: 'executive_council',
    members: [], // Cleared
    objectives: [
      'مراقبة وتحليل مؤشرات الأداء التمريضي السريرية والتشغيلية',
      'تعزيز ثقافة سلامة المرضى والحد من الأخطاء والحدث الجسيم',
      'إعداد وتدقيق تقارير الامتثال لمعايير CBAHI وJCI وتطوير الحلول التصحيحية',
      'مراجعة جودة التوثيق والملفات التمريضية في نظام رعاية المريض'
    ],
    frequency: 'كل أسبوعين (يوم الأربعاء)',
    description: 'يتولى ضمان تقديم رعاية تمريضية آمنة ومطابقة لأرقى المعايير الوطنية والعالمية.',
    committees: [
      {
        id: 'quality_comm_1',
        name: 'لجنة تدقيق السجلات التمريضية',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['مراجعة عشوائية للملفات الطبية الإلكترونية', 'تحسين مستوى دقة وتكامل خطة الرعاية المكتوبة'],
        frequency: 'أسبوعياً'
      },
      {
        id: 'quality_comm_2',
        name: 'لجنة مؤشرات الأداء وإدارة المخاطر',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['تتبع معدلات السقوط وقرح الفراش والمضاعفات السريرية', 'وضع خطط وقائية للحد من المخاطر السريرية'],
        frequency: 'شهرياً'
      }
    ]
  },
  {
    id: 'education_council',
    name: 'مجلس التعليم والتطوير المهني',
    type: 'council',
    chairperson: '', // Cleared
    role: 'مديرة إدارة التطوير والتدريب المستمر',
    parentId: 'executive_council',
    members: [], // Cleared
    objectives: [
      'تخطيط وتنفيذ برامج التعليم المستمر للكوادر التمريضية بمختلف المستويات',
      'تقييم الكفاءات السريرية الأساسية والتخصصية السنوية وضمان جاهزيتها',
      'الإشراف على برامج تدريب أطباء وطلاب الامتياز والزملاء الجدد في المهنة',
      'دعم المبادرات البحثية والممارسات المبنية على البراهين العلمية الحديثة'
    ],
    frequency: 'كل أسبوعين (يوم الخميس)',
    description: 'يختص ببناء قدرات ومهارات الكوادر التمريضية لضمان استدامة التميز العلمي والعملي.',
    committees: [
      {
        id: 'edu_comm_1',
        name: 'لجنة التدريب السريري والامتياز',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['متابعة سير تقييم أطباء امتياز التمريض وتطبيق الدليل السريري', 'إدارة وتنسيق الورش التعليمية المتخصصة في المهارات الدقيقة'],
        frequency: 'كل أسبوعين'
      },
      {
        id: 'edu_comm_2',
        name: 'لجنة أبحاث التمريض والابتكار',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['تشجيع إجراء الأبحاث التمريضية الميدانية في المستشفى', 'مواءمة الممارسات اليومية مع أحدث ما توصلت إليه البراهين الطبية'],
        frequency: 'شهرياً'
      }
    ]
  },
  {
    id: 'practice_council',
    name: 'مجلس الممارسة السريرية والسياسات',
    type: 'council',
    chairperson: '', // Cleared
    role: 'مشرف التمريض الإكلينيكي التخصصي',
    parentId: 'executive_council',
    members: [], // Cleared
    objectives: [
      'صياغة ومراجعة السياسات والبروتوكولات الإجرائية وتحديثها دورياً',
      'تطوير مسارات الرعاية الطبية للمرضى المنومين في الأقسام الحرجة والتخصصية',
      'دراسة وتطبيق التقنيات السريرية والأدوات المستحدثة وتحديث المعايير المهنية',
      'الارتقاء برعاية المرضى من خلال تعزيز أدوار التمريض المتقدم إكلينيكياً'
    ],
    frequency: 'شهرياً (الأربعاء الأخير)',
    description: 'المرجع الفني والسريري لصياغة البروتوكولات التمريضية لضمان تماشيها مع معايير جودة الرعاية.',
    committees: [
      {
        id: 'practice_comm_1',
        name: 'لجنة السياسات والبروتوكولات المهنية',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['صياغة وتعديل الأدلة السريرية التمريضية ومواءمتها محلياً', 'نشر وتوعية الكوادر بالسياسات المعتمدة حديثاً بمختلف الأقسام'],
        frequency: 'شهرياً'
      },
      {
        id: 'practice_comm_2',
        name: 'لجنة الرعاية التخصصية والحرجة',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['تحسين إجراءات رعاية غرف الطوارئ والعناية المركزة وحضانات الأطفال', 'متابعة الكفاءات والبروتوكولات التخصصية الدقيقة للرعايات الحرجة'],
        frequency: 'شهرياً'
      }
    ]
  },
  {
    id: 'leadership_council',
    name: 'مجلس القيادة والتمكين وصوت التمريض',
    type: 'council',
    chairperson: '', // Cleared
    role: 'مشرف التخطيط والقوى العاملة التمريضية',
    parentId: 'executive_council',
    members: [], // Cleared
    objectives: [
      'تمكين التمريض في بيئة العمل وبناء الصفوف القيادية الشابة الواعدة',
      'مراقبة معدلات الرضا المهني، وابتكار المبادرات لتحسين بيئة العمل ومكافحة الاحتراق',
      'التحسين والعدالة في تنسيق الجداول التشغيلية وتوزيع أعباء العمل والمناوبات',
      'إدارة برامج تكريم التمريض المتميز ونشر ثقافة التقدير المؤسسي المستمر'
    ],
    frequency: 'شهرياً (الإثنين الثاني من كل شهر)',
    description: 'مجلس رعاية الكوادر، وتمكين قادة المستقبل، وضمان جودة البيئة التشغيلية والرفاه الوظيفي.',
    committees: [
      {
        id: 'lead_comm_1',
        name: 'لجنة الرفاهية والرضا الوظيفي',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['استطلاع وتحليل آراء الممرضين والممرضات حول بيئة العمل والضغط المهني', 'تطوير مبادرات الدعم النفسي والأنشطة الاجتماعية والرياضية للكوادر'],
        frequency: 'كل أسبوعين'
      },
      {
        id: 'lead_comm_2',
        name: 'لجنة جوائز التميز والتكريم',
        chairperson: '', // Cleared
        members: [], // Cleared
        objectives: ['تنسيق برامج التكريم الشهري لنجوم التمريض المتميزين', 'الإشراف على احتفالات يوم التمريض العالمي السنوية في المستشفى'],
        frequency: 'شهرياً'
      }
    ]
  }
];

interface GovernanceStructureProps {
  nodes: CouncilNode[];
  onSaveNode: (updatedNode: CouncilNode) => void;
}

export function GovernanceStructure({ nodes, onSaveNode }: GovernanceStructureProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('executive_council');
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);

  // Editing state
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editChairperson, setEditChairperson] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  // Editing Committee State
  const [isEditingComm, setIsEditingComm] = useState(false);
  const [editCommChair, setEditCommChair] = useState('');
  const [editCommMembers, setEditCommMembers] = useState<string[]>([]);
  const [newCommMemberName, setNewCommMemberName] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedCommitteeId(null);
    setIsEditingNode(false);
    setIsEditingComm(false);
  };

  const selectCommittee = (commId: string) => {
    setSelectedCommitteeId(commId);
    setIsEditingComm(false);
  };

  const getSelectedCommitteeDetails = () => {
    if (!selectedCommitteeId) return null;
    return selectedNode.committees.find(c => c.id === selectedCommitteeId);
  };

  // Open Edit Council Node
  const handleOpenEditNode = () => {
    setEditChairperson(selectedNode.chairperson);
    setEditRole(selectedNode.role);
    setEditMembers(selectedNode.members);
    setNewMemberName('');
    setIsEditingNode(true);
  };

  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    if (editMembers.includes(name)) {
      showToast('⚠️ العضو مضاف بالفعل');
      return;
    }
    setEditMembers([...editMembers, name]);
    setNewMemberName('');
  };

  const handleRemoveMember = (idxToRemove: number) => {
    setEditMembers(editMembers.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSaveNodeEdit = () => {
    const updated: CouncilNode = {
      ...selectedNode,
      chairperson: editChairperson.trim(),
      role: editRole.trim(),
      members: editMembers
    };
    onSaveNode(updated);
    setIsEditingNode(false);
    showToast('✅ تم حفظ بيانات المجلس وتحديث الأسماء بنجاح');
  };

  // Open Edit Sub-Committee Node
  const handleOpenEditComm = (comm: any) => {
    setEditCommChair(comm.chairperson);
    setEditCommMembers(comm.members);
    setNewCommMemberName('');
    setIsEditingComm(true);
  };

  const handleAddCommMember = () => {
    const name = newCommMemberName.trim();
    if (!name) return;
    if (editCommMembers.includes(name)) {
      showToast('⚠️ العضو مضاف بالفعل');
      return;
    }
    setEditCommMembers([...editCommMembers, name]);
    setNewCommMemberName('');
  };

  const handleRemoveCommMember = (idxToRemove: number) => {
    setEditCommMembers(editCommMembers.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSaveCommEdit = () => {
    if (!selectedCommitteeId) return;
    const updatedCommittees = selectedNode.committees.map(c => {
      if (c.id === selectedCommitteeId) {
        return {
          ...c,
          chairperson: editCommChair.trim(),
          members: editCommMembers
        };
      }
      return c;
    });

    const updatedNode: CouncilNode = {
      ...selectedNode,
      committees: updatedCommittees
    };
    onSaveNode(updatedNode);
    setIsEditingComm(false);
    showToast('✅ تم حفظ بيانات اللجنة بنجاح');
  };

  // Filter nodes/committees by search query
  const filteredNodes = searchQuery.trim() === '' ? nodes : nodes.filter(n => 
    n.name.includes(searchQuery) ||
    n.chairperson.includes(searchQuery) ||
    n.members.some(m => m.includes(searchQuery)) ||
    n.committees.some(c => c.name.includes(searchQuery) || c.chairperson.includes(searchQuery) || c.members.some(m => m.includes(searchQuery)))
  );

  return (
    <div>
      {/* Search Input Bar */}
      <div className="relative mb-6.5 max-w-md">
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-muted">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          placeholder="ابحث عن مجلس، لجنة، رئيس، أو عضو حوكمة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gold/10 bg-bg-card py-3 pl-4 pr-11 text-sm outline-none transition-all placeholder:text-text-muted focus:border-gold/35 focus:ring-2 focus:ring-gold/5"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 left-3 my-auto h-fit text-[11px] font-semibold text-text-muted hover:text-gold"
          >
            مسح
          </button>
        )}
      </div>

      {/* Interactive Hierarchical Org Chart Layout */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-gold/5 bg-bg-card p-6.5 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-text-primary">
          <span className="h-2 w-2 rounded-full bg-gold"></span>
          مخطط هيكل الحوكمة التفاعلي (اضغط على أي وحدة لعرض تفاصيلها وتعيين الأسماء)
        </h3>

        <div className="flex flex-col items-center">
          
          {/* Level 1: EXECUTIVE COUNCIL (ROOT NODE) */}
          <div className="relative z-10 w-full max-w-xl">
            <div
              onClick={() => selectNode('executive_council')}
              className={`group cursor-pointer rounded-2xl border p-5.5 text-center transition-all ${
                selectedNodeId === 'executive_council'
                  ? 'border-gold bg-gold/15 shadow-xl ring-2 ring-gold/10'
                  : 'border-gold/10 bg-white/5 hover:border-gold/40 hover:bg-gold/5'
              }`}
            >
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5.5 w-5.5" />
              </div>
              <div className="text-[16px] font-extrabold text-gold">المجلس التنفيذي للتمريض</div>
              <div className="mt-1 text-[13px] font-medium text-text-secondary">
                الرئيس: {nodes.find(n => n.id === 'executive_council')?.chairperson ? (
                  <span className="font-bold text-gold">{nodes.find(n => n.id === 'executive_council')?.chairperson}</span>
                ) : (
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">شاغر (اضغط للتعيين)</span>
                )}
              </div>
              <div className="mt-2 text-xs text-text-muted">الجهة العليا المعتمدة للسياسات وخطط القوى العاملة والتمكين العام</div>
            </div>
          </div>

          {/* Connective Spacers / Branching visual line */}
          <div className="relative h-12 w-1.5 bg-gold/20"></div>

          {/* Level 2: Sub-Councils Grid */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nodes.slice(1).map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div key={node.id} className="relative flex flex-col items-center">
                  {/* Decorative tiny connector line */}
                  <div className="h-4 w-0.5 bg-gold/20"></div>
                  
                  <div
                    onClick={() => selectNode(node.id)}
                    className={`group w-full cursor-pointer rounded-xl border p-4.5 text-center transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/10 shadow-lg ring-2 ring-gold/10'
                        : 'border-gold/5 bg-white/5 hover:border-gold/30 hover:bg-gold/5'
                    }`}
                  >
                    <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/5 text-gold">
                      {node.id === 'quality_council' && <Activity className="h-5 w-5 text-brand-teal" />}
                      {node.id === 'education_council' && <GraduationCap className="h-5 w-5 text-purple-500" />}
                      {node.id === 'practice_council' && <Briefcase className="h-5 w-5 text-blue-500" />}
                      {node.id === 'leadership_council' && <Award className="h-5 w-5 text-gold" />}
                    </div>
                    <div className="text-[13.5px] font-bold leading-snug text-text-primary">{node.name}</div>
                    <div className="mt-1.5 text-xs text-text-secondary">
                      الرئيس: {node.chairperson ? (
                        <span className="font-semibold text-gold">{node.chairperson}</span>
                      ) : (
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">شاغر</span>
                      )}
                    </div>
                    
                    <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-gold">
                      تفاصيل المجلس وطاقمه <ChevronRight className="h-3 w-3 rotate-90" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node / Council Bento Grid Details Panel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        
        {/* Panel 1 & 2: Primary Scope, Objectives, Committees */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          {/* Main Selected Council Details */}
          <div className="rounded-2xl border border-gold/5 bg-bg-card p-6.5 transition-all hover:border-gold/15">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                {selectedNode.type === 'executive' ? 'المجلس الأعلى' : 'مجلس حوكمة تخصصي'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Clock className="h-3.5 w-3.5" /> {selectedNode.frequency}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gold">{selectedNode.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{selectedNode.description}</p>

            <div className="my-5.5 h-px bg-gold/10"></div>

            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> الاختصاصات والأهداف الاستراتيجية المعتمدة:
            </h4>
            <ul className="flex flex-col gap-2.5 pr-1 text-sm text-text-secondary">
              {selectedNode.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-gold"></span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active Sub-Committees Block within selected Council */}
          {selectedNode.committees.length > 0 && (
            <div className="rounded-2xl border border-gold/5 bg-bg-card p-6.5 transition-all hover:border-gold/15">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-gold">
                <Users className="h-4 w-4" /> اللجان الفرعية النشطة التابعة للمجلس:
              </h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {selectedNode.committees.map((comm) => {
                  const isSelectedComm = selectedCommitteeId === comm.id;
                  return (
                    <div
                      key={comm.id}
                      onClick={() => selectCommittee(comm.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelectedComm
                          ? 'border-gold bg-gold/10 shadow-sm'
                          : 'border-gold/5 bg-white/5 hover:border-gold/20 hover:bg-gold/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-bold text-text-primary">{comm.name}</div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <div className="mt-1.5 text-xs text-text-secondary">
                        الرئيس: {comm.chairperson ? (
                          <span className="font-semibold text-gold">{comm.chairperson}</span>
                        ) : (
                          <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 rounded">شاغر</span>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-text-muted">اضغط لاستعراض التفاصيل وإدارة الأعضاء</div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-committee details block if one is active */}
              {selectedCommitteeId && getSelectedCommitteeDetails() && (
                <div className="mt-5 rounded-xl border border-gold/15 bg-gold/5 p-4.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mb-3.5 flex items-center justify-between">
                    <h5 className="text-[13.5px] font-extrabold text-gold">
                      تفاصيل اللجنة: {getSelectedCommitteeDetails()?.name}
                    </h5>
                    <button
                      onClick={() => handleOpenEditComm(getSelectedCommitteeDetails())}
                      className="flex items-center gap-1 rounded bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold hover:bg-gold/20"
                    >
                      <Edit2 className="h-3 w-3" /> تعيين رئيس وأعضاء اللجنة
                    </button>
                  </div>
                  
                  {isEditingComm ? (
                    <div className="space-y-3 rounded-lg border border-gold/15 bg-bg-card p-3.5 mt-2">
                      <div>
                        <label className="block text-xs text-text-muted mb-1">اسم رئيس اللجنة:</label>
                        <input
                          type="text"
                          value={editCommChair}
                          onChange={(e) => setEditCommChair(e.target.value)}
                          className="w-full rounded border border-gold/20 bg-bg-primary px-2.5 py-1 text-sm outline-none"
                          placeholder="مثال: أمل مجرشي"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-muted mb-1">أعضاء اللجنة الحالية ({editCommMembers.length}):</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={newCommMemberName}
                            onChange={(e) => setNewCommMemberName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCommMember()}
                            className="flex-1 rounded border border-gold/20 bg-bg-primary px-2 py-1 text-xs outline-none"
                            placeholder="أدخل اسم العضو..."
                          />
                          <button
                            onClick={handleAddCommMember}
                            className="bg-gold px-2.5 py-1 rounded text-white text-xs font-bold"
                          >
                            إضافة
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                          {editCommMembers.map((member, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-xs text-text-secondary">
                              {member}
                              <button onClick={() => handleRemoveCommMember(idx)} className="text-red-400 hover:text-red-500 font-extrabold">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveCommEdit} className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-1">
                          <Save className="h-3 w-3" /> حفظ اللجنة
                        </button>
                        <button onClick={() => setIsEditingComm(false)} className="border border-gold/20 px-3 py-1 rounded text-text-secondary text-xs">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 text-[12.5px] text-text-secondary">
                        <span className="font-semibold text-text-primary">رئيس اللجنة المعين:</span> {getSelectedCommitteeDetails()?.chairperson ? (
                          <span className="font-bold text-gold">{getSelectedCommitteeDetails()?.chairperson}</span>
                        ) : (
                          <span className="text-xs text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded inline-block">لم يُعيّن بعد</span>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="text-[12.5px] font-semibold text-text-primary mb-1">أعضاء اللجنة المشاركون:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {getSelectedCommitteeDetails()?.members.map(member => (
                            <span key={member} className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-text-secondary">
                              {member}
                            </span>
                          ))}
                          {(!getSelectedCommitteeDetails()?.members || getSelectedCommitteeDetails()?.members.length === 0) && (
                            <span className="text-xs text-text-muted italic">لا يوجد أعضاء معينين حالياً</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[12.5px] font-semibold text-text-primary mb-1">الاختصاصات والمهام الموكلة:</div>
                        <ul className="list-disc pr-4 text-xs leading-relaxed text-text-secondary flex flex-col gap-1">
                          {getSelectedCommitteeDetails()?.objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Panel 3: Chairperson Profile, Officers, Members Grid */}
        <div className="flex flex-col gap-5">
          
          {/* Chairperson Executive Profile Card */}
          <div className="rounded-2xl border border-gold/5 bg-bg-card p-6.5 text-center transition-all hover:border-gold/15">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">رئيس المجلس الحالي</h4>
              <button
                onClick={handleOpenEditNode}
                className="flex items-center gap-1 rounded bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold hover:bg-gold/20"
              >
                <Edit2 className="h-3 w-3" /> تعديل المجلس
              </button>
            </div>
            
            {isEditingNode ? (
              <div className="space-y-3.5 text-right border border-gold/10 bg-white/5 p-4 rounded-xl">
                <div>
                  <label className="block text-xs text-text-muted mb-1">اسم رئيس المجلس:</label>
                  <input
                    type="text"
                    value={editChairperson}
                    onChange={(e) => setEditChairperson(e.target.value)}
                    className="w-full rounded border border-gold/20 bg-bg-primary px-3 py-1.5 text-sm outline-none"
                    placeholder="أدخل اسم رئيس المجلس..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">المسمى الوظيفي للرئيس:</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full rounded border border-gold/20 bg-bg-primary px-3 py-1.5 text-sm outline-none"
                    placeholder="مثال: مدير التمريض العام"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">أعضاء المجلس الحالية ({editMembers.length}):</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                      className="flex-1 rounded border border-gold/20 bg-bg-primary px-2 py-1 text-xs outline-none"
                      placeholder="أدخل اسم عضو..."
                    />
                    <button
                      onClick={handleAddMember}
                      className="bg-gold px-2.5 py-1 rounded text-white text-xs font-bold"
                    >
                      أضف
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                    {editMembers.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-xs">
                        {m}
                        <button onClick={() => handleRemoveMember(idx)} className="text-red-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSaveNodeEdit} className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded text-white text-xs font-bold flex items-center gap-1">
                    <Save className="h-3.5 w-3.5" /> حفظ البيانات
                  </button>
                  <button onClick={() => setIsEditingNode(false)} className="border border-gold/20 px-3 py-1.5 rounded text-text-secondary text-xs">
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient text-lg font-bold text-white shadow-md">
                  {selectedNode.chairperson ? (
                    selectedNode.chairperson.split(' ').pop()?.charAt(0) || selectedNode.chairperson.charAt(0)
                  ) : (
                    '؟'
                  )}
                </div>

                <div className="text-base font-bold text-text-primary">
                  {selectedNode.chairperson ? (
                    selectedNode.chairperson
                  ) : (
                    <span className="text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded">شاغر (اضغط تعديل للتعيين)</span>
                  )}
                </div>
                <div className="mt-1 text-xs font-medium text-gold">{selectedNode.role}</div>
                <div className="mt-3.5 rounded-full border border-gold/10 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> دورية الانعقاد: {selectedNode.frequency.split(' ')[0]}
                </div>
              </>
            )}
          </div>

          {/* Officers / Members Panel list */}
          {!isEditingNode && (
            <div className="rounded-2xl border border-gold/5 bg-bg-card p-6.5 transition-all hover:border-gold/15">
              <h4 className="mb-3.5 text-sm font-bold text-gold">أعضاء ومستشاري المجلس الحاليين ({selectedNode.members.length})</h4>
              
              <div className="flex flex-col gap-2.5">
                {selectedNode.members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-gold/5">
                    <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-gold/10 text-xs font-bold text-gold">
                      {member.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-primary">{member}</div>
                      <div className="text-[11px] text-text-muted">عضو مجلس الحوكمة المعتمد</div>
                    </div>
                  </div>
                ))}
                {selectedNode.members.length === 0 && (
                  <div className="py-6 text-center text-xs text-text-muted italic">لا يوجد أعضاء معينين حالياً</div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export function Governance() {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes] = useState<CouncilNode[]>([]);

  // Load from local storage or set initial values
  useEffect(() => {
    const saved = localStorage.getItem('nursing_governance_nodes');
    if (saved) {
      try {
        setNodes(JSON.parse(saved));
      } catch (e) {
        initializeDefaults();
      }
    } else {
      initializeDefaults();
    }
  }, []);

  const initializeDefaults = () => {
    setNodes(INITIAL_NODES_DATA as CouncilNode[]);
    localStorage.setItem('nursing_governance_nodes', JSON.stringify(INITIAL_NODES_DATA));
  };

  const handleSaveNode = (updatedNode: CouncilNode) => {
    const updated = nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    setNodes(updated);
    localStorage.setItem('nursing_governance_nodes', JSON.stringify(updated));
  };

  // Helper functions for Rounded Rectangles and wrapping text on Canvas
  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    showToast('⏳ جاري إعداد وتوليد التقرير المعتمد للهيكل التنظيمي والأسماء المخصصة...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1750;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D canvas context');

      // Set canvas background and clear
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Premium Background Banner (Deep Navy / Clinical Imperial Blue)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, 160);

      // Accent lines (Saudi Medical Gold)
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(0, 160, canvas.width, 8);

      // Hospital Brand Typography (Header)
      ctx.fillStyle = '#FFFFFF';
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';

      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('مستشفى جازان التخصصي - إدارة الخدمات التمريضية', 1120, 65);

      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#D4AF37';
      ctx.fillText('التقرير المعتمد لهيكل مجالس ولجان الحوكمة التمريضية (V3)', 1120, 115);

      // Metadata on Left
      ctx.fillStyle = '#E2E8F0';
      ctx.textAlign = 'left';
      ctx.font = '15px sans-serif';
      ctx.fillText(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`, 80, 70);
      ctx.fillText('الحالة: وثيقة حوكمة نشطة ومفعّلة ومخصصة', 80, 105);

      // Center the layout
      ctx.textAlign = 'center';

      // Load Executive Council Data
      const execNode = nodes.find(n => n.id === 'executive_council') || INITIAL_NODES_DATA[0];

      // --- Draw Level 1: EXECUTIVE COUNCIL CARD ---
      const execY = 220;
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 4;
      drawRoundRect(ctx, 300, execY, 600, 140, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(execNode.name, 600, execY + 45);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#4F46E5';
      ctx.fillText(`الرئيس العام: ${execNode.chairperson || 'غير معين'} (${execNode.role})`, 600, execY + 80);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748B';
      const execMembersStr = execNode.members && execNode.members.length > 0 
        ? execNode.members.join(' | ') 
        : 'لم يتم تعيين الأعضاء حالياً في النظام';
      ctx.fillText(`الأعضاء: ${execMembersStr}`, 600, execY + 115);

      // --- Draw Branching Connection lines ---
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 3;

      // Vertical line out from Executive Council card
      ctx.beginPath();
      ctx.moveTo(600, execY + 140);
      ctx.lineTo(600, execY + 200);
      ctx.stroke();

      // Horizontal line bridging the four main councils
      const councilY = execY + 250;
      ctx.beginPath();
      ctx.moveTo(175, execY + 200);
      ctx.lineTo(1025, execY + 200);
      ctx.stroke();

      // Four vertical lines dropped into each main council
      const colXs = [175, 458, 741, 1025];
      colXs.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, execY + 200);
        ctx.lineTo(x, councilY);
        ctx.stroke();
      });

      // --- Draw Level 2: 4 MAIN COUNCIL CARDS ---
      const councilColors = ['#D4AF37', '#3B82F6', '#A855F7', '#06B6D4'];
      const subCouncilKeys = ['leadership_council', 'practice_council', 'education_council', 'quality_council'];

      subCouncilKeys.forEach((key, idx) => {
        const cNode = nodes.find(n => n.id === key) || INITIAL_NODES_DATA.find(n => n.id === key)!;
        const cx = colXs[idx];
        const cardW = 240;
        const cardH = 200;
        const cardX = cx - cardW / 2;
        const themeColor = councilColors[idx];

        // Card Border and shadow fill
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 2.5;
        drawRoundRect(ctx, cardX, councilY, cardW, cardH, 12);
        ctx.fill();
        ctx.stroke();

        // Card Colored Top Header
        ctx.fillStyle = `${themeColor}15`; 
        drawRoundRect(ctx, cardX, councilY, cardW, 45, 12);
        ctx.fill();

        // Inner Card text
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(cNode.name, cx, councilY + 28);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`الرئيس: ${cNode.chairperson || 'شاغر'}`, cx, councilY + 75);

        // Active Committees listing within card
        ctx.fillStyle = '#64748B';
        ctx.font = '10px sans-serif';
        ctx.fillText('اللجان الفرعية:', cx, councilY + 110);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11.5px sans-serif';
        const comm1 = cNode.committees[0]?.name || 'لجنة فرعية 1';
        const comm2 = cNode.committees[1]?.name || 'لجنة فرعية 2';
        ctx.fillText(`• ${comm1}`, cx, councilY + 140);
        ctx.fillText(`• ${comm2}`, cx, councilY + 170);
      });

      // --- Draw Level 3: DETAILED RESPONSIBILITIES TABLE ---
      const tableY = execY + 500;
      ctx.fillStyle = '#F8FAFC';
      drawRoundRect(ctx, 60, tableY, 1080, 800, 16);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('تفصيل الاختصاصات والأدوار والمسؤولين عن اللجان التابعة', 1110, tableY + 50);

      // Table Header row background
      ctx.fillStyle = '#EEF2FF';
      ctx.fillRect(80, tableY + 80, 1040, 45);

      // Table Headers labels
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#4F46E5';
      ctx.textAlign = 'right';
      ctx.fillText('المجلس التابع', 1100, tableY + 108);
      ctx.fillText('اللجنة والمسؤول المعين', 840, tableY + 108);
      ctx.fillText('الاختصاصات التفصيلية للممارسة والتدريب والرفاهية والرضا التمريضي', 570, tableY + 108);
      ctx.textAlign = 'left';
      ctx.fillText('الاجتماع', 100, tableY + 108);

      // Populate dynamic table rows based on current names
      const tableRows: any[] = [];
      nodes.forEach(n => {
        n.committees.forEach(c => {
          tableRows.push({
            council: n.name,
            name: `${c.name} \n(${c.chairperson ? 'رئيس: ' + c.chairperson : 'رئيس: شاغر'})`,
            desc: c.objectives.join(' - '),
            freq: c.frequency
          });
        });
      });

      tableRows.forEach((r, idx) => {
        const rowY = tableY + 135 + (idx * 78);
        if (idx >= 8) return; // Keep layout bounded
        
        // Alternating Table Rows
        if (idx % 2 === 1) {
          ctx.fillStyle = '#F1F5F9';
          ctx.fillRect(80, rowY, 1040, 70);
        }

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'right';
        ctx.fillText(r.council, 1100, rowY + 38);

        ctx.fillStyle = '#4F46E5';
        ctx.font = 'bold 11px sans-serif';
        const lines = r.name.split('\n');
        ctx.fillText(lines[0], 840, rowY + 30);
        if (lines[1]) {
          ctx.fillStyle = '#D4AF37';
          ctx.fillText(lines[1], 840, rowY + 48);
        }

        ctx.fillStyle = '#475569';
        ctx.font = '11px sans-serif';
        drawWrappedText(ctx, r.desc, 570, rowY + 28, 450, 18);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(r.freq, 100, rowY + 38);
      });

      // --- Premium Footer ---
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.font = '13px sans-serif';
      ctx.fillText('إدارة الجودة والأداء التمريضي - مستشفى جازان التخصصي - تقرير رسمي معتمد لحوكمة التمريض', 600, canvas.height - 30);

      // Create PDF using the rasterized high-res canvas
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Nursing_Governance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      showToast('✅ تم تحميل تقرير مجالس الحوكمة واللجان بنجاح (PDF)');
    } catch (err) {
      console.error(err);
      showToast('❌ عذراً، فشل توليد وثيقة الـ PDF المعتمدة');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Upper Navigation and Header Title block */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-[22px] font-extrabold leading-tight">مجالس ولجان الحوكمة التمريضية</h2>
          <p className="mt-1 text-[15px] text-text-secondary">تخصيص وإسناد المناصب التنظيمية وصوت الهيكل الأكاديمي والسريري</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من تفريغ كافة الأسماء بالهيكل وإعادة تعيينه؟')) {
                initializeDefaults();
                showToast('🔄 تم تصفير كافة الأسماء بالهيكل بنجاح');
              }
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-400 hover:bg-red-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            تصفير الهيكل التنظيمي
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-gradient px-5 py-3 text-[14px] font-bold text-white shadow-lg shadow-gold/15 transition-all hover:scale-[1.02] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'جاري تصدير التقرير...' : 'تحميل وثيقة الحوكمة (PDF)'}
          </button>
        </div>
      </div>

      {/* Overview Block with Apple Health design aesthetics */}
      <div className="mb-7 rounded-2xl border border-gold/10 bg-bg-card p-5.5 transition-all hover:border-gold/15">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[14.5px] leading-relaxed text-text-secondary">
                "إن نموذج الحوكمة التشاركية التمريضية بمستشفى جازان التخصصي يهدف للتمكين والمساءلة وتطوير معايير الممارسة السريرية، وضمان أن ممرضي وممرضات الصفوف الأمامية يشاركون فعلياً في صياغة قرارات الرعاية الصحية لتحقيق أفضل نتائج ممكنة للمرضى."
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[13px] font-bold text-gold">إدارة الخدمات التمريضية</span>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs text-text-muted">مستشفى جازان التخصصي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the GovernanceStructure Component */}
      {nodes.length > 0 && (
        <GovernanceStructure 
          nodes={nodes} 
          onSaveNode={handleSaveNode} 
        />
      )}

    </div>
  );
}
