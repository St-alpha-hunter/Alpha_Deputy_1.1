import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

// 默认英文；用户手动切换过语言就记住，刷新后保持
const LANG_KEY = 'lang';
const readSavedLang = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'zh' || saved === 'en' ? saved : 'en';
  } catch {
    return 'en';
  }
};

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch {
    // 隐私模式等情况下存不了，忽略即可
  }
  document.documentElement.lang = lng === 'zh' ? 'zh-CN' : 'en';
});

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
    },
    lng: readSavedLang(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;