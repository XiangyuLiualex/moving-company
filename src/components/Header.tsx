import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import homeIcon from '../assets/home_icon.png';
import LanguageSwitcher from './LanguageSwitcher';

function Header(){
  const location = useLocation();
  const { t } = useTranslation();
  
  // 判断搬家服务是否激活（包括所有搬家相关页面）
  const isMovingActive = location.pathname === '/' || 
                        location.pathname === '/moving' || 
                        location.pathname === '/local-moving' || 
                        location.pathname === '/intercity-moving';
  
  return(
    <header>
      <Link to="/">
      <img src={homeIcon} alt="Moving Company" />
      </Link>
      <div className="header-content">
      <ul>
          <li>
            <Link 
              to="/moving" 
              className={isMovingActive ? 'active' : ''}
            >
              {t('header.movingService')}
            </Link>
          </li>
          <li>
            <Link 
              to="/storage" 
              className={location.pathname === '/storage' ? 'active' : ''}
            >
              {t('header.storageFurniture')}
            </Link>
          </li>
      </ul>
        <LanguageSwitcher />
      </div>
    </header>
  )
}

export default Header