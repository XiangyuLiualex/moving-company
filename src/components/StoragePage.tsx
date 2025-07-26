import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Item from './Item';
import { 
  Flight, 
  Luggage, 
  DirectionsBike, 
  Tv, 
  Chair, 
  Bed, 
  Inventory2, 
  Storage, 
  LocalShipping 
} from '@mui/icons-material';
import { AdminPricingData } from '../utils/adminUtils';
import { getActiveCities } from '../utils/cityUtils';
import { getSystemSettings, calculateTax, calculateAdditionalFees } from '../utils/systemUtils';
import '../styles/storage.scss';

interface ItemType {
  name: string;
  price: number;
  icon: React.ReactElement;
  description?: string;
}

function StoragePage(){
  const { t } = useTranslation();
  const [storageMonths, setStorageMonths] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [itemQuantities, setItemQuantities] = useState<{[key: string]: number}>({});
  const [reset, setReset] = useState(false);

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

  // 从管理员设置加载物品类型和价格
  const getItemTypes = (): { [key: string]: ItemType } => {
    if (!pricingData?.storageItems) {
      // 默认价格数据
      return {
        carryOnLuggage: {
          name: "Carry-on Luggage (≤115cm)",
          price: 15,
          icon: <Flight style={{ fontSize: 50, color: '#1976d2' }} />,
          description: "Sum of three sides not exceeding 115cm (including wheels)"
        },
        checkedLuggage: {
          name: "Checked Luggage (≤165cm)",
          price: 25,
          icon: <Luggage style={{ fontSize: 50, color: '#388e3c' }} />,
          description: "Sum of three sides not exceeding 165cm (including wheels)"
        },
        bicycle: {
          name: "Bicycle",
          price: 35,
          icon: <DirectionsBike style={{ fontSize: 50, color: '#f57c00' }} />,
          description: "Battery not included, battery must be stored separately"
        },
        tv: {
          name: "TV",
          price: 40,
          icon: <Tv style={{ fontSize: 50, color: '#7b1fa2' }} />,
          description: "Without box (if with box, calculated as per box)"
        },
        gamingChair: {
          name: "Gaming Chair",
          price: 35,
          icon: <Chair style={{ fontSize: 50, color: '#d32f2f' }} />,
          description: "Separate chair without detached footrest"
        },
        twinBed: {
          name: "Twin Mattress (Bed Frame x2)",
          price: 45,
          icon: <Bed style={{ fontSize: 50, color: '#6a4c93' }} />,
          description: "Twin mattress storage, bed frame price x2 if needed"
        },
        fullBed: {
          name: "Full Mattress (Bed Frame x2)",
          price: 50,
          icon: <Bed style={{ fontSize: 50, color: '#8e6c88' }} />,
          description: "Full mattress storage, bed frame price x2 if needed"
        },
        queenBed: {
          name: "Queen Mattress (Bed Frame x2)",
          price: 70,
          icon: <Bed style={{ fontSize: 50, color: '#a67c52' }} />,
          description: "Queen mattress storage, bed frame price x2 if needed"
        },
        kingBed: {
          name: "King Mattress (Bed Frame x2)",
          price: 70,
          icon: <Bed style={{ fontSize: 50, color: '#bf6f00' }} />,
          description: "King mattress storage, bed frame price x2 if needed"
        },
        smallBox: {
          name: "Home Depot\nSmall Box\n(≤110cm)",
          price: 15,
          icon: <Inventory2 style={{ fontSize: 50, color: '#8B7355' }} />,
          description: "Sum of three sides not exceeding 110cm"
        },
        mediumBox: {
          name: "Home Depot\nMedium Box\n(≤135cm)",
          price: 18,
          icon: <Inventory2 style={{ fontSize: 50, color: '#6B8E23' }} />,
          description: "Sum of three sides not exceeding 135cm"
        },
        largeBox: {
          name: "Home Depot\nLarge Box\n(≤150cm)",
          price: 22,
          icon: <Inventory2 style={{ fontSize: 50, color: '#556B2F' }} />,
          description: "Sum of three sides not exceeding 150cm"
        },
        extraLargeBox: {
          name: "Home Depot\nExtra Large Box\n(≤165cm)",
          price: 25,
          icon: <Inventory2 style={{ fontSize: 50, color: '#4A4A4A' }} />,
          description: "Sum of three sides not exceeding 165cm"
        },
        superLargeBox: {
          name: "Home Depot\nSuper Large Box\n(≤200cm)",
          price: 35,
          icon: <Inventory2 style={{ fontSize: 50, color: '#2F4F4F' }} />,
          description: "Sum of three sides not exceeding 200cm"
        },
        volumeStorage: {
          name: "Volume Storage Per m³",
          price: 45,
          icon: <Storage style={{ fontSize: 50, color: '#795548' }} />,
          description: "For items that cannot be categorized, calculated by volume"
        },
        onlyBoxPickupNoStairs: {
          name: "Only Box Pickup Service (Every 10 pieces) - No Stairs",
          price: 40,
          icon: <LocalShipping style={{ fontSize: 50, color: '#607d8b' }} />,
          description: "One-time fee for box pickup service without stairs"
        },
        onlyBoxPickupWithStairs: {
          name: "Only Box Pickup Service (Every 10 pieces) - With Stairs",
          price: 80,
          icon: <LocalShipping style={{ fontSize: 50, color: '#9e9e9e' }} />,
          description: "One-time fee for box pickup service with stairs"
        },
        furniturePickupNoStairs: {
          name: "Furniture Pickup Service - No Stairs",
          price: 160,
          icon: <LocalShipping style={{ fontSize: 50, color: '#795548' }} />,
          description: "One-time fee for furniture pickup service without stairs"
        },
        furniturePickupAssembly: {
          name: "Furniture Pickup Service - With Assembly",
          price: 260,
          icon: <LocalShipping style={{ fontSize: 50, color: '#d32f2f' }} />,
          description: "One-time fee for furniture pickup service with disassembly/assembly"
        }
      };
    }

    // 从管理员设置构建物品类型
    const itemTypes: { [key: string]: ItemType } = {};
    Object.entries(pricingData.storageItems).forEach(([key, item]: [string, any]) => {
      // 根据icon名称创建对应的MUI图标
      let icon: React.ReactElement;
      switch (item.icon) {
        case 'Flight':
          icon = <Flight style={{ fontSize: 50, color: '#1976d2' }} />;
          break;
        case 'Luggage':
          icon = <Luggage style={{ fontSize: 50, color: '#388e3c' }} />;
          break;
        case 'DirectionsBike':
          icon = <DirectionsBike style={{ fontSize: 50, color: '#f57c00' }} />;
          break;
        case 'Tv':
          icon = <Tv style={{ fontSize: 50, color: '#7b1fa2' }} />;
          break;
        case 'Chair':
          icon = <Chair style={{ fontSize: 50, color: '#d32f2f' }} />;
          break;
        case 'Bed':
          icon = <Bed style={{ fontSize: 50, color: '#6a4c93' }} />;
          break;
        case 'Inventory2':
          // 为不同的Home Depot纸箱分配不同颜色
          let boxColor = '#8B7355'; // 默认颜色
          if (key === 'smallBox') boxColor = '#8B7355'; // 棕色
          else if (key === 'mediumBox') boxColor = '#6B8E23'; // 橄榄绿
          else if (key === 'largeBox') boxColor = '#556B2F'; // 深橄榄绿
          else if (key === 'extraLargeBox') boxColor = '#4A4A4A'; // 深灰色
          else if (key === 'superLargeBox') boxColor = '#2F4F4F'; // 深青灰色
          icon = <Inventory2 style={{ fontSize: 50, color: boxColor }} />;
          break;
        case 'Storage':
          icon = <Storage style={{ fontSize: 50, color: '#795548' }} />;
          break;
        case 'LocalShipping':
          // 为不同的取货服务分配不同颜色
          let shippingColor = '#607d8b'; // 默认颜色
          if (key === 'onlyBoxPickupNoStairs') shippingColor = '#607d8b'; // 蓝灰色
          else if (key === 'onlyBoxPickupWithStairs') shippingColor = '#9e9e9e'; // 灰色
          else if (key === 'furniturePickupNoStairs') shippingColor = '#795548'; // 棕色
          else if (key === 'furniturePickupAssembly') shippingColor = '#d32f2f'; // 红色
          icon = <LocalShipping style={{ fontSize: 50, color: shippingColor }} />;
          break;
        default:
          icon = <Inventory2 style={{ fontSize: 50, color: '#8B7355' }} />;
      }

      itemTypes[key] = {
        name: item.name,
        price: item.price,
        icon,
        description: item.description
      };
    });

    // 确保取货服务始终存在，如果API数据中没有则使用默认值
    const pickupServices = [
      'onlyBoxPickupNoStairs',
      'onlyBoxPickupWithStairs', 
      'furniturePickupNoStairs',
      'furniturePickupAssembly'
    ];

    pickupServices.forEach(serviceKey => {
      if (!itemTypes[serviceKey]) {
        // 使用默认的取货服务数据
        const defaultPickupServices = {
          onlyBoxPickupNoStairs: {
            name: "Only Box Pickup Service (Every 10 pieces) - No Stairs",
            price: 40,
            icon: <LocalShipping style={{ fontSize: 50, color: '#607d8b' }} />,
            description: "One-time fee for box pickup service without stairs"
          },
          onlyBoxPickupWithStairs: {
            name: "Only Box Pickup Service (Every 10 pieces) - With Stairs",
            price: 80,
            icon: <LocalShipping style={{ fontSize: 50, color: '#9e9e9e' }} />,
            description: "One-time fee for box pickup service with stairs"
          },
          furniturePickupNoStairs: {
            name: "Furniture Pickup Service - No Stairs",
            price: 160,
            icon: <LocalShipping style={{ fontSize: 50, color: '#795548' }} />,
            description: "One-time fee for furniture pickup service without stairs"
          },
          furniturePickupAssembly: {
            name: "Furniture Pickup Service - With Assembly",
            price: 260,
            icon: <LocalShipping style={{ fontSize: 50, color: '#d32f2f' }} />,
            description: "One-time fee for furniture pickup service with disassembly/assembly"
          }
        };

        itemTypes[serviceKey] = defaultPickupServices[serviceKey as keyof typeof defaultPickupServices];
      }
    });

    return itemTypes;
  };

  const itemTypes = getItemTypes();
  
  // 城市选项
  const cities = getActiveCities();
  const systemSettings = getSystemSettings();
  
  // 存储时间选项（1-12个月）
  const months = Array.from({length: 12}, (_, i) => i + 1);

  function resetItems(): void {
    setReset(true);
    setItemQuantities({});
    setSelectedCity('');
    setStorageMonths('');
    setTimeout(() => {
      setReset(false);
    }, 0);
  }
  
  function addItem(itemKey: string, quantity: number): void {
    setItemQuantities(prev => ({
      ...prev,
      [itemKey]: (prev[itemKey] || 0) + quantity
    }));
  }

  function roundDecimals(num: number){
    return Math.round(num * 100) / 100;
  }

  // 计算总价
  const calculateTotalPrice = () => {
    let total = 0;
    Object.keys(itemQuantities).forEach(itemKey => {
      const quantity = itemQuantities[itemKey];
      const itemType = itemTypes[itemKey];
      if (itemType && quantity > 0) {
        total += itemType.price * quantity;
      }
    });
    return total;
  };

  // 计算存储费用（按月）
  const calculateStorageFee = () => {
    let total = 0;
    Object.keys(itemQuantities).forEach(itemKey => {
      const quantity = itemQuantities[itemKey];
      const itemType = itemTypes[itemKey];
      // 只计算存储物品，不包括上门取货服务
      if (itemType && quantity > 0 && !itemKey.includes('Pickup')) {
        total += itemType.price * quantity;
      }
    });
    return total;
  };

  // 计算上门取货服务费用（一次性）
  const calculatePickupFee = () => {
    let total = 0;
    Object.keys(itemQuantities).forEach(itemKey => {
      const quantity = itemQuantities[itemKey];
      const itemType = itemTypes[itemKey];
      // 只计算上门取货服务
      if (itemType && quantity > 0 && itemKey.includes('Pickup')) {
        total += itemType.price * quantity;
      }
    });
    return total;
  };

  const monthlyStorageFee = calculateStorageFee();
  const pickupFee = calculatePickupFee();
  const storageSubtotal = monthlyStorageFee * (storageMonths ? parseInt(storageMonths) : 0);
  const subtotal = storageSubtotal + pickupFee;
  const tax = calculateTax(subtotal, systemSettings);
  const additionalFees = calculateAdditionalFees(subtotal, systemSettings);
  const total = subtotal + tax + additionalFees.total;

  // 计算总物品数量
  const totalItems = Object.values(itemQuantities).reduce((sum, quantity) => sum + quantity, 0);

  if (isLoading) {
    return (
      <main className="storage-page">
        <div className="loading">
          <p>加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="storage-page">
      <div className="title">
        <h1>{t('storage.title')}</h1>
        <p>{t('storage.subtitle')}</p>
      </div>
      
      {/* 位置和存储时间选择区域 */}
      <div className="location-section">
        <div className="location-box">
          <h3>{t('storage.chooseCity')}</h3>
          <div className="location-inputs">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">{t('storage.selectCity')}</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="location-box">
          <h3>{t('storage.storageDuration')}</h3>
          <div className="location-inputs">
            <select 
              value={storageMonths}
              onChange={(e) => setStorageMonths(e.target.value)}
            >
              <option value="">{t('storage.selectMonths')}</option>
              {months.map(month => (
                <option key={month} value={month}>
                  {month} {month === 1 ? t('storage.month') : t('storage.months')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 物品选择区域 */}
      <div className="items-section">
        {/* 行李箱类 */}
        <div className="category-section">
          <h2>{t('storage.categories.luggage')}</h2>
          <div className="items">
            <Item
              name={t('storage.items.carryOnLuggage')}
              image={itemTypes.carryOnLuggage.icon}
              multiplier={itemTypes.carryOnLuggage.price}
              reset={reset}
              addItem={(quantity) => addItem('carryOnLuggage', quantity)}
            />
            <Item
              name={t('storage.items.checkedLuggage')}
              image={itemTypes.checkedLuggage.icon}
              multiplier={itemTypes.checkedLuggage.price}
              reset={reset}
              addItem={(quantity) => addItem('checkedLuggage', quantity)}
            />
          </div>
        </div>

        {/* 交通工具类 */}
        <div className="category-section">
          <h2>{t('storage.categories.transportation')}</h2>
          <div className="items">
            <Item
              name={t('storage.items.bicycle')}
              image={itemTypes.bicycle.icon}
              multiplier={itemTypes.bicycle.price}
              reset={reset}
              addItem={(quantity) => addItem('bicycle', quantity)}
            />
          </div>
        </div>

        {/* 电子产品类 */}
        <div className="category-section">
          <h2>{t('storage.categories.electronics')}</h2>
          <div className="items">
            <Item
              name={t('storage.items.tv')}
              image={itemTypes.tv.icon}
              multiplier={itemTypes.tv.price}
              reset={reset}
              addItem={(quantity) => addItem('tv', quantity)}
            />
          </div>
        </div>

        {/* 家具类 */}
        <div className="category-section">
          <h2>{t('storage.categories.furniture')}</h2>
          <div className="items">
            <Item
              name={t('storage.items.gamingChair')}
              image={itemTypes.gamingChair.icon}
              multiplier={itemTypes.gamingChair.price}
              reset={reset}
              addItem={(quantity) => addItem('gamingChair', quantity)}
            />
            <Item
              name={itemTypes.twinBed.name}
              image={itemTypes.twinBed.icon}
              multiplier={itemTypes.twinBed.price}
              reset={reset}
              addItem={(quantity) => addItem('twinBed', quantity)}
            />
            <Item
              name={itemTypes.fullBed.name}
              image={itemTypes.fullBed.icon}
              multiplier={itemTypes.fullBed.price}
              reset={reset}
              addItem={(quantity) => addItem('fullBed', quantity)}
            />
            <Item
              name={itemTypes.queenBed.name}
              image={itemTypes.queenBed.icon}
              multiplier={itemTypes.queenBed.price}
              reset={reset}
              addItem={(quantity) => addItem('queenBed', quantity)}
            />
            <Item
              name={itemTypes.kingBed.name}
              image={itemTypes.kingBed.icon}
              multiplier={itemTypes.kingBed.price}
              reset={reset}
              addItem={(quantity) => addItem('kingBed', quantity)}
            />
          </div>
        </div>

        {/* Home Depot纸箱类 */}
        <div className="category-section">
          <h2>{t('storage.categories.homeDepotBoxes')}</h2>
          <div className="items">
            <Item
              name={t('storage.items.smallBox')}
              image={itemTypes.smallBox.icon}
              multiplier={itemTypes.smallBox.price}
              reset={reset}
              addItem={(quantity) => addItem('smallBox', quantity)}
            />
            <Item
              name={t('storage.items.mediumBox')}
              image={itemTypes.mediumBox.icon}
              multiplier={itemTypes.mediumBox.price}
              reset={reset}
              addItem={(quantity) => addItem('mediumBox', quantity)}
            />
            <Item
              name={t('storage.items.largeBox')}
              image={itemTypes.largeBox.icon}
              multiplier={itemTypes.largeBox.price}
              reset={reset}
              addItem={(quantity) => addItem('largeBox', quantity)}
            />
            <Item
              name={t('storage.items.extraLargeBox')}
              image={itemTypes.extraLargeBox.icon}
              multiplier={itemTypes.extraLargeBox.price}
              reset={reset}
              addItem={(quantity) => addItem('extraLargeBox', quantity)}
            />
            <Item
              name={t('storage.items.superLargeBox')}
              image={itemTypes.superLargeBox.icon}
              multiplier={itemTypes.superLargeBox.price}
              reset={reset}
              addItem={(quantity) => addItem('superLargeBox', quantity)}
            />
          </div>
        </div>

        {/* 体积存储类 */}
        <div className="category-section">
          <h2>{t('storage.categories.volumeStorage')}</h2>
          <div className="items">
            {itemTypes.volumeStorage && (
              <Item
                name={`${itemTypes.volumeStorage.name}\n(${t('storage.volumeStorage.volume')})\n$${itemTypes.volumeStorage.price}/${t('storage.volumeStorage.unit')}`}
                image={itemTypes.volumeStorage.icon}
                multiplier={itemTypes.volumeStorage.price}
                reset={reset}
                addItem={(quantity) => addItem('volumeStorage', quantity)}
              />
            )}
          </div>
        </div>

        {/* 上门取货服务 */}
        <div className="category-section">
          <h2>{t('storage.categories.pickupService')}</h2>
          <div className="items">
            <Item
              name={t('storage.items.onlyBoxPickupNoStairs')}
              image={itemTypes.onlyBoxPickupNoStairs.icon}
              multiplier={itemTypes.onlyBoxPickupNoStairs.price}
              reset={reset}
              addItem={(quantity) => addItem('onlyBoxPickupNoStairs', quantity)}
            />
            <Item
              name={t('storage.items.onlyBoxPickupWithStairs')}
              image={itemTypes.onlyBoxPickupWithStairs.icon}
              multiplier={itemTypes.onlyBoxPickupWithStairs.price}
              reset={reset}
              addItem={(quantity) => addItem('onlyBoxPickupWithStairs', quantity)}
            />
            <Item
              name={t('storage.items.furniturePickupNoStairs')}
              image={itemTypes.furniturePickupNoStairs.icon}
              multiplier={itemTypes.furniturePickupNoStairs.price}
              reset={reset}
              addItem={(quantity) => addItem('furniturePickupNoStairs', quantity)}
            />
            <Item
              name={t('storage.items.furniturePickupAssembly')}
              image={itemTypes.furniturePickupAssembly.icon}
              multiplier={itemTypes.furniturePickupAssembly.price}
              reset={reset}
              addItem={(quantity) => addItem('furniturePickupAssembly', quantity)}
            />
          </div>
        </div>
      </div>

      <div className="buttons">
        <button id="clear" onClick={resetItems}>
          {t('storage.buttons.clear')}
        </button>
        <button id="calculate">{t('storage.buttons.calculate')}</button>
      </div>

      <div className="summary">
        <h1>{t('storage.summary.title')}</h1>
        
        {/* 价格说明 */}
        <div className="pricing-info">
          <h3>{t('storage.pricingInfo.title')}</h3>
          <ul>
            <li><strong>{t('storage.pricingInfo.fixedMonthlyPrice')}</strong></li>
            <li><strong>{t('storage.pricingInfo.allWarehouses')}</strong></li>
            <li><strong>{t('storage.pricingInfo.noVolumeCalculation')}</strong></li>
          </ul>
        </div>
        
        <table>
          <tbody>
            <tr>
              <td>{t('storage.summary.totalItems')}</td>
              <td>{totalItems}</td>
            </tr>
            <tr>
              <td>{t('storage.summary.monthlyStorageCost')}</td>
              <td>${monthlyStorageFee}</td>
            </tr>
            <tr>
              <td>{t('storage.summary.storageDuration')}</td>
              <td>{storageMonths ? `${storageMonths} ${parseInt(storageMonths) === 1 ? t('storage.month') : t('storage.months')}` : t('storage.selectMonths')}</td>
            </tr>
            <tr>
              <td>{t('storage.summary.storageSubtotal')}</td>
              <td>{`$${roundDecimals(storageSubtotal)}`}</td>
            </tr>
            {pickupFee > 0 && (
              <tr>
                <td>{t('storage.summary.pickupServiceFee')}</td>
                <td>${pickupFee}</td>
              </tr>
            )}
            <tr>
              <td>{t('storage.summary.subtotal')}</td>
              <td>{`$${roundDecimals(subtotal)}`}</td>
            </tr>
            <tr>
              <td>{t('storage.summary.tax')}</td>
              <td>{`$${roundDecimals(tax)}`}</td>
            </tr>
            {systemSettings.taxAndFees.fuelSurchargeEnabled && additionalFees.fuelSurcharge > 0 && (
              <tr>
                <td>{t('storage.summary.fuelSurcharge')}</td>
                <td>{`$${roundDecimals(additionalFees.fuelSurcharge)}`}</td>
              </tr>
            )}
            {systemSettings.taxAndFees.insuranceEnabled && additionalFees.insurance > 0 && (
              <tr>
                <td>{t('storage.summary.insurance')}</td>
                <td>{`$${roundDecimals(additionalFees.insurance)}`}</td>
              </tr>
            )}
            {systemSettings.taxAndFees.packagingEnabled && additionalFees.packaging > 0 && (
              <tr>
                <td>{t('storage.summary.packaging')}</td>
                <td>{`$${roundDecimals(additionalFees.packaging)}`}</td>
              </tr>
            )}
            <tr>
              <td>{t('storage.summary.total')}</td>
              <td>{`$${roundDecimals(total)}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default StoragePage; 