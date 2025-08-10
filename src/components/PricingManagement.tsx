import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminPricingData, City } from '../utils/adminUtils';

interface PricingManagementProps {
  pricingData: AdminPricingData;
  onUpdateIntercityPrice: (fromCity: City, toCity: City, price: number) => void;
  onUpdateLocalServiceRate: (rate: number) => void;
  onUpdateLocalMovingPrice: (
    area: 'standard' | 'premium',
    service: 'withVehicle' | 'withoutVehicle',
    field: 'baseRate' | 'additionalPersonFee',
    value: number
  ) => void;
  onUpdateLocalMovingSettings: (field: 'minimumHours' | 'depositRequired' | 'depositRMB', value: number) => void;
  onUpdateStorageItemPrice: (itemKey: string, price: number) => void;
  onSave: () => void;
  onReset: () => void;
  hasChanges: boolean;
}

function PricingManagement({ 
  pricingData, 
  onUpdateIntercityPrice, 
  onUpdateLocalServiceRate, 
  onUpdateLocalMovingPrice,
  onUpdateLocalMovingSettings,
  onUpdateStorageItemPrice,
  onSave,
  onReset,
  hasChanges
}: PricingManagementProps) {
  const { t } = useTranslation();
  const cities: City[] = ['Vancouver', 'Calgary', 'Winnipeg'];
  
  // 折叠状态管理
  const [collapsedSections, setCollapsedSections] = useState({
    intercity: false,
    localMoving: false,
    storage: false
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
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
          <div className="section-header">
            <h3>{t('admin.pricing.intercity')}</h3>
            <button 
              className="collapse-btn"
              onClick={() => toggleSection('intercity')}
              title={collapsedSections.intercity ? '展开' : '收起'}
            >
              <span className={`collapse-icon ${collapsedSections.intercity ? 'collapsed' : ''}`}>
                ▼
              </span>
            </button>
          </div>
          <div className={`section-content ${collapsedSections.intercity ? 'collapsed' : ''}`}>
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
        </div>
        
        {/* 同城搬家价格 */}
        <div className="pricing-section">
          <div className="section-header">
            <h3>{t('admin.pricing.localMoving')}</h3>
            <button 
              className="collapse-btn"
              onClick={() => toggleSection('localMoving')}
              title={collapsedSections.localMoving ? '展开' : '收起'}
            >
              <span className={`collapse-icon ${collapsedSections.localMoving ? 'collapsed' : ''}`}>
                ▼
              </span>
            </button>
          </div>
          <div className={`section-content ${collapsedSections.localMoving ? 'collapsed' : ''}`}>
            <p>{t('admin.pricing.localMovingDesc')}</p>
            
            {/* 标准区域价格 */}
            <div className="sub-section">
              <h4>标准区域价格（大温哥华地区、卡尔加里、温尼伯）</h4>
              <div className="local-moving-prices">
                <div className="price-field">
                  <label>需要车（1人+车）:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingStandardArea.withVehicle.baseRate}
                    onChange={(e) => onUpdateLocalMovingPrice('standard', 'withVehicle', 'baseRate', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/hour</span>
                </div>
                <div className="price-field">
                  <label>额外人员费用:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingStandardArea.withVehicle.additionalPersonFee}
                    onChange={(e) => onUpdateLocalMovingPrice('standard', 'withVehicle', 'additionalPersonFee', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/person</span>
                </div>
                <div className="price-field">
                  <label>仅工人（不需要车）:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingStandardArea.withoutVehicle.baseRate}
                    onChange={(e) => onUpdateLocalMovingPrice('standard', 'withoutVehicle', 'baseRate', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/person/hour</span>
                </div>
              </div>
            </div>
            
            {/* 加价区域价格 */}
            <div className="sub-section">
              <h4>加价区域价格（北温、西温、白石、兰里、枫树岭）</h4>
              <div className="local-moving-prices">
                <div className="price-field">
                  <label>需要车（1人+车）:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingPremiumArea.withVehicle.baseRate}
                    onChange={(e) => onUpdateLocalMovingPrice('premium', 'withVehicle', 'baseRate', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/hour</span>
                </div>
                <div className="price-field">
                  <label>额外人员费用:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingPremiumArea.withVehicle.additionalPersonFee}
                    onChange={(e) => onUpdateLocalMovingPrice('premium', 'withVehicle', 'additionalPersonFee', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/person</span>
                </div>
                <div className="price-field">
                  <label>仅工人（不需要车）:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingPremiumArea.withoutVehicle.baseRate}
                    onChange={(e) => onUpdateLocalMovingPrice('premium', 'withoutVehicle', 'baseRate', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>$/person/hour</span>
                </div>
              </div>
            </div>
            
            {/* 同城搬家设置 */}
            <div className="sub-section">
              <h4>同城搬家设置</h4>
              <div className="local-moving-settings">
                <div className="setting-field">
                  <label>最少小时数:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingSettings.minimumHours}
                    onChange={(e) => onUpdateLocalMovingSettings('minimumHours', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>小时</span>
                </div>
                <div className="setting-field">
                  <label>押金要求:</label>
                  <input
                    type="number"
                    value={pricingData.localMovingSettings.depositRequired}
                    onChange={(e) => onUpdateLocalMovingSettings('depositRequired', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>%</span>
                </div>
                <div className="setting-field">
                  <label>押金金额 (RMB):</label>
                  <input
                    type="number"
                    value={pricingData.localMovingSettings.depositRMB}
                    onChange={(e) => onUpdateLocalMovingSettings('depositRMB', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>RMB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 存储家具价格 */}
        <div className="pricing-section">
          <div className="section-header">
            <h3>{t('admin.pricing.storage')}</h3>
            <button 
              className="collapse-btn"
              onClick={() => toggleSection('storage')}
              title={collapsedSections.storage ? '展开' : '收起'}
            >
              <span className={`collapse-icon ${collapsedSections.storage ? 'collapsed' : ''}`}>
                ▼
              </span>
            </button>
          </div>
          <div className={`section-content ${collapsedSections.storage ? 'collapsed' : ''}`}>
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
    </div>
  );
}

export default PricingManagement;
