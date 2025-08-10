import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { defaultSystemSettings, type SystemSettings, type AdditionalFeeItem } from '../utils/systemUtils';
import { loadPricingData, savePricingData, resetPricingData, loadCitiesData, saveCitiesData, loadSystemSettings, saveSystemSettings, resetSystemSettings } from '../utils/adminUtils';
import type { AdminPricingData, City } from '../utils/adminUtils';
import { logout } from '../utils/authUtils';
import type { SimpleCityData } from '../utils/cityUtils';
import PricingManagement from './PricingManagement';
import '../styles/AdminPage.scss';

// Toast提示组件
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✓' : '✕'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

type AdminSection = 'pricing' | 'cities' | 'settings';

function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('pricing');
  const [pricingData, setPricingData] = useState<AdminPricingData | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Toast状态
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricing, settings, citiesData] = await Promise.all([
          loadPricingData(),
          loadSystemSettings(),
          loadCitiesData()
        ]);
        setPricingData(pricing);
        setSystemSettings(settings);
        setCities(citiesData);
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
        showToast(t('admin.pricing.saveSuccess'), 'success');
      } else {
        showToast('保存失败，请重试', 'error');
      }
    } else if (activeSection === 'cities') {
      const success = await saveCitiesData(cities);
      if (success) {
        setHasChanges(false);
        showToast('城市设置保存成功', 'success');
      } else {
        showToast('保存失败，请重试', 'error');
      }
    } else if (activeSection === 'settings') {
      console.log('准备保存系统设置:', systemSettings);
      const success = await saveSystemSettings(systemSettings!);
      if (success) {
        setSystemSettings({ ...systemSettings! }); // 直接用当前state刷新UI
        setHasChanges(false);
        console.log('系统设置保存成功');
        showToast(t('admin.settings.saveSuccess'), 'success');
      } else {
        console.error('系统设置保存失败');
        showToast('保存失败，请重试', 'error');
      }
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
          showToast(t('admin.pricing.resetSuccess'), 'success');
        } catch (error) {
          console.error('Failed to reset pricing data:', error);
          showToast('重置失败，请重试', 'error');
        }
      }
    } else if (activeSection === 'cities') {
      if (window.confirm('确定要重置城市设置吗？')) {
        try {
          const citiesData = await loadCitiesData();
          setCities(citiesData);
          setHasChanges(false);
          showToast('城市设置已重置', 'success');
        } catch (error) {
          console.error('Failed to reset cities data:', error);
          showToast('重置失败，请重试', 'error');
        }
      }
    } else if (activeSection === 'settings') {
      if (window.confirm(t('admin.settings.resetConfirm'))) {
        try {
          const defaultData = await resetSystemSettings();
          setSystemSettings(defaultData);
          setHasChanges(false);
          showToast(t('admin.settings.resetSuccess'), 'success');
        } catch (error) {
          console.error('Failed to reset system settings:', error);
          showToast('重置失败，请重试', 'error');
        }
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
  const updateLocalMovingPrice = (
    area: 'standard' | 'premium',
    service: 'withVehicle' | 'withoutVehicle',
    field: 'baseRate' | 'additionalPersonFee',
    value: number
  ) => {
    setPricingData(prev => {
      if (!prev) return prev;
      const areaKey = area === 'standard' ? 'localMovingStandardArea' : 'localMovingPremiumArea';
      return {
        ...prev,
        [areaKey]: {
          ...prev[areaKey],
          [service]: {
            ...prev[areaKey][service],
            [field]: value
          }
        }
      };
    });
    setHasChanges(true);
  };

  // 更新同城搬家设置
  const updateLocalMovingSettings = (field: 'minimumHours' | 'depositRequired' | 'depositRMB', value: number) => {
    setPricingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        localMovingSettings: {
          ...prev.localMovingSettings,
          [field]: value
        }
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
    console.log('updateSystemSettings 被调用:', { field, value, valueType: typeof value });
    
    // 特别关注基础配置的更新
    if (field.startsWith('websiteInfo.')) {
      console.log('基础配置更新:', field, '=', value);
    }
    
    setSystemSettings(prev => {
      if (!prev) return prev;
      const newSettings = { ...prev };
      const keys = field.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      console.log('系统设置更新后:', newSettings);
      return newSettings;
    });
    setHasChanges(true);
  };

  // 城市管理切换开关时，设置hasChanges为true
  const handleUpdateCities = (updatedCities: any[]) => {
    setCities(updatedCities);
    setHasChanges(true);
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'pricing':
        return (
          <PricingManagement 
            pricingData={pricingData!}
            onUpdateIntercityPrice={updateIntercityPrice}
            onUpdateLocalServiceRate={updateIntercityLocalServiceRate}
            onUpdateLocalMovingPrice={updateLocalMovingPrice}
            onUpdateLocalMovingSettings={updateLocalMovingSettings}
            onUpdateStorageItemPrice={updateStorageItemPrice}
            onSave={handleSave}
            onReset={handleReset}
            hasChanges={hasChanges}
          />
        );
      case 'cities':
        return (
          <CitiesManagement 
            cities={cities}
            onUpdateCities={handleUpdateCities}
            onSave={handleSave}
            hasChanges={hasChanges}
          />
        );
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
          onUpdateLocalMovingSettings={updateLocalMovingSettings}
          onUpdateStorageItemPrice={updateStorageItemPrice}
          onSave={handleSave}
          onReset={handleReset}
          hasChanges={hasChanges}
        />;
    }
  };

  return (
    <div className="admin-page">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
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

interface SystemSettingsManagementProps {
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  hasChanges: boolean;
}

// 城市管理组件
interface CityData {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  isActive: boolean;
  services: {
    localMoving: boolean;
    intercityMoving: boolean;
    storage: boolean;
  };
  description: string;
}

interface CitiesManagementProps {
  cities: any[];
  onUpdateCities: (cities: any[]) => void;
  onSave: () => void;
  hasChanges: boolean;
}

function CitiesManagement({ cities, onUpdateCities, onSave, hasChanges }: CitiesManagementProps) {
  const { t } = useTranslation();

  const handleToggleCityStatus = (cityId: string) => {
    const updatedCities = cities.map(city => 
      city.id === cityId ? { ...city, isActive: !city.isActive } : city
    );
    onUpdateCities(updatedCities);
  };

  const handleToggleService = (cityId: string, serviceType: 'localMoving' | 'intercityMoving' | 'storage') => {
    const updatedCities = cities.map(city => 
      city.id === cityId ? { 
        ...city, 
        services: {
          ...city.services,
          [serviceType]: !city.services[serviceType]
        }
      } : city
    );
    onUpdateCities(updatedCities);
  };

  return (
    <div className="cities-management">
      <div className="cities-header">
        <h2>{t('admin.cities.title')}</h2>
        <div className="cities-actions">
          <button 
            className="save-btn" 
            onClick={onSave}
            disabled={!hasChanges}
          >
            {t('admin.cities.save')}
          </button>
        </div>
      </div>

      {/* 城市列表 */}
      <div className="cities-list">
        <div className="cities-table">
          <div className="table-header">
            <div className="header-cell">{t('admin.cities.cityName')}</div>
            <div className="header-cell">{t('admin.cities.status')}</div>
            <div className="header-cell">{t('admin.cities.localMoving')}</div>
            <div className="header-cell">{t('admin.cities.intercityMoving')}</div>
            <div className="header-cell">{t('admin.cities.storage')}</div>
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
                <div className="table-cell">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={city.services?.localMoving}
                      onChange={() => handleToggleService(city.id, 'localMoving')}
                      disabled={!city.isActive}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="table-cell">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={city.services?.intercityMoving}
                      onChange={() => handleToggleService(city.id, 'intercityMoving')}
                      disabled={!city.isActive}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="table-cell">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={city.services?.storage}
                      onChange={() => handleToggleService(city.id, 'storage')}
                      disabled={!city.isActive}
                    />
                    <span className="slider"></span>
                  </label>
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

          {/* 额外费用（动态列表） */}
          <div className="sub-section">
            <h4>{t('admin.settings.taxAndFees.additionalFees')}</h4>
            {(!systemSettings.taxAndFees.dynamicFees || Object.keys(systemSettings.taxAndFees.dynamicFees).length === 0) && (
              <div className="form-grid" style={{ marginBottom: 12 }}>
                <div className="form-field">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => {
                      const now = Date.now();
                      const createId = (key: string) => `fee_${key}_${now}`;
                      const dynamicFees: Record<string, AdditionalFeeItem> = {};
                      if (systemSettings.taxAndFees.fuelSurchargeEnabled) {
                        const id = createId('fuel');
                        dynamicFees[id] = {
                          id,
                          nameZh: '燃油附加费',
                          nameEn: 'Fuel Surcharge',
                          mode: 'percentage',
                          amount: systemSettings.taxAndFees.fuelSurcharge || 0,
                          enabled: true,
                          scope: 'all',
                          order: now + 1,
                        };
                      }
                      if (systemSettings.taxAndFees.insuranceEnabled) {
                        const id = createId('insurance');
                        dynamicFees[id] = {
                          id,
                          nameZh: '保险费',
                          nameEn: 'Insurance',
                          mode: 'percentage',
                          amount: systemSettings.taxAndFees.insuranceRate || 0,
                          enabled: true,
                          scope: 'all',
                          order: now + 2,
                        };
                      }
                      if (systemSettings.taxAndFees.packagingEnabled) {
                        const id = createId('packaging');
                        dynamicFees[id] = {
                          id,
                          nameZh: '包装费',
                          nameEn: 'Packaging',
                          mode: 'fixed',
                          amount: systemSettings.taxAndFees.packagingFee || 0,
                          enabled: true,
                          scope: 'all',
                          order: now + 3,
                        };
                      }
                      onUpdateSystemSettings('taxAndFees.dynamicFees', dynamicFees);
                    }}
                  >
                    从默认值导入
                  </Button>
                </div>
              </div>
            )}

            <div className="form-grid">
              {Object.values((systemSettings.taxAndFees.dynamicFees || {}) as Record<string, AdditionalFeeItem>)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((fee) => (
                  <div key={fee.id} className="form-field" style={{ gridColumn: '1 / -1' }}>
                    <div className="form-grid" style={{ alignItems: 'end' }}>
                      <div className="form-field">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!fee.enabled}
                            onChange={(e) => onUpdateSystemSettings(`taxAndFees.dynamicFees.${fee.id}.enabled`, e.target.checked)}
                          />
                          启用
                        </label>
                      </div>
                      <div className="form-field">
                        <label>中文名称:</label>
                        <input
                          type="text"
                          value={fee.nameZh || ''}
                          onChange={(e) => onUpdateSystemSettings(`taxAndFees.dynamicFees.${fee.id}.nameZh`, e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label>英文名称:</label>
                        <input
                          type="text"
                          value={fee.nameEn || ''}
                          onChange={(e) => onUpdateSystemSettings(`taxAndFees.dynamicFees.${fee.id}.nameEn`, e.target.value)}
                        />
                      </div>
                      <div className="form-field">
                        <label>计费方式:</label>
                        <select
                          value={fee.mode}
                          onChange={(e) => onUpdateSystemSettings(`taxAndFees.dynamicFees.${fee.id}.mode`, e.target.value)}
                        >
                          <option value="percentage">百分比</option>
                          <option value="fixed">固定金额</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>数值{fee.mode === 'percentage' ? ' (%)' : ' ($)'}:</label>
                        <input
                          type="number"
                          min={fee.mode === 'percentage' ? 0 : 0}
                          max={fee.mode === 'percentage' ? 100 : undefined}
                          step={fee.mode === 'percentage' ? 0.1 : 0.01}
                          value={fee.amount}
                          onChange={(e) => onUpdateSystemSettings(
                            `taxAndFees.dynamicFees.${fee.id}.amount`,
                            fee.mode === 'percentage' ? (parseFloat(e.target.value) || 0) : (parseFloat(e.target.value) || 0)
                          )}
                        />
                      </div>
                      <div className="form-field">
                        <label>适用范围:</label>
                        <select
                          value={fee.scope || 'all'}
                          onChange={(e) => onUpdateSystemSettings(`taxAndFees.dynamicFees.${fee.id}.scope`, e.target.value)}
                        >
                          <option value="all">全部</option>
                          <option value="local">同城搬家</option>
                          <option value="intercity">跨省搬家</option>
                          <option value="storage">存储</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => {
                            const map = { ...(systemSettings.taxAndFees.dynamicFees || {}) } as Record<string, AdditionalFeeItem>;
                            delete map[fee.id];
                            onUpdateSystemSettings('taxAndFees.dynamicFees', map);
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* 新增费用按钮移动到底部，符合整体布局 */}
              <div className="form-field" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => {
                    const id = `fee_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
                    const newItem: AdditionalFeeItem = {
                      id,
                      nameZh: '',
                      nameEn: '',
                      mode: 'percentage',
                      amount: 0,
                      enabled: true,
                      scope: 'all',
                      order: Date.now(),
                    };
                    const existing = systemSettings.taxAndFees.dynamicFees || {};
                    const next = { ...existing, [id]: newItem } as Record<string, AdditionalFeeItem>;
                    onUpdateSystemSettings('taxAndFees.dynamicFees', next);
                  }}
                >
                  新增费用项
                </Button>
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