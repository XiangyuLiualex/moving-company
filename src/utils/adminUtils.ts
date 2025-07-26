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
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 从后端API加载价格数据
export const loadPricingData = async (): Promise<AdminPricingData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing`);
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
    const response = await fetch(`${API_BASE_URL}/pricing`, {
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
    const response = await fetch(`${API_BASE_URL}/pricing/reset`, {
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