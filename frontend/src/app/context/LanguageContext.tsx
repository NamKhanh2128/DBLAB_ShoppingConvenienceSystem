import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'vi' | 'en';

interface LanguageContextType {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  vi: {
    'app.name': 'Hệ thống tiện lợi mua sắm',
    'nav.dashboard': 'Tổng quan',
    'nav.shopping': 'Mua sắm',
    'nav.inventory': 'Kho thực phẩm',
    'nav.meal-plan': 'Kế hoạch ăn',
    'nav.recipes': 'Công thức',
    'nav.reports': 'Báo cáo',
    'nav.family': 'Gia đình',
    'nav.settings': 'Cài đặt',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.add': 'Thêm',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.view': 'Xem',
    'common.search': 'Tìm kiếm',
    'common.loading': 'Đang tải...',
    'common.all': 'Tất cả',
    'settings.title': 'Cài đặt',
    'settings.profile': 'Thông tin cá nhân',
    'settings.language': 'Ngôn ngữ & Hiển thị',
    'settings.notifications': 'Thông báo',
    'settings.security': 'Bảo mật',
  },
  en: {
    'app.name': 'Shopping Convenience System',
    'nav.dashboard': 'Dashboard',
    'nav.shopping': 'Shopping',
    'nav.inventory': 'Inventory',
    'nav.meal-plan': 'Meal Plan',
    'nav.recipes': 'Recipes',
    'nav.reports': 'Reports',
    'nav.family': 'Family',
    'nav.settings': 'Settings',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.all': 'All',
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.language': 'Language & Display',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(() => {
    const stored = localStorage.getItem('app_language');
    return (stored === 'en' ? 'en' : 'vi') as Lang;
  });

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    // Update html lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, []);

  const t = (key: string): string => {
    return translations[language][key] ?? translations['vi'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
