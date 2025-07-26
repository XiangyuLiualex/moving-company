import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getActiveCitiesDisplayNames } from '../utils/cityUtils';
import { AdminPricingData } from '../utils/adminUtils';
import { getSystemSettings } from '../utils/systemUtils';
import '../styles/local-moving.scss';

function LocalMovingPage() {
  const { t } = useTranslation();
  const [pricingData, setPricingData] = useState<AdminPricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const systemSettings = getSystemSettings();
  
  // 城市数据 - 改为异步获取
  const [activeCities, setActiveCities] = useState<{ [key: string]: string }>({});

  // 加载价格数据和城市数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricingResponse, citiesData] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/pricing`),
          getActiveCitiesDisplayNames()
        ]);
        
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          setPricingData(pricingData);
        } else {
          console.error('Failed to fetch pricing data');
        }
        
        setActiveCities(citiesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <main className="local-moving-page">
        <div className="loading">
          <p>加载中...</p>
        </div>
      </main>
    );
  }

  // 获取价格数据，如果没有则使用默认值
  const hourlyRate = pricingData?.localMovingHourlyRate || 45;
  const additionalPersonFee = pricingData?.localMovingAdditionalPersonFee || 40;
  const deposit = pricingData?.localMovingDeposit || 60;

  return (
    <main className="local-moving-page">
      <div className="title">
        <h1>{t('localMoving.title')}</h1>
        <p>{t('localMoving.subtitle')}</p>
      </div>
      
      <div className="content-section">
        <div className="rules-section">
          <h2>{t('localMoving.serviceRules')}</h2>
          
          <div className="cities-section">
            <h3>{t('localMoving.serviceCities')}</h3>
            <div className="cities-container">
              {(() => {
                const cityIcons = {
                  'Vancouver': '🏙️',
                  'Calgary': '🏔️',
                  'Winnipeg': '🏞️'
                };
                const cityDescriptions = {
                  'Vancouver': 'Greater Vancouver Area',
                  'Calgary': 'Calgary Metropolitan Area',
                  'Winnipeg': 'Winnipeg Metropolitan Area'
                };
                
                return Object.entries(activeCities).map(([cityName, displayName]) => (
                  <div key={cityName} className="city-item">
                    <div className="city-icon">{cityIcons[cityName as keyof typeof cityIcons] || '🏙️'}</div>
                    <div className="city-content">
                      <h4>{displayName}</h4>
                      <p>{cityDescriptions[cityName as keyof typeof cityDescriptions] || 'Metropolitan Area'}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          
          <div className="rules-container">
            <div className="rule-item">
              <div className="rule-icon">⏰</div>
              <div className="rule-content">
                <h3>{t('localMoving.hourlyRate')}</h3>
                <p><strong>${hourlyRate} {t('localMoving.perPersonPerHour').replace('${rate}', `$${hourlyRate}`)}</strong></p>
                <p>{t('localMoving.minimumHours')}</p>
              </div>
            </div>
            
            <div className="rule-item">
              <div className="rule-icon">👥</div>
              <div className="rule-content">
                <h3>{t('localMoving.additionalPersonnel')}</h3>
                <p><strong>${additionalPersonFee} {t('localMoving.extraPerPerson').replace('${rate}', `$${additionalPersonFee}`)}</strong></p>
                <p>{t('localMoving.forTwoOrMore')}</p>
              </div>
            </div>
            
            <div className="rule-item">
              <div className="rule-icon">💰</div>
              <div className="rule-content">
                <h3>{t('localMoving.depositRequired')}</h3>
                <p><strong>{t('localMoving.threePlusPeople')}</strong></p>
                <ul>
                  <li>${deposit} CAD</li>
                  <li>¥{deposit * 5} RMB</li>
                </ul>
              </div>
            </div>
            
            <div className="rule-item">
              <div className="rule-icon">📋</div>
              <div className="rule-content">
                <h3>{t('localMoving.serviceIncludes')}</h3>
                <ul>
                  <li>{t('localMoving.professionalTeam')}</li>
                  <li>{t('localMoving.furnitureProtection')}</li>
                  <li>{t('localMoving.loadingUnloading')}</li>
                  <li>{t('localMoving.basicAssembly')}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="contact-section">
            <h3>{t('localMoving.readyToBook')}</h3>
            <p>{t('localMoving.contactUs')}</p>
            <button 
              className="contact-button"
              onClick={() => setShowContactInfo(!showContactInfo)}
            >
              {t('localMoving.contactButton')}
            </button>
            
            {showContactInfo && (
              <div className="contact-info-modal">
                <div className="contact-info-content">
                  <h4>{t('localMoving.contactInfo')}</h4>
                  <div className="contact-details">
                    <div className="contact-item">
                      <strong>{t('localMoving.companyName')}:</strong>
                      <span>{systemSettings.websiteInfo.companyName}</span>
                    </div>
                    <div className="contact-item">
                      <strong>{t('localMoving.phone')}:</strong>
                      <span>{systemSettings.websiteInfo.phone}</span>
                    </div>
                    <div className="contact-item">
                      <strong>{t('localMoving.email')}:</strong>
                      <span>{systemSettings.websiteInfo.email}</span>
                    </div>
                    <div className="contact-item">
                      <strong>{t('localMoving.address')}:</strong>
                      <span>{systemSettings.websiteInfo.address}</span>
                    </div>
                  </div>
                  <button 
                    className="close-button"
                    onClick={() => setShowContactInfo(false)}
                  >
                    {t('localMoving.close')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default LocalMovingPage; 