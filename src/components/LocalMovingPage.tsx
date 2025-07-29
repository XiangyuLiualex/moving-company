import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getActiveCities, SimpleCityData } from '../utils/cityUtils';
import { AdminPricingData } from '../utils/adminUtils';
import { SystemSettings, defaultSystemSettings } from '../utils/systemUtils';
import '../styles/local-moving.scss';

function LocalMovingPage() {
  const { t, i18n } = useTranslation();
  const [pricingData, setPricingData] = useState<AdminPricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  
  // 城市数据 - 改为异步获取
  const [activeCities, setActiveCities] = useState<SimpleCityData[]>([]);

  // 用户选择状态
  const [selectedArea, setSelectedArea] = useState<'standard' | 'premium'>('standard');
  const [selectedService, setSelectedService] = useState<'withVehicle' | 'withoutVehicle'>('withVehicle');
  const [personCount, setPersonCount] = useState(1);
  const [hours, setHours] = useState(2);

  // 加载价格数据和城市数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricingResponse, citiesData, settingsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/pricing`),
          getActiveCities(),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/settings`)
        ]);
        
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          setPricingData(pricingData);
        } else {
          console.error('Failed to fetch pricing data');
        }
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSystemSettings(settingsData);
        } else {
          console.error('Failed to fetch system settings');
        }
        
        setActiveCities(citiesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 初始加载
    loadData();

    // 每30秒自动刷新数据
    const interval = setInterval(loadData, 30000);

    // 清理定时器
    return () => clearInterval(interval);
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
  const getPricingData = () => {
    if (!pricingData) {
      return {
        standardArea: {
          withVehicle: { baseRate: 80, additionalPersonFee: 40 },
          withoutVehicle: { baseRate: 45 }
        },
        premiumArea: {
          withVehicle: { baseRate: 90, additionalPersonFee: 40 },
          withoutVehicle: { baseRate: 55 }
        },
        settings: { minimumHours: 2, depositRequired: 3, depositRMB: 300 }
      };
    }

    return {
      standardArea: pricingData.localMovingStandardArea,
      premiumArea: pricingData.localMovingPremiumArea,
      settings: pricingData.localMovingSettings
    };
  };

  const pricing = getPricingData();
  const currentPricing = selectedArea === 'standard' ? pricing.standardArea : pricing.premiumArea;

  // 计算价格
  const calculatePrice = () => {
    if (selectedService === 'withVehicle') {
      const basePrice = currentPricing.withVehicle.baseRate * hours;
      const additionalPeople = Math.max(0, personCount - 1);
      const additionalFee = additionalPeople * currentPricing.withVehicle.additionalPersonFee * hours;
      return basePrice + additionalFee;
    } else {
      return currentPricing.withoutVehicle.baseRate * personCount * hours;
    }
  };

  const totalPrice = calculatePrice();
  const needsDeposit = personCount >= pricing.settings.depositRequired;

  return (
    <main className="local-moving-page">
      <div className="title">
        <h1>{t('localMoving.title')}</h1>
        <p>{t('localMoving.subtitle')}</p>
      </div>
      
      <div className="content-section">
        {/* 价格计算器 */}
        <div className="calculator-section">
          <h2>价格计算器</h2>
          
          <div className="calculator-form">
            {/* 区域选择 */}
            <div className="form-group">
              <label>服务区域:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="standard"
                    checked={selectedArea === 'standard'}
                    onChange={(e) => setSelectedArea(e.target.value as 'standard' | 'premium')}
                  />
                  标准区域（大温哥华地区、卡尔加里、温尼伯）
                </label>
                <label>
                  <input
                    type="radio"
                    value="premium"
                    checked={selectedArea === 'premium'}
                    onChange={(e) => setSelectedArea(e.target.value as 'standard' | 'premium')}
                  />
                  加价区域（北温、西温、白石、兰里、枫树岭）
                </label>
              </div>
            </div>

            {/* 服务类型选择 */}
            <div className="form-group">
              <label>服务类型:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="withVehicle"
                    checked={selectedService === 'withVehicle'}
                    onChange={(e) => setSelectedService(e.target.value as 'withVehicle' | 'withoutVehicle')}
                  />
                  需要搬家公司的车（1人+车）
                </label>
                <label>
                  <input
                    type="radio"
                    value="withoutVehicle"
                    checked={selectedService === 'withoutVehicle'}
                    onChange={(e) => setSelectedService(e.target.value as 'withVehicle' | 'withoutVehicle')}
                  />
                  仅需要工人（不需要车）
                </label>
              </div>
            </div>

            {/* 人员数量 */}
            <div className="form-group">
              <label>人员数量:</label>
              <select
                value={personCount}
                onChange={(e) => setPersonCount(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}人</option>
                ))}
              </select>
            </div>

            {/* 小时数 */}
            <div className="form-group">
              <label>服务小时数:</label>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
              >
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}小时</option>
                ))}
              </select>
            </div>

            {/* 价格显示 */}
            <div className="price-display">
              <h3>预估价格</h3>
              <div className="price-breakdown">
                {selectedService === 'withVehicle' ? (
                  <>
                    <div className="price-item">
                      <span>基础价格（{hours}小时 × ${currentPricing.withVehicle.baseRate}/小时）:</span>
                      <span>${currentPricing.withVehicle.baseRate * hours}</span>
                    </div>
                    {personCount > 1 && (
                      <div className="price-item">
                        <span>额外人员费用（{personCount - 1}人 × ${currentPricing.withVehicle.additionalPersonFee}/人/小时 × {hours}小时）:</span>
                        <span>${(personCount - 1) * currentPricing.withVehicle.additionalPersonFee * hours}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="price-item">
                    <span>工人费用（{personCount}人 × ${currentPricing.withoutVehicle.baseRate}/人/小时 × {hours}小时）:</span>
                    <span>${currentPricing.withoutVehicle.baseRate * personCount * hours}</span>
                  </div>
                )}
                <div className="price-total">
                  <strong>总计: ${totalPrice}</strong>
                </div>
                {needsDeposit && (
                  <div className="deposit-notice">
                    <p>⚠️ {personCount}人及以上需要预付定金：${pricing.settings.depositRMB / 5}加币 或 ¥{pricing.settings.depositRMB}人民币</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                const cityChineseNames = {
                  'Vancouver': '温哥华',
                  'Calgary': '卡尔加里',
                  'Winnipeg': '温尼伯'
                };
                const cityChineseDescriptions = {
                  'Vancouver': '大温哥华地区',
                  'Calgary': '卡尔加里都会区',
                  'Winnipeg': '温尼伯都会区'
                };
                
                // 获取当前语言
                const currentLanguage = i18n.language;
                
                return activeCities.map((city) => (
                  <div key={city.name} className="city-item">
                    <div className="city-icon">{cityIcons[city.name as keyof typeof cityIcons] || '🏙️'}</div>
                    <div className="city-content">
                      <h4>
                        {currentLanguage === 'zh' 
                          ? cityChineseNames[city.name as keyof typeof cityChineseNames] 
                          : city.displayName
                        }
                      </h4>
                      <p>
                        {currentLanguage === 'zh'
                          ? (cityChineseDescriptions[city.name as keyof typeof cityChineseDescriptions] || '都会区')
                          : (cityDescriptions[city.name as keyof typeof cityDescriptions] || 'Metropolitan Area')
                        }
                      </p>
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
                <h3>最少服务时间</h3>
                <p><strong>{pricing.settings.minimumHours}小时起</strong></p>
                <p>所有服务最少需要{pricing.settings.minimumHours}小时</p>
              </div>
            </div>
            
            <div className="rule-item">
              <div className="rule-icon">💰</div>
              <div className="rule-content">
                <h3>定金要求</h3>
                <p><strong>{pricing.settings.depositRequired}人及以上需要预付定金</strong></p>
                <ul>
                  <li>${pricing.settings.depositRMB / 5} CAD</li>
                  <li>¥{pricing.settings.depositRMB} RMB</li>
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
                      <span>{systemSettings.contactInfo.phone}</span>
                    </div>
                    <div className="contact-item">
                      <strong>{t('localMoving.email')}:</strong>
                      <span>{systemSettings.contactInfo.email}</span>
                    </div>
                    <div className="contact-item">
                      <strong>{t('localMoving.address')}:</strong>
                      <span>{systemSettings.contactInfo.address}</span>
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