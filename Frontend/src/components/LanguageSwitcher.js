import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown } from 'react-bootstrap';
import { FaGlobe, FaLanguage } from 'react-icons/fa';
import i18n from '../i18n';

const LanguageSwitcher = () => {
  const { t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <Dropdown className="language-switcher">
      <Dropdown.Toggle 
        as={Button} 
        variant="outline-light" 
        size="sm"
        className="d-flex align-items-center gap-2"
        style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#e2e8f0',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          transition: 'all 0.3s ease'
        }}
      >
        <FaGlobe className="me-1" />
        <span className="d-none d-md-inline">{currentLanguage.flag}</span>
        <span className="d-none d-lg-inline">{currentLanguage.name}</span>
        <FaLanguage className="ms-1" />
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="language-dropdown"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          minWidth: '150px'
        }}
      >
        {languages.map((language) => (
          <Dropdown.Item
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`language-option ${
              i18n.language === language.code ? 'active' : ''
            }`}
            style={{
              color: i18n.language === language.code ? '#8B5CF6' : '#e2e8f0',
              background: i18n.language === language.code 
                ? 'rgba(139, 92, 246, 0.1)' 
                : 'transparent',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              margin: '0.25rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (i18n.language !== language.code) {
                e.target.style.background = 'rgba(139, 92, 246, 0.05)';
                e.target.style.color = '#8B5CF6';
              }
            }}
            onMouseLeave={(e) => {
              if (i18n.language !== language.code) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#e2e8f0';
              }
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{language.flag}</span>
            <span style={{ fontWeight: i18n.language === language.code ? '600' : '400' }}>
              {language.name}
            </span>
            {i18n.language === language.code && (
              <span style={{ marginLeft: 'auto', color: '#8B5CF6' }}>✓</span>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;