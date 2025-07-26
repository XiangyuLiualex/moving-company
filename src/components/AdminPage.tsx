import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPricingData, loadPricingData, savePricingData, resetPricingData, City } from '../utils/adminUtils';
import { getCitiesData, saveCitiesData, updateCityStatus } from '../utils/cityUtils';
import { getSystemSettings, saveSystemSettings, defaultSystemSettings } from '../utils/systemUtils';
import { logout } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import type { SystemSettings } from '../utils/systemUtils';
import type { SimpleCityData } from '../utils/cityUtils';
import '../styles/AdminPage.scss';

type AdminSection = 'pricing' | 'cities' | 'settings';

function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('pricing');
  const [pricingData, setPricingData] = useState<AdminPricingData | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricing, settings] = await Promise.all([
          loadPricingData(),
          Promise.resolve(getSystemSettings())
        ]);
        setPricingData(pricing);
        setSystemSettings(settings);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 保存数据
  const handleSave = async () => {
    if (activeSection === 'pricing') {
      const success = await savePricingData(pricingData!);
      if (success) {
        setHasChanges(false);
        alert(t('admin.pricing.saveSuccess'));
      } else {
        alert('保存失败，请重试');
      }
    } else if (activeSection === 'settings') {
      saveSystemSettings(systemSettings!);
      setSystemSettings({ ...systemSettings! }); // 直接用当前state刷新UI
      setHasChanges(false);
      alert(t('admin.settings.saveSuccess'));
    }
  };

  // 重置数据
  const handleReset = async () => {
    if (activeSection === 'pricing') {
      if (window.confirm(t('admin.pricing.resetConfirm'))) {
        try {
          const defaultData = await resetPricingData();
          setPricingData(defaultData);
          setHasChanges(false);
          alert(t('admin.pricing.resetSuccess'));
        } catch (error) {
          console.error('Failed to reset pricing data:', error);
          alert('重置失败，请重试');
        }
      }
    } else if (activeSection === 'settings') {
      if (window.confirm(t('admin.settings.resetConfirm'))) {
        setSystemSettings(defaultSystemSettings);
        saveSystemSettings(defaultSystemSettings);
        setHasChanges(false);
        alert(t('admin.settings.resetSuccess'));
      }
    }
  };

  // 更新跨省搬家价格
  const updateIntercityPrice = (fromCity: City, toCity: City, price: number) => {
    setPricingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        intercityPricing: {
          ...prev.intercityPricing,
          [fromCity]: {
            ...prev.intercityPricing[fromCity],
            [toCity]: price
          }
        }
      };
    });
    setHasChanges(true);
  };

  // 更新跨省搬家本地服务费率
  const updateIntercityLocalServiceRate = (rate: number) => {
    setPricingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        intercityLocalServiceRate: rate
      };
    });
    setHasChanges(true);
  };

  // 更新同城搬家价格
  const updateLocalMovingPrice = (field: 'hourlyRate' | 'additionalPersonFee' | 'deposit', value: number) => {
    setPricingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [`localMoving${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
      };
    });
    setHasChanges(true);
  };

  // 更新存储物品价格
  const updateStorageItemPrice = (itemKey: string, price: number) => {
    setPricingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        storageItems: {
          ...prev.storageItems,
          [itemKey]: {
            ...prev.storageItems[itemKey],
            price
          }
        }
      };
    });
    setHasChanges(true);
  };

  // 更新系统设置
  const updateSystemSettings = (field: string, value: any) => {
    setSystemSettings(prev => {
      if (!prev) return prev;
      const newSettings = { ...prev };
      const keys = field.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newSettings;
    });
    setHasChanges(true);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'pricing':
        return (
          <PricingManagement 
            pricingData={pricingData!}
            onUpdateIntercityPrice={updateIntercityPrice}
            onUpdateLocalServiceRate={updateIntercityLocalServiceRate}
            onUpdateLocalMovingPrice={updateLocalMovingPrice}
            onUpdateStorageItemPrice={updateStorageItemPrice}
            onSave={handleSave}
            onReset={handleReset}
            hasChanges={hasChanges}
          />
        );
      case 'cities':
        return <CitiesManagement />;
      case 'settings':
        return (
          <SystemSettingsManagement 
            systemSettings={systemSettings!}
            onUpdateSystemSettings={updateSystemSettings}
            onSave={handleSave}
            onReset={handleReset}
            hasChanges={hasChanges}
          />
        );
      default:
        return <PricingManagement 
          pricingData={pricingData!}
          onUpdateIntercityPrice={updateIntercityPrice}
          onUpdateLocalServiceRate={updateIntercityLocalServiceRate}
          onUpdateLocalMovingPrice={updateLocalMovingPrice}
          onUpdateStorageItemPrice={updateStorageItemPrice}
          onSave={handleSave}
          onReset={handleReset}
          hasChanges={hasChanges}
        />;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{t('admin.title')}</h1>
            <p>{t('admin.subtitle')}</p>
          </div>
          <div className="header-right">
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="admin-container">
        <div className="admin-sidebar">
          <nav>
            <button 
              className={activeSection === 'pricing' ? 'active' : ''}
              onClick={() => setActiveSection('pricing')}
            >
              {t('admin.nav.pricing')}
            </button>
            <button 
              className={activeSection === 'cities' ? 'active' : ''}
              onClick={() => setActiveSection('cities')}
            >
              {t('admin.nav.cities')}
            </button>
            <button 
              className={activeSection === 'settings' ? 'active' : ''}
              onClick={() => setActiveSection('settings')}
            >
              {t('admin.nav.settings')}
            </button>
          </nav>
        </div>
        
        <div className="admin-content">
          {isLoading ? (
            <div className="loading">
              <p>加载中...</p>
            </div>
          ) : (
            renderSection()
          )}
        </div>
      </div>
    </div>
  );
}

// 价格管理组件
interface PricingManagementProps {
  pricingData: AdminPricingData;
  onUpdateIntercityPrice: (fromCity: City, toCity: City, price: number) => void;
  onUpdateLocalServiceRate: (rate: number) => void;
  onUpdateLocalMovingPrice: (field: 'hourlyRate' | 'additionalPersonFee' | 'deposit', value: number) => void;
  onUpdateStorageItemPrice: (itemKey: string, price: number) => void;
  onSave: () => void;
  onReset: () => void;
  hasChanges: boolean;
}

interface SystemSettingsManagementProps {
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  hasChanges: boolean;
}

function PricingManagement({ 
  pricingData, 
  onUpdateIntercityPrice, 
  onUpdateLocalServiceRate, 
  onUpdateLocalMovingPrice,
  onUpdateStorageItemPrice,
  onSave,
  onReset,
  hasChanges
}: PricingManagementProps) {
  const { t } = useTranslation();
  const cities: City[] = ['Vancouver', 'Calgary', 'Winnipeg'];
  
  return (
    <div className="pricing-management">
      <div className="pricing-header">
        <h2>{t('admin.pricing.title')}</h2>
        <div className="pricing-actions">
          <button 
            className="save-btn" 
            onClick={onSave}
            disabled={!hasChanges}
          >
            {t('admin.pricing.save')}
          </button>
          <button 
            className="reset-btn" 
            onClick={onReset}
          >
            {t('admin.pricing.reset')}
          </button>
        </div>
      </div>

      <div className="pricing-sections">
        {/* 跨省搬家价格表 */}
        <div className="pricing-section">
          <h3>{t('admin.pricing.intercity')}</h3>
          <p>{t('admin.pricing.intercityDesc')}</p>
          <div className="pricing-table">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.pricing.from')}</th>
                  <th>{t('admin.pricing.to')}</th>
                  <th>{t('admin.pricing.price')} ($)</th>
                </tr>
              </thead>
              <tbody>
                {cities.map(fromCity => 
                  cities.map(toCity => 
                    fromCity !== toCity && (
                      <tr key={`${fromCity}-${toCity}`}>
                        <td>{fromCity}</td>
                        <td>{toCity}</td>
                        <td>
                          <input
                            type="number"
                            value={pricingData.intercityPricing[fromCity][toCity] || 0}
                            onChange={(e) => onUpdateIntercityPrice(
                              fromCity, 
                              toCity, 
                              parseInt(e.target.value) || 0
                            )}
                            min="0"
                          />
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
          
          {/* 本地服务价格 - 作为跨省搬家的子内容 */}
          <div className="sub-section">
            <h4>{t('admin.pricing.localServices')}</h4>
            <p>{t('admin.pricing.localServicesDesc')}</p>
            <div className="local-service-rate">
              <label>{t('admin.pricing.hourlyRate')}:</label>
              <input
                type="number"
                value={pricingData.intercityLocalServiceRate}
                onChange={(e) => onUpdateLocalServiceRate(parseInt(e.target.value) || 0)}
                min="0"
              />
              <span>$/hour</span>
            </div>
          </div>
        </div>
        
        {/* 同城搬家价格 */}
        <div className="pricing-section">
          <h3>{t('admin.pricing.localMoving')}</h3>
          <p>{t('admin.pricing.localMovingDesc')}</p>
          <div className="local-moving-prices">
            <div className="price-field">
              <label>{t('admin.pricing.hourlyRate')}:</label>
              <input
                type="number"
                value={pricingData.localMovingHourlyRate}
                onChange={(e) => onUpdateLocalMovingPrice('hourlyRate', parseInt(e.target.value) || 0)}
                min="0"
              />
              <span>$/person/hour</span>
            </div>
            <div className="price-field">
              <label>{t('admin.pricing.additionalPersonFee')}:</label>
              <input
                type="number"
                value={pricingData.localMovingAdditionalPersonFee}
                onChange={(e) => onUpdateLocalMovingPrice('additionalPersonFee', parseInt(e.target.value) || 0)}
                min="0"
              />
              <span>$/person</span>
            </div>
            <div className="price-field">
              <label>{t('admin.pricing.deposit')}:</label>
              <input
                type="number"
                value={pricingData.localMovingDeposit}
                onChange={(e) => onUpdateLocalMovingPrice('deposit', parseInt(e.target.value) || 0)}
                min="0"
              />
              <span>$ CAD</span>
            </div>
          </div>
        </div>
        
        {/* 存储家具价格 */}
        <div className="pricing-section">
          <h3>{t('admin.pricing.storage')}</h3>
          <p>{t('admin.pricing.storageDesc')}</p>
          <div className="storage-items">
            {Object.entries(pricingData.storageItems).map(([key, item]) => (
              <div key={key} className="storage-item">
                <div className="item-info">
                  <span className="item-name">{t(`admin.storageItems.${key}`)}</span>
                  <span className="item-description">{item.description}</span>
                </div>
                <div className="item-price">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => onUpdateStorageItemPrice(key, parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/month</span>
                </div>
              </div>
            ))}
            
            {/* 确保取货服务始终存在 */}
            {(() => {
              const pickupServices = [
                'onlyBoxPickupNoStairs',
                'onlyBoxPickupWithStairs', 
                'furniturePickupNoStairs',
                'furniturePickupAssembly'
              ];
              
              return pickupServices.map(serviceKey => {
                const item = pricingData.storageItems[serviceKey];
                if (!item) {
                  // 如果API数据中没有，使用默认数据
                  const defaultPickupServices = {
                    onlyBoxPickupNoStairs: {
                      name: "Only Box Pickup Service (Every 10 pieces) - No Stairs",
                      price: 40,
                      description: "One-time fee for box pickup service without stairs"
                    },
                    onlyBoxPickupWithStairs: {
                      name: "Only Box Pickup Service (Every 10 pieces) - With Stairs",
                      price: 80,
                      description: "One-time fee for box pickup service with stairs"
                    },
                    furniturePickupNoStairs: {
                      name: "Furniture Pickup Service - No Stairs",
                      price: 160,
                      description: "One-time fee for furniture pickup service without stairs"
                    },
                    furniturePickupAssembly: {
                      name: "Furniture Pickup Service - With Assembly",
                      price: 260,
                      description: "One-time fee for furniture pickup service with disassembly/assembly"
                    }
                  };
                  
                  const defaultItem = defaultPickupServices[serviceKey as keyof typeof defaultPickupServices];
                  
                  return (
                    <div key={serviceKey} className="storage-item">
                      <div className="item-info">
                        <span className="item-name">{t(`admin.storageItems.${serviceKey}`)}</span>
                        <span className="item-description">{defaultItem.description}</span>
                      </div>
                      <div className="item-price">
                        <input
                          type="number"
                          value={defaultItem.price}
                          onChange={(e) => onUpdateStorageItemPrice(serviceKey, parseInt(e.target.value) || 0)}
                          min="0"
                        />
                        <span>$/month</span>
                      </div>
                    </div>
                  );
                }
                
                // 如果数据库中已经存在，不重复渲染
                return null;
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// 城市管理组件
interface CityData {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  isActive: boolean;
  description: string;
}



function CitiesManagement() {
  const { t } = useTranslation();
  const [cities, setCities] = useState<SimpleCityData[]>([]);

  // 加载城市数据
  useEffect(() => {
    const citiesData = getCitiesData();
    setCities(citiesData);
  }, []);

  const handleToggleCityStatus = (cityId: string) => {
    const updatedCities = cities.map(city => 
      city.id === cityId ? { ...city, isActive: !city.isActive } : city
    );
    setCities(updatedCities);
    saveCitiesData(updatedCities);
    updateCityStatus(cityId, !cities.find(city => city.id === cityId)?.isActive || false);
  };

  return (
    <div className="cities-management">
      <div className="cities-header">
        <h2>{t('admin.cities.title')}</h2>
        <p>{t('admin.cities.description')}</p>
      </div>

      {/* 城市列表 */}
      <div className="cities-list">
        <div className="cities-table">
          <div className="table-header">
            <div className="header-cell">{t('admin.cities.cityName')}</div>
            <div className="header-cell">{t('admin.cities.status')}</div>
          </div>
          <div className="table-body">
            {cities.map(city => (
              <div key={city.id} className={`table-row ${!city.isActive ? 'inactive' : ''}`}>
                <div className="table-cell">{city.name}</div>
                <div className="table-cell">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={city.isActive}
                      onChange={() => handleToggleCityStatus(city.id)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="status-text">
                    {city.isActive ? t('admin.cities.active') : t('admin.cities.inactive')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 系统设置管理组件
function SystemSettingsManagement({ 
  systemSettings, 
  onUpdateSystemSettings, 
  onSave, 
  onReset, 
  hasChanges 
}: SystemSettingsManagementProps) {
  const { t } = useTranslation();

  return (
    <div className="system-settings-management">
      <div className="settings-header">
        <h2>{t('admin.settings.title')}</h2>
        <p>{t('admin.settings.description')}</p>
      </div>

      <div className="settings-content">
        {/* 基础配置 */}
        <div className="settings-section">
          <h3>{t('admin.settings.basicConfig.title')}</h3>
          
          {/* 网站信息 */}
          <div className="sub-section">
            <h4>{t('admin.settings.basicConfig.websiteInfo')}</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>{t('admin.settings.basicConfig.titleZh')}:</label>
                <input
                  type="text"
                  value={systemSettings.websiteInfo.titleZh}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.titleZh', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>{t('admin.settings.basicConfig.titleEn')}:</label>
                <input
                  type="text"
                  value={systemSettings.websiteInfo.titleEn}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.titleEn', e.target.value)}
                />
              </div>
              <div className="form-field full-width">
                <label>{t('admin.settings.basicConfig.descriptionZh')}:</label>
                <textarea
                  value={systemSettings.websiteInfo.descriptionZh}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.descriptionZh', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-field full-width">
                <label>{t('admin.settings.basicConfig.descriptionEn')}:</label>
                <textarea
                  value={systemSettings.websiteInfo.descriptionEn}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.descriptionEn', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 联系信息 */}
          <div className="sub-section">
            <h4>{t('admin.settings.basicConfig.contactInfo')}</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>{t('admin.settings.basicConfig.companyName')}:</label>
                <input
                  type="text"
                  value={systemSettings.websiteInfo.companyName}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.companyName', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>{t('admin.settings.basicConfig.phone')}:</label>
                <input
                  type="text"
                  value={systemSettings.websiteInfo.phone}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.phone', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>{t('admin.settings.basicConfig.email')}:</label>
                <input
                  type="email"
                  value={systemSettings.websiteInfo.email}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.email', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>{t('admin.settings.basicConfig.address')}:</label>
                <input
                  type="text"
                  value={systemSettings.websiteInfo.address}
                  onChange={(e) => onUpdateSystemSettings('websiteInfo.address', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 税率和费用 */}
        <div className="settings-section">
          <h3>{t('admin.settings.taxAndFees.title')}</h3>
          
          {/* 税率设置 */}
          <div className="sub-section">
            <h4>{t('admin.settings.taxAndFees.taxRates')}</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.taxAndFees.gstEnabled}
                    onChange={(e) => onUpdateSystemSettings('taxAndFees.gstEnabled', e.target.checked)}
                  />
                  {t('admin.settings.taxAndFees.gstEnabled')}
                </label>
                <input
                  type="number"
                  value={systemSettings.taxAndFees.gstRate}
                  onChange={(e) => onUpdateSystemSettings('taxAndFees.gstRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={!systemSettings.taxAndFees.gstEnabled}
                />
                <span>%</span>
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.taxAndFees.pstEnabled}
                    onChange={(e) => onUpdateSystemSettings('taxAndFees.pstEnabled', e.target.checked)}
                  />
                  {t('admin.settings.taxAndFees.pstEnabled')}
                </label>
                <input
                  type="number"
                  value={systemSettings.taxAndFees.pstRate}
                  onChange={(e) => onUpdateSystemSettings('taxAndFees.pstRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={!systemSettings.taxAndFees.pstEnabled}
                />
                <span>%</span>
              </div>
            </div>
          </div>

          {/* 额外费用 */}
          <div className="sub-section">
            <h4>{t('admin.settings.taxAndFees.additionalFees')}</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.taxAndFees.fuelSurchargeEnabled}
                    onChange={(e) => onUpdateSystemSettings('taxAndFees.fuelSurchargeEnabled', e.target.checked)}
                  />
                  {t('admin.settings.taxAndFees.fuelSurcharge')}
                </label>
                <input
                  type="number"
                  value={systemSettings.taxAndFees.fuelSurcharge}
                  onChange={(e) => onUpdateSystemSettings('taxAndFees.fuelSurcharge', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={!systemSettings.taxAndFees.fuelSurchargeEnabled}
                />
                <span>%</span>
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.taxAndFees.insuranceEnabled}
                    onChange={(e) => onUpdateSystemSettings('taxAndFees.insuranceEnabled', e.target.checked)}
                  />
                  {t('admin.settings.taxAndFees.insuranceRate')}
                </label>
                <input
                  type="number"
                  value={systemSettings.taxAndFees.insuranceRate}
                  onChange={(e) => onUpdateSystemSettings('taxAndFees.insuranceRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={!systemSettings.taxAndFees.insuranceEnabled}
                />
                <span>%</span>
              </div>
              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.taxAndFees.packagingEnabled}
                    onChange={(e) => onUpdateSystemSettings('taxAndFees.packagingEnabled', e.target.checked)}
                  />
                  {t('admin.settings.taxAndFees.packagingFee')}
                </label>
                <input
                  type="number"
                  value={systemSettings.taxAndFees.packagingFee}
                  onChange={(e) => onUpdateSystemSettings('taxAndFees.packagingFee', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  disabled={!systemSettings.taxAndFees.packagingEnabled}
                />
                <span>$</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="settings-actions">
        <button 
          className="save-btn"
          onClick={onSave}
          disabled={!hasChanges}
        >
          {t('admin.settings.save')}
        </button>
        <button 
          className="reset-btn"
          onClick={onReset}
        >
          {t('admin.settings.reset')}
        </button>
      </div>
    </div>
  );
}

export default AdminPage; 