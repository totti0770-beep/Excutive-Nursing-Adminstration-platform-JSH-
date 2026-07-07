import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, Download, Search, Plus, Filter, MoreVertical, File } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { Modal } from './Modal';

interface DocumentType {
  id: string;
  title: string;
  category: string;
  department_tags: string[];
  status: string;
  effective_date?: any;
}

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userRole } = useAuth();
  const { showToast } = useToast();

  const isAdminOrQuality = userRole === 'System Admin' || userRole === 'Quality Officer';

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'documents'), (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentType)));
    }, (error) => {
      console.error('Error fetching documents', error);
      // Fallback local data
      setDocuments([
        { id: 'CPP-001', title: 'Medication Administration Policy', category: 'CPP', department_tags: ['General'], status: 'published' },
        { id: 'APP-012', title: 'Annual Leave Request Form', category: 'FRM', department_tags: ['HR'], status: 'published' },
      ]);
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    
    try {
      await addDoc(collection(db, 'documents'), {
        title,
        category,
        department_tags: ['General'],
        status: 'published',
        effective_date: serverTimestamp(),
        uploaded_at: serverTimestamp()
      });
      showToast('✅ تم رفع الوثيقة بنجاح');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('❌ حدث خطأ أثناء الرفع');
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mb-0 text-[22px] font-extrabold">مركز الوثائق والسياسات</h2>
          <p className="mb-0 text-[15px] text-text-secondary">السياسات، الإجراءات، والنماذج المعتمدة</p>
        </div>
        {isAdminOrQuality && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-[14px] font-bold text-white transition-all hover:bg-gold-light hover:shadow-lg"
          >
            <Plus className="h-4 w-4" /> إضافة وثيقة جديدة
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="ابحث عن سياسة، نموذج، أو كود..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-gold/10 bg-bg-card pr-10 pl-4 text-[14px] font-medium outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gold/10 bg-bg-card px-4 font-semibold text-text-secondary transition-colors hover:bg-gold/5">
          <Filter className="h-4 w-4" /> تصفية
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold/5 bg-bg-card">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">الرمز</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">عنوان الوثيقة</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">الفئة</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">الحالة</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-text-secondary"></th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => (
              <tr key={doc.id} className="group transition-colors hover:bg-gold/5">
                <td className="border-b border-white/5 px-4.5 py-3.5 font-bold text-text-secondary">{doc.id.substring(0, 8).toUpperCase()}</td>
                <td className="border-b border-white/5 px-4.5 py-3.5 font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold" /> {doc.title}
                </td>
                <td className="border-b border-white/5 px-4.5 py-3.5">
                  <span className="inline-flex items-center justify-center rounded-md bg-white/5 px-2 py-1 text-[12px] font-bold">
                    {doc.category}
                  </span>
                </td>
                <td className="border-b border-white/5 px-4.5 py-3.5">
                  <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[12px] font-bold ${
                    doc.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {doc.status === 'published' ? 'معتمد' : 'مسودة'}
                  </span>
                </td>
                <td className="border-b border-white/5 px-4.5 py-3.5 text-left">
                  <button className="rounded-full p-1.5 text-text-muted hover:bg-gold/10 hover:text-gold transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  {isAdminOrQuality && (
                    <button className="rounded-full p-1.5 text-text-muted hover:bg-gold/10 hover:text-gold transition-colors ml-1">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-text-muted">لا توجد وثائق مطابقة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة وثيقة جديدة" subtitle="رفع سياسة أو نموذج جديد للمركز">
        <form onSubmit={handleUpload} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">عنوان الوثيقة</label>
            <input name="title" required type="text" className="h-10 w-full rounded-lg border border-gold/20 bg-transparent px-3 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">الفئة</label>
            <select name="category" className="h-10 w-full rounded-lg border border-gold/20 bg-transparent px-3 text-sm outline-none focus:border-gold">
              <option value="CPP">CPP (سياسة سريرية)</option>
              <option value="APP">APP (سياسة إدارية)</option>
              <option value="FRM">FRM (نموذج)</option>
              <option value="MAN">MAN (دليل)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">الملف (PDF)</label>
            <div className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gold/20 bg-white/5 transition-colors hover:border-gold/50">
              <File className="mb-2 h-6 w-6 text-gold/50" />
              <span className="text-sm font-medium text-text-muted">اضغط لرفع الملف</span>
            </div>
          </div>
          <button type="submit" className="mt-2 w-full rounded-lg bg-gold py-2.5 text-sm font-bold text-white hover:bg-gold-light">
            رفع واعتماد
          </button>
        </form>
      </Modal>
    </div>
  );
}
