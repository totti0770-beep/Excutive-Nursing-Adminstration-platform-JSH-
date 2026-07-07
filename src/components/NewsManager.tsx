import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, Plus, Search, Edit2, Trash2, Megaphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { Modal } from './Modal';

interface NewsType {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  published_at?: any;
}

export function NewsManager() {
  const [news, setNews] = useState<NewsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'news'), (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsType)));
    }, (error) => {
      console.error('Error fetching news', error);
      setNews([
        { id: '1', title: 'Code Red Drill', content: 'There will be a drill tomorrow.', status: 'published', priority: 'high' }
      ]);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const priority = formData.get('priority') as string;
    
    try {
      await addDoc(collection(db, 'news'), {
        title,
        content,
        priority,
        status: 'published',
        published_at: serverTimestamp(),
      });
      showToast('✅ تم نشر الخبر بنجاح');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('❌ حدث خطأ أثناء النشر');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      try {
        await deleteDoc(doc(db, 'news', id));
        showToast('✅ تم الحذف بنجاح');
      } catch(err) {
        showToast('❌ حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mb-0 text-[22px] font-extrabold">إدارة الأخبار والتعاميم</h2>
          <p className="mb-0 text-[15px] text-text-secondary">نشر التعاميم الهامة والأخبار العاجلة للطاقم</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-[14px] font-bold text-white transition-all hover:bg-gold-light hover:shadow-lg"
        >
          <Plus className="h-4 w-4" /> نشر خبر جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map(item => (
          <div key={item.id} className="relative flex flex-col rounded-2xl border border-gold/5 bg-bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                item.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {item.priority === 'high' ? 'عاجل' : 'عادي'}
              </span>
              <div className="flex gap-2 text-text-muted">
                <button className="hover:text-gold"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="mb-2 text-[17px] font-bold leading-tight">{item.title}</h3>
            <p className="mb-4 text-sm text-text-secondary line-clamp-3">{item.content}</p>
          </div>
        ))}
        {news.length === 0 && (
          <div className="col-span-full py-10 text-center text-text-muted">لا توجد أخبار منشورة حالياً</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="نشر خبر جديد" subtitle="سيتم إرسال إشعار للموظفين">
        <form onSubmit={handleSave} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">عنوان الخبر</label>
            <input name="title" required type="text" className="h-10 w-full rounded-lg border border-gold/20 bg-transparent px-3 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">الأهمية</label>
            <select name="priority" className="h-10 w-full rounded-lg border border-gold/20 bg-transparent px-3 text-sm outline-none focus:border-gold">
              <option value="normal">عادي</option>
              <option value="high">عاجل (يظهر كشريط تنبيه أحمر)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">المحتوى</label>
            <textarea name="content" required rows={4} className="w-full rounded-lg border border-gold/20 bg-transparent p-3 text-sm outline-none focus:border-gold"></textarea>
          </div>
          <button type="submit" className="mt-2 w-full rounded-lg bg-gold py-2.5 text-sm font-bold text-white hover:bg-gold-light">
            نشر الآن
          </button>
        </form>
      </Modal>
    </div>
  );
}
