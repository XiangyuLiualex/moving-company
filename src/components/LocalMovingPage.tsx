import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getActiveCitiesByService, SimpleCityData } from '../utils/cityUtils';
import { AdminPricingData } from '../utils/adminUtils';
import { SystemSettings, defaultSystemSettings, calculateTax, calculateAdditionalFees } from '../utils/systemUtils';
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
          getActiveCitiesByService('localMoving'),
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
  }, []); // 移除 selectedService 依赖项

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

  const subtotal = calculatePrice();
  const tax = calculateTax(subtotal, systemSettings);
  const additionalFees = calculateAdditionalFees(subtotal, systemSettings);
  const totalPrice = subtotal + tax + additionalFees.total;
  const needsDeposit = personCount >= pricing.settings.depositRequired;

  // 四舍五入到两位小数
  function roundDecimals(num: number) {
    return Math.round(num * 100) / 100;
  }

  return (
    <main className="local-moving-page">
      <div className="title">
        <h1>{t('localMoving.title')}</h1>
        <p>{t('localMoving.subtitle')}</p>
      </div>
      
      <div className="content-section">
        {/* 服务城市部分 */}
        <div className="cities-section">
          <h2>{t('localMoving.serviceCities')}</h2>
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

        <div className="rules-section">
          <h2>{t('localMoving.serviceRules')}</h2>
          
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
                  <li>${roundDecimals(pricing.settings.depositRMB / 5)} CAD</li>
                  <li>¥{roundDecimals(pricing.settings.depositRMB)} RMB</li>
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
        </div>

        {/* 价格计算器 */}
        <div className="calculator-section">
          <h2>{t('localMoving.calculator.title')}</h2>
          
          <div className="calculator-form">
            {/* 区域选择 */}
            <div className="form-group">
              <label>{t('localMoving.calculator.area')}:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="standard"
                    checked={selectedArea === 'standard'}
                    onChange={(e) => setSelectedArea(e.target.value as 'standard' | 'premium')}
                  />
                  {t('localMoving.calculator.standardArea')}
                </label>
                <label>
                  <input
                    type="radio"
                    value="premium"
                    checked={selectedArea === 'premium'}
                    onChange={(e) => setSelectedArea(e.target.value as 'standard' | 'premium')}
                  />
                  {t('localMoving.calculator.premiumArea')}
                </label>
              </div>
            </div>

            {/* 服务类型选择 */}
            <div className="form-group">
              <label>{t('localMoving.calculator.serviceType')}:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="withVehicle"
                    checked={selectedService === 'withVehicle'}
                    onChange={(e) => setSelectedService(e.target.value as 'withVehicle' | 'withoutVehicle')}
                  />
                  {t('localMoving.calculator.withVehicle')}
                </label>
                <label>
                  <input
                    type="radio"
                    value="withoutVehicle"
                    checked={selectedService === 'withoutVehicle'}
                    onChange={(e) => setSelectedService(e.target.value as 'withVehicle' | 'withoutVehicle')}
                  />
                  {t('localMoving.calculator.withoutVehicle')}
                </label>
              </div>
            </div>

            {/* 人员数量 */}
            <div className="form-group">
              <label>{t('localMoving.calculator.personCount')}:</label>
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
              <label>{t('localMoving.calculator.hours')}:</label>
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
              <h3>{t('localMoving.calculator.estimatedPrice')}</h3>
              <div className="price-breakdown">
                {selectedService === 'withVehicle' ? (
                  <>
                    <div className="price-item">
                      <span>{t('localMoving.calculator.basePrice')}（{hours}小时 × ${currentPricing.withVehicle.baseRate}/小时）:</span>
                      <span>${roundDecimals(currentPricing.withVehicle.baseRate * hours)}</span>
                    </div>
                    {personCount > 1 && (
                      <div className="price-item">
                        <span>{t('localMoving.calculator.additionalPersonFee')}（{personCount - 1}人 × ${currentPricing.withVehicle.additionalPersonFee}/人/小时 × {hours}小时）:</span>
                        <span>${roundDecimals((personCount - 1) * currentPricing.withVehicle.additionalPersonFee * hours)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="price-item">
                    <span>{t('localMoving.calculator.workerFee')}（{personCount}人 × ${currentPricing.withoutVehicle.baseRate}/人/小时 × {hours}小时）:</span>
                    <span>${roundDecimals(currentPricing.withoutVehicle.baseRate * personCount * hours)}</span>
                  </div>
                )}
                <div className="price-item">
                  <span>{t('localMoving.calculator.subtotal')}:</span>
                  <span>${roundDecimals(subtotal)}</span>
                </div>
                <div className="price-item">
                  <span>{t('localMoving.calculator.tax')}:</span>
                  <span>${roundDecimals(tax)}</span>
                </div>
                {systemSettings.taxAndFees.fuelSurchargeEnabled && (
                  <div className="price-item">
                    <span>{t('localMoving.calculator.fuelSurcharge')} ({systemSettings.taxAndFees.fuelSurcharge}%):</span>
                    <span>${roundDecimals(additionalFees.fuelSurcharge)}</span>
                  </div>
                )}
                {systemSettings.taxAndFees.insuranceEnabled && (
                  <div className="price-item">
                    <span>{t('localMoving.calculator.insurance')} ({systemSettings.taxAndFees.insuranceRate}%):</span>
                    <span>${roundDecimals(additionalFees.insurance)}</span>
                  </div>
                )}
                {systemSettings.taxAndFees.packagingEnabled && (
                  <div className="price-item">
                    <span>{t('localMoving.calculator.packaging')}:</span>
                    <span>${roundDecimals(additionalFees.packaging)}</span>
                  </div>
                )}
                <div className="price-total">
                  <strong>{t('localMoving.calculator.total')}: ${roundDecimals(totalPrice)}</strong>
                </div>
                {needsDeposit && (
                  <div className="deposit-notice">
                    <p>⚠️ {personCount}{t('localMoving.calculator.depositNotice')}：${roundDecimals(pricing.settings.depositRMB / 5)}加币 或 ¥{roundDecimals(pricing.settings.depositRMB)}人民币</p>
                  </div>
                )}
              </div>
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
    </main>
  );
}

export default LocalMovingPage; 