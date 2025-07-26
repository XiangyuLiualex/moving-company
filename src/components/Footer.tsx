import React from 'react';
import { useTranslation } from 'react-i18next';
import homeIcon from '../assets/home_icon.png';
import twiterIcon from '../assets/twitter.png';
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import whatasppIcon from '../assets/whatsapp.png';
import { getSystemSettings } from '../utils/systemUtils';

function Footer(){
  const { t } = useTranslation();
  const systemSettings = getSystemSettings();
  
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