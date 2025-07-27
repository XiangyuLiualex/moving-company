import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import homeIcon from '../assets/home_icon.png';
import twiterIcon from '../assets/twitter.png';
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import whatasppIcon from '../assets/whatsapp.png';
import { defaultSystemSettings, SystemSettings } from '../utils/systemUtils';

function Footer(){
  const { t } = useTranslation();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);

  // 从API加载系统设置
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/settings`);
        if (response.ok) {
          const settingsData = await response.json();
          console.log('Footer加载系统设置:', settingsData);
          setSystemSettings(settingsData);
        } else {
          console.error('Failed to fetch system settings in Footer');
        }
      } catch (error) {
        console.error('Error loading system settings in Footer:', error);
      }
    };

    loadSystemSettings();
  }, []);
  
  return (
    <footer>
      <div>
        <img src={homeIcon} alt="Moving company" />
        <p>
          {t('footer.description')}
        </p>
        <div className="icons">
          <img src={twiterIcon} alt="" className="icon" />
          <img src={facebookIcon} alt="" className="icon" />
          <img src={instagramIcon} alt="" className="icon" />
        </div>
      </div>
      <ul className="info-list">
        <li>About Us</li>
        <li>About</li>
        <li>Privacy & Policy</li>
        <li>Terms & Conditions</li>
        <li>FAQ</li>
      </ul>
      <ul className="info-list">
        <li>Navigate</li>
        <li>How We Work</li>
        <li>Services</li>
        <li>FAQ</li>
        <li>Contact</li>
        <li>Free Quote</li>
      </ul>
      <ul className="info-list">
        <li><a href="">{t('footer.contactUs')}</a></li>
        <li>{systemSettings.websiteInfo.address}</li>
        <li>{t('footer.call')}: {systemSettings.websiteInfo.phone}</li>
        <li>{t('footer.email')}: {systemSettings.websiteInfo.email}</li>
        <img src={whatasppIcon} alt="" id="whatsapp"/>
      </ul>
    </footer>
  );

}

export default Footer