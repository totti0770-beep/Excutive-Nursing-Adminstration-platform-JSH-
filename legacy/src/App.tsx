import { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Governance } from './components/Governance';
import { Departments } from './components/Departments';
import { Schedule } from './components/Schedule';
import { Training } from './components/Training';
import { Quality } from './components/Quality';
import { Recognition } from './components/Recognition';
import { Survey } from './components/Survey';
import { Permissions } from './components/Permissions';
import { DocumentLibrary } from './components/DocumentLibrary';
import { NewsManager } from './components/NewsManager';
import { Heart } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

function MainApp() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { showToast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      showToast('👋 مرحباً بك في بوابة التمريض');
    }, 500);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await logout();
      showToast('👋 تم تسجيل الخروج بنجاح');
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen}
        activePage={activePage}
        onNavigate={handleNavigate}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />
      
      <main className="flex min-h-screen flex-1 flex-col px-4 pb-10 transition-all lg:mr-[260px] lg:px-8">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        <div className="flex-1">
          {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activePage === 'governance' && <Governance />}
          {activePage === 'departments' && <Departments />}
          {activePage === 'schedule' && <Schedule />}
          {activePage === 'training' && <Training />}
          {activePage === 'quality' && <Quality />}
          {activePage === 'recognition' && <Recognition />}
          {activePage === 'survey' && <Survey />}
          {activePage === 'permissions' && <Permissions />}
          {activePage === 'documents' && <DocumentLibrary />}
          {activePage === 'news' && <NewsManager />}
        </div>

        <div className="mt-10 border-t border-gold/5 pt-4 text-center text-[13px] text-text-muted">
          <Heart className="mx-1.5 inline-block h-3.5 w-3.5 fill-gold text-gold" />
          مستشفى جازان التخصصي — بوابة التمريض
          <span className="mx-2.5">|</span> v3.0
          <span className="mx-2.5">|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('health-crm.replit.app'); }} className="text-gold no-underline">
            health-crm.replit.app
          </a>
        </div>
      </main>
    </>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
