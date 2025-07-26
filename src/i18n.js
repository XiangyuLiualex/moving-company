import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译文件
import zhTranslation from './locales/zh.json';
import enTranslation from './locales/en.json';

// 获取用户之前选择的语言，默认为中文
const getStoredLanguage = () => {
  const stored = localStorage.getItem('language');
  return stored || 'zh';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zhTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: getStoredLanguage(), // 默认语言
    fallbackLng: 'zh', // 回退语言
    interpolation: {
      escapeValue: false // React已经安全地转义了
    }
  });

// 语言切换函数
export const changeLanguage = (language) => {
  i18n.changeLanguage(language);
  localStorage.setItem('language', language);
};

export default i18n; 