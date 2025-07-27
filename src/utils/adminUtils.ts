// 管理员工具函数

export type City = 'Vancouver' | 'Calgary' | 'Winnipeg';

export type PricingTable = {
  [key in City]: {
    [key in City]?: number;
  };
};

export interface ItemType {
  name: string;
  price: number;
  icon: string;
  description?: string;
}

export interface AdminPricingData {
  // 跨省搬家价格
  intercityPricing: PricingTable;
  intercityLocalServiceRate: number; // 跨省搬家的本地服务费率
  
  // 同城搬家价格
  localMovingHourlyRate: number; // 每人每小时$45
  localMovingAdditionalPersonFee: number; // 每增加一人额外$40
  localMovingDeposit: number; // 押金$60加元或¥300人民币
  
  // 存储家具价格
  storageItems: { [key: string]: ItemType };
}

// API基础URL - 根据环境自动选择
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// 从后端API加载价格数据
export const loadPricingData = async (): Promise<AdminPricingData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pricing`);
    if (!response.ok) {
      throw new Error('Failed to fetch pricing data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load pricing data from API:', error);
    // 返回默认数据作为后备
    return defaultPricingData;
  }
};

// 保存价格数据到后端API
export const savePricingData = async (data: AdminPricingData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pricing`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pricingData: data }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save pricing data');
    }
    
    const result = await response.json();
    console.log('Save result:', result);
    return true;
  } catch (error) {
    console.error('Failed to save pricing data to API:', error);
    return false;
  }
};

// 重置价格数据为默认值
export const resetPricingData = async (): Promise<AdminPricingData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pricing/reset`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset pricing data');
    }
    
    // 重新加载默认数据
    return await loadPricingData();
  } catch (error) {
    console.error('Failed to reset pricing data:', error);
    return defaultPricingData;
  }
};

// 从后端API加载城市数据
export const loadCitiesData = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cities`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load cities data from API:', error);
    // 返回默认数据作为后备
    return [];
  }
};

// 保存城市数据到后端API
export const saveCitiesData = async (cities: any[]): Promise<boolean> => {
  try {
    console.log('saveCitiesData 开始调用API，数据:', cities);
    
    // 逐个更新城市数据
    for (const city of cities) {
      const response = await fetch(`${API_BASE_URL}/api/cities/${city.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: city.name,
          icon: city.icon || '🏙️',
          isActive: city.isActive
        }),
      });
      
      console.log(`城市 ${city.name} 更新响应:`, response.status, response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`城市 ${city.name} 更新失败:`, errorText);
        throw new Error(`Failed to save city ${city.name}`);
      }
    }
    
    console.log('所有城市数据保存成功');
    return true;
  } catch (error) {
    console.error('Failed to save cities data to API:', error);
    return false;
  }
};

// 重置城市数据到默认值
export const resetCitiesData = async (): Promise<any[]> => {
  try {
    console.log('resetCitiesData 开始调用API');
    
    const response = await fetch(`${API_BASE_URL}/api/cities/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset cities data');
    }
    
    // 重新加载默认数据
    return await loadCitiesData();
  } catch (error) {
    console.error('Failed to reset cities data:', error);
    return [];
  }
};

// 从后端API加载系统设置
export const loadSystemSettings = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch system settings');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load system settings from API:', error);
    // 返回默认数据作为后备
    return {};
  }
};

// 保存系统设置到后端API
export const saveSystemSettings = async (settings: any): Promise<boolean> => {
  try {
    console.log('saveSystemSettings 开始调用API，数据:', settings);
    
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });
    
    console.log('API响应状态:', response.status, response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', errorText);
      throw new Error('Failed to save system settings');
    }
    
    const result = await response.json();
    console.log('API响应结果:', result);
    
    return true;
  } catch (error) {
    console.error('Failed to save system settings to API:', error);
    return false;
  }
};

// 重置系统设置为默认值
export const resetSystemSettings = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/reset`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset system settings');
    }
    
    // 重新加载默认数据
    return await loadSystemSettings();
  } catch (error) {
    console.error('Failed to reset system settings:', error);
    return {};
  }
};

// 默认价格数据（作为后备）
export const defaultPricingData: AdminPricingData = {
  // 跨省搬家价格
  intercityPricing: {
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
  },
  intercityLocalServiceRate: 120, // 跨省搬家的本地服务费率
  
  // 同城搬家价格
  localMovingHourlyRate: 45, // 每人每小时$45
  localMovingAdditionalPersonFee: 40, // 每增加一人额外$40
  localMovingDeposit: 60, // 押金$60加元或¥300人民币
  
  // 存储家具价格
  storageItems: {
    carryOnLuggage: {
      name: "Carry-on Luggage (≤115cm)",
      price: 15,
      icon: "Flight",
      description: "Sum of three sides not exceeding 115cm (including wheels)"
    },
    checkedLuggage: {
      name: "Checked Luggage (≤165cm)",
      price: 25,
      icon: "Luggage",
      description: "Sum of three sides not exceeding 165cm (including wheels)"
    },
    bicycle: {
      name: "Bicycle",
      price: 35,
      icon: "DirectionsBike",
      description: "Battery not included, battery must be stored separately"
    },
    tv: {
      name: "TV",
      price: 40,
      icon: "Tv",
      description: "Without box (if with box, calculated as per box)"
    },
    gamingChair: {
      name: "Gaming Chair",
      price: 35,
      icon: "Chair",
      description: "Separate chair without detached footrest"
    },
    twinBed: {
      name: "Twin Mattress (Bed Frame x2)",
      price: 45,
      icon: "Bed",
      description: "Twin mattress storage, bed frame price x2 if needed"
    },
    fullBed: {
      name: "Full Mattress (Bed Frame x2)",
      price: 50,
      icon: "Bed",
      description: "Full mattress storage, bed frame price x2 if needed"
    },
    queenBed: {
      name: "Queen Mattress (Bed Frame x2)",
      price: 70,
      icon: "Bed",
      description: "Queen mattress storage, bed frame price x2 if needed"
    },
    kingBed: {
      name: "King Mattress (Bed Frame x2)",
      price: 70,
      icon: "Bed",
      description: "King mattress storage, bed frame price x2 if needed"
    },
    smallBox: {
      name: "Home Depot\nSmall Box\n(≤110cm)",
      price: 15,
      icon: "Inventory2",
      description: "Sum of three sides not exceeding 110cm"
    },
    mediumBox: {
      name: "Home Depot\nMedium Box\n(≤135cm)",
      price: 18,
      icon: "Inventory2",
      description: "Sum of three sides not exceeding 135cm"
    },
    largeBox: {
      name: "Home Depot\nLarge Box\n(≤150cm)",
      price: 22,
      icon: "Inventory2",
      description: "Sum of three sides not exceeding 150cm"
    },
    extraLargeBox: {
      name: "Home Depot\nExtra Large Box\n(≤165cm)",
      price: 25,
      icon: "Inventory2",
      description: "Sum of three sides not exceeding 165cm"
    },
    superLargeBox: {
      name: "Home Depot\nSuper Large Box\n(≤200cm)",
      price: 35,
      icon: "Inventory2",
      description: "Sum of three sides not exceeding 200cm"
    },
    volumeStorage: {
      name: "Volume Storage Per m³",
      price: 45,
      icon: "Storage",
      description: "For items that cannot be categorized, calculated by volume"
    },
    onlyBoxPickupNoStairs: {
      name: "Only Box Pickup Service (Every 10 pieces) - No Stairs",
      price: 40,
      icon: "LocalShipping",
      description: "One-time fee for box pickup service without stairs"
    },
    onlyBoxPickupWithStairs: {
      name: "Only Box Pickup Service (Every 10 pieces) - With Stairs",
      price: 80,
      icon: "LocalShipping",
      description: "One-time fee for box pickup service with stairs"
    },
    furniturePickupNoStairs: {
      name: "Furniture Pickup Service - No Stairs",
      price: 160,
      icon: "LocalShipping",
      description: "One-time fee for furniture pickup service without stairs"
    },
    furniturePickupAssembly: {
      name: "Furniture Pickup Service - With Assembly",
      price: 260,
      icon: "LocalShipping",
      description: "One-time fee for furniture pickup service with disassembly/assembly"
    }
  }
}; 