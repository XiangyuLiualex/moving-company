import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import '../styles/language-switcher.scss';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language;
  const isChinese = currentLanguage === 'zh';

  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-switcher">
      <button 
        className="language-button"
        onClick={toggleDropdown}
        aria-label="Switch language"
      >
        <span className="language-flag">
          {isChinese ? '🇨🇳' : '🇺🇸'}
        </span>
        <span className="language-text">
          {isChinese ? '中文' : 'EN'}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <button
            className={`language-option ${currentLanguage === 'zh' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('zh')}
          >
            <span className="flag">🇨🇳</span>
            <span>中文</span>
          </button>
          <button
            className={`language-option ${currentLanguage === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            <span className="flag">🇺🇸</span>
            <span>English</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher; 