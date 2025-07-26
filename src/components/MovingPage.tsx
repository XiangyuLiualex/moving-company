import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Item from './Item';
import { Inventory2 } from '@mui/icons-material';
import { AdminPricingData } from '../utils/adminUtils';
import { getActiveCities } from '../utils/cityUtils';
import { getSystemSettings, calculateTax, calculateAdditionalFees } from '../utils/systemUtils';
import '../styles/main.scss';

// 导入图片
import bedsIcon from '../assets/bed.png';
import fridgeIcon from '../assets/fridge.png';
import furnitureIcon from '../assets/furniture.png';
import ovenIcon from '../assets/oven.png';
import sofaIcon from '../assets/sofa.png';
import tvIcon from '../assets/tv.png';
import washerIcon from '../assets/washer.png';
import diningIcon from '../assets/dining.png';
import deskIcon from '../assets/desk.png';
import wardrobeIcon from '../assets/wardrobe.png';

type City = 'Vancouver' | 'Calgary' | 'Winnipeg';
type PricingTable = {
  [key in City]: {
    [key in City]?: number;
  };
};

function MovingPage(){
  const { t } = useTranslation();
  const [totalItems, setTotalItems] = useState(0);
  const [totalm2, setTotalm2] = useState(0);
  const [reset, setReset] = useState(false);
  
  // 新增：出发地和到达地状态
  const [departureLocation, setDepartureLocation] = useState({
    city: '',
    postalCode: ''
  });
  const [arriveLocation, setArriveLocation] = useState({
    city: '',
    postalCode: ''
  });

  // 新增：本地服务选择
  const [localServices, setLocalServices] = useState({
    pickup: false,
    delivery: false,
    pickupHours: 2,
    deliveryHours: 2
  });

  // 城市选项
  const cities: City[] = getActiveCities() as City[];
  const systemSettings = getSystemSettings();

  // 从API加载价格数据
  const [pricingData, setPricingData] = useState<AdminPricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载价格数据
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/pricing`);
        if (response.ok) {
          const data = await response.json();
          setPricingData(data);
        } else {
          console.error('Failed to fetch pricing data');
        }
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingData();
  }, []);

  // 跨省搬家价格表（从管理员设置加载）
  const intercityPricing: PricingTable = pricingData?.intercityPricing || {
    'Vancouver': {
      'Calgary': 500,
      'Winnipeg': 650
    },
    'Calgary': {
      'Vancouver': 500,
      'Winnipeg': 500
    },
    'Winnipeg': {
      'Vancouver': 650,
      'Calgary': 500
    }
  };

  // 本地服务费率（从管理员设置加载）
  const localServiceRate = pricingData?.intercityLocalServiceRate || 120; // $120/小时，标配2人



  // 城市选择验证函数
  const handleDepartureCityChange = (selectedCity: string) => {
    setDepartureLocation(prev => ({...prev, city: selectedCity}));
    
    // 如果选择的出发城市与到达城市相同，清空到达城市
    if (selectedCity === arriveLocation.city) {
      setArriveLocation(prev => ({...prev, city: ''}));
    }
  };

  const handleArriveCityChange = (selectedCity: string) => {
    setArriveLocation(prev => ({...prev, city: selectedCity}));
    
    // 如果选择的到达城市与出发城市相同，清空出发城市
    if (selectedCity === departureLocation.city) {
      setDepartureLocation(prev => ({...prev, city: ''}));
    }
  };

  // 检查城市是否可选
  const isCitySelectable = (city: string, isDeparture: boolean) => {
    if (isDeparture) {
      // 出发城市：如果到达城市已选择且相同，则不可选
      return arriveLocation.city === '' || arriveLocation.city !== city;
    } else {
      // 到达城市：如果出发城市已选择且相同，则不可选
      return departureLocation.city === '' || departureLocation.city !== city;
    }
  };

  function resetItems(): void {
    setReset(true);
    setTotalItems(0);
    setTotalm2(0);
    // 重置位置信息
    setDepartureLocation({ city: '', postalCode: '' });
    setArriveLocation({ city: '', postalCode: '' });
    // 重置本地服务选择
    setLocalServices({
      pickup: false,
      delivery: false,
      pickupHours: 2,
      deliveryHours: 2
    });
    setTimeout(() => {
      setReset(false);
    }, 0);
  }
  
  function addItem(quantity: number, meterMultiplier: number): void {
    setTotalItems(prevNumber => prevNumber + quantity);
    setTotalm2(prevNumber => prevNumber + meterMultiplier)
  }

  function roundDecimals(num: number){
    return Math.round(num * 100) / 100;
  }

  // 计算跨省运输费用
  function calculateIntercityFee(): number {
    if (departureLocation.city && arriveLocation.city && departureLocation.city !== arriveLocation.city) {
      const departureCity = departureLocation.city as City;
      const arriveCity = arriveLocation.city as City;
      const pricePerPallet = intercityPricing[departureCity]?.[arriveCity];
      if (pricePerPallet) {
        const totalPallets = Math.ceil(totalm2 / 2); // 1板 = 2立方米
        return totalPallets * pricePerPallet;
      }
    }
    return 0;
  }

  // 计算本地服务费用
  function calculateLocalServiceFee(): number {
    let totalFee = 0;
    
    if (localServices.pickup) {
      totalFee += localServices.pickupHours * localServiceRate;
    }
    
    if (localServices.delivery) {
      totalFee += localServices.deliveryHours * localServiceRate;
    }
    
    return totalFee;
  }

  const intercityFee = calculateIntercityFee();
  const localServiceFee = calculateLocalServiceFee();
  const subtotal = intercityFee + localServiceFee;
  const tax = calculateTax(subtotal, systemSettings);
  const additionalFees = calculateAdditionalFees(subtotal, systemSettings);
  const total = subtotal + tax + additionalFees.total;

  // 获取每板价格显示
  const getPricePerPallet = () => {
    if (departureLocation.city && arriveLocation.city && departureLocation.city !== arriveLocation.city) {
      const departureCity = departureLocation.city as City;
      const arriveCity = arriveLocation.city as City;
      return intercityPricing[departureCity]?.[arriveCity] || 0;
    }
    return 0;
  };

  // 计算总板数
  const totalPallets = Math.ceil(totalm2 / 2);

  if (isLoading) {
    return (
      <main>
        <div className="loading">
          <p>加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="title">
        <h1>{t('moving.title')}</h1>
        <p>{t('moving.subtitle')}</p>
      </div>
      
      {/* 新增：位置选择区域 */}
      <div className="location-section">
        <div className="location-box">
          <h3>{t('moving.departureLocation')}</h3>
          <div className="location-inputs">
            <select 
              value={departureLocation.city}
              onChange={(e) => handleDepartureCityChange(e.target.value)}
            >
              <option value="">{t('moving.selectCity')}</option>
              {cities.map(city => (
                <option 
                  key={city} 
                  value={city}
                  disabled={!isCitySelectable(city, true)}
                  style={{
                    color: isCitySelectable(city, true) ? 'inherit' : '#ccc',
                    fontStyle: isCitySelectable(city, true) ? 'normal' : 'italic'
                  }}
                >
                  {city} {!isCitySelectable(city, true) && '(Already Selected)'}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t('moving.postalCode')}
              value={departureLocation.postalCode}
              onChange={(e) => setDepartureLocation(prev => ({...prev, postalCode: e.target.value}))}
            />
          </div>
        </div>
        
        <div className="location-box">
          <h3>{t('moving.arriveLocation')}</h3>
          <div className="location-inputs">
            <select 
              value={arriveLocation.city}
              onChange={(e) => handleArriveCityChange(e.target.value)}
            >
              <option value="">{t('moving.selectCity')}</option>
              {cities.map(city => (
                <option 
                  key={city} 
                  value={city}
                  disabled={!isCitySelectable(city, false)}
                  style={{
                    color: isCitySelectable(city, false) ? 'inherit' : '#ccc',
                    fontStyle: isCitySelectable(city, false) ? 'normal' : 'italic'
                  }}
                >
                  {city} {!isCitySelectable(city, false) && '(Already Selected)'}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t('moving.postalCode')}
              value={arriveLocation.postalCode}
              onChange={(e) => setArriveLocation(prev => ({...prev, postalCode: e.target.value}))}
            />
          </div>
        </div>
      </div>

      {/* 新增：本地服务选择区域 */}
      {departureLocation.city && arriveLocation.city && departureLocation.city !== arriveLocation.city && (
        <div className="local-services-section">
          <h3>{t('moving.localServices')}</h3>
          <p className="service-description">
            {t('moving.serviceDescription').replace('${rate}', `$${localServiceRate}`)}
          </p>
          
          <div className="service-options">
            <div className="service-option">
              <label>
                <input
                  type="checkbox"
                  checked={localServices.pickup}
                  onChange={(e) => setLocalServices(prev => ({...prev, pickup: e.target.checked}))}
                />
                {t('moving.pickupService')}
              </label>
              {localServices.pickup && (
                <div className="hours-input">
                  <label>{t('moving.hours')}:</label>
                  <input
                    type="number"
                    min="2"
                    value={localServices.pickupHours}
                    onChange={(e) => setLocalServices(prev => ({...prev, pickupHours: Math.max(2, parseInt(e.target.value) || 2)}))}
                  />
                </div>
              )}
            </div>
            
            <div className="service-option">
              <label>
                <input
                  type="checkbox"
                  checked={localServices.delivery}
                  onChange={(e) => setLocalServices(prev => ({...prev, delivery: e.target.checked}))}
                />
                {t('moving.deliveryService')}
              </label>
              {localServices.delivery && (
                <div className="hours-input">
                  <label>{t('moving.hours')}:</label>
                  <input
                    type="number"
                    min="2"
                    value={localServices.deliveryHours}
                    onChange={(e) => setLocalServices(prev => ({...prev, deliveryHours: Math.max(2, parseInt(e.target.value) || 2)}))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="items">
        <Item
          name={t('moving.items.beds')}
          image={bedsIcon}
          multiplier={1.2}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.fridge')}
          image={fridgeIcon}
          multiplier={1}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.furniture')}
          image={furnitureIcon}
          multiplier={0.5}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.oven')}
          image={ovenIcon}
          multiplier={0.6}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.sofa')}
          image={sofaIcon}
          multiplier={1.5}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.tv')}
          image={tvIcon}
          multiplier={0.25}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.washerDryer')}
          image={washerIcon}
          multiplier={0.5}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.dining')}
          image={diningIcon}
          multiplier={2}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.desk')}
          image={deskIcon}
          multiplier={0.75}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.wardrobe')}
          image={wardrobeIcon}
          multiplier={3.2}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.smallBox')}
          image={<Inventory2 style={{ fontSize: 50, color: '#8B7355' }} />}
          multiplier={0.04}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.mediumBox')}
          image={<Inventory2 style={{ fontSize: 50, color: '#6B8E23' }} />}
          multiplier={0.074}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.largeBox')}
          image={<Inventory2 style={{ fontSize: 50, color: '#556B2F' }} />}
          multiplier={0.101}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.extraLargeBox')}
          image={<Inventory2 style={{ fontSize: 50, color: '#4A4A4A' }} />}
          multiplier={0.135}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name={t('moving.items.superLargeBox')}
          image={<Inventory2 style={{ fontSize: 50, color: '#2F4F4F' }} />}
          multiplier={0.24}
          reset={reset}
          addItem={addItem}
        />
      </div>
      <div className="buttons">
        <button id="clear" onClick={resetItems}>
          {t('moving.buttons.clear')}
        </button>
        <button id="calculate">{t('moving.buttons.calculate')}</button>
      </div>
      <div className="summary">
        <h1>{t('moving.summary.title')}</h1>
        
        {/* 新增：收费标准说明 */}
        <div className="pricing-info">
          <h3>{t('moving.pricingInfo.title')}</h3>
          <ul>
            <li><strong>{t('moving.pricingInfo.intercityMoving')}</strong></li>
            <li><strong>{t('moving.pricingInfo.localServices').replace('${rate}', `$${localServiceRate}`)}</strong></li>
            <li><strong>{t('moving.pricingInfo.palletizingFee')}</strong></li>
          </ul>
        </div>
        
        <table>
          <tbody>
            <tr>
              <td>{t('moving.summary.totalItems')}</td>
              <td>{totalItems}</td>
            </tr>
            <tr>
              <td>{t('moving.summary.totalM2')}</td>
              <td>{roundDecimals(totalm2)}</td>
            </tr>
            <tr>
              <td>{t('moving.summary.totalPallets')}</td>
              <td>{totalPallets} (1 pallet = 2 m²)</td>
            </tr>
            {departureLocation.city && arriveLocation.city && departureLocation.city !== arriveLocation.city && (
              <>
                <tr>
                  <td>{t('moving.summary.pricePerPallet')}</td>
                  <td>${getPricePerPallet()}</td>
                </tr>
                <tr>
                  <td>{t('moving.summary.intercityFee')}</td>
                  <td>${intercityFee}</td>
                </tr>
              </>
            )}
            {localServiceFee > 0 && (
              <tr>
                <td>{t('moving.summary.localServiceFee')}</td>
                <td>${localServiceFee}</td>
              </tr>
            )}
            <tr>
              <td>{t('moving.summary.subtotal')}</td>
              <td>{`$${roundDecimals(subtotal)}`}</td>
            </tr>
            <tr>
              <td>{t('moving.summary.tax')}</td>
              <td>{`$${roundDecimals(tax)}`}</td>
            </tr>
            {systemSettings.taxAndFees.fuelSurchargeEnabled && additionalFees.fuelSurcharge > 0 && (
              <tr>
                <td>{t('moving.summary.fuelSurcharge')}</td>
                <td>{`$${roundDecimals(additionalFees.fuelSurcharge)}`}</td>
              </tr>
            )}
            {systemSettings.taxAndFees.insuranceEnabled && additionalFees.insurance > 0 && (
              <tr>
                <td>{t('moving.summary.insurance')}</td>
                <td>{`$${roundDecimals(additionalFees.insurance)}`}</td>
              </tr>
            )}
            {systemSettings.taxAndFees.packagingEnabled && additionalFees.packaging > 0 && (
              <tr>
                <td>{t('moving.summary.packaging')}</td>
                <td>{`$${roundDecimals(additionalFees.packaging)}`}</td>
              </tr>
            )}
            <tr>
              <td>{t('moving.summary.total')}</td>
              <td>{`$${roundDecimals(total)}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );

}

export default MovingPage 