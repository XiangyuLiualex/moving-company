export interface SystemSettings {
  // 基础配置
  websiteInfo: {
    titleZh: string;
    titleEn: string;
    descriptionZh: string;
    descriptionEn: string;
    companyName: string;
    phone: string;
    email: string;
    address: string;
  };
  
  // 页面标题
  pageTitles: {
    homeZh: string;
    homeEn: string;
    movingServiceZh: string;
    movingServiceEn: string;
    storageZh: string;
    storageEn: string;
  };
  
  // 税率和费用
  taxAndFees: {
    gstRate: number; // GST税率
    pstRate: number; // PST税率
    gstEnabled: boolean;
    pstEnabled: boolean;
    fuelSurcharge: number; // 燃油附加费百分比
    fuelSurchargeEnabled: boolean; // 燃油附加费启用
    insuranceRate: number; // 保险费率百分比
    insuranceEnabled: boolean; // 保险费启用
    packagingFee: number; // 包装材料费
    packagingEnabled: boolean; // 包装费启用
  };
}

// 默认系统设置
export const defaultSystemSettings: SystemSettings = {
  websiteInfo: {
    titleZh: '搬家服务公司',
    titleEn: 'Moving Company',
    descriptionZh: '专业的搬家服务，提供同城搬家、跨省搬家、家具存储等服务',
    descriptionEn: 'Professional moving services including local moving, intercity moving, and furniture storage',
    companyName: '搬家服务公司',
    phone: '+1-xxx-xxx-xxxx',
    email: 'info@movingcompany.com',
    address: 'Vancouver, BC, Canada'
  },
  pageTitles: {
    homeZh: '搬家服务公司 - 专业搬家服务',
    homeEn: 'Moving Company - Professional Moving Services',
    movingServiceZh: '搬家服务 - 同城搬家 | 跨省搬家',
    movingServiceEn: 'Moving Services - Local Moving | Intercity Moving',
    storageZh: '家具存储服务 - 安全可靠的存储解决方案',
    storageEn: 'Furniture Storage Services - Secure and Reliable Storage Solutions'
  },
  taxAndFees: {
    gstRate: 5, // 5%
    pstRate: 7, // 7%
    gstEnabled: true,
    pstEnabled: true,
    fuelSurcharge: 3, // 3%
    fuelSurchargeEnabled: true,
    insuranceRate: 1, // 1%
    insuranceEnabled: true,
    packagingFee: 20, // $20
    packagingEnabled: true
  }
};

// 从API获取系统设置
export const getSystemSettings = (): SystemSettings => {
  // 这个函数现在只返回默认设置，实际设置通过API获取
  return defaultSystemSettings;
};

// 保存系统设置到API
export const saveSystemSettings = async (settings: SystemSettings): Promise<boolean> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save system settings');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save system settings to API:', error);
    return false;
  }
};

// 更新网站标题和描述
export const updateWebsiteInfo = (info: Partial<SystemSettings['websiteInfo']>): void => {
  const settings = getSystemSettings();
  const updatedSettings = {
    ...settings,
    websiteInfo: { ...settings.websiteInfo, ...info }
  };
  saveSystemSettings(updatedSettings);
  
  // 更新HTML页面的title和meta description
  updatePageMeta(updatedSettings.websiteInfo);
};

// 更新页面meta信息
export const updatePageMeta = (websiteInfo: SystemSettings['websiteInfo']): void => {
  // 根据当前语言更新页面标题和描述
  const currentLang = localStorage.getItem('i18nextLng') || 'zh';
  
  if (currentLang === 'zh') {
    document.title = websiteInfo.titleZh;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', websiteInfo.descriptionZh);
    }
  } else {
    document.title = websiteInfo.titleEn;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', websiteInfo.descriptionEn);
    }
  }
};

// 计算税费
export const calculateTax = (subtotal: number, settings: SystemSettings): number => {
  let tax = 0;
  
  if (settings.taxAndFees.gstEnabled) {
    tax += subtotal * (settings.taxAndFees.gstRate / 100);
  }
  
  if (settings.taxAndFees.pstEnabled) {
    tax += subtotal * (settings.taxAndFees.pstRate / 100);
  }
  
  return tax;
};

// 计算额外费用
export const calculateAdditionalFees = (subtotal: number, settings: SystemSettings): {
  fuelSurcharge: number;
  insurance: number;
  packaging: number;
  total: number;
} => {
  const fuelSurcharge = settings.taxAndFees.fuelSurchargeEnabled ? 
    subtotal * (settings.taxAndFees.fuelSurcharge / 100) : 0;
  const insurance = settings.taxAndFees.insuranceEnabled ? 
    subtotal * (settings.taxAndFees.insuranceRate / 100) : 0;
  const packaging = settings.taxAndFees.packagingEnabled ? 
    settings.taxAndFees.packagingFee : 0;
  
  return {
    fuelSurcharge,
    insurance,
    packaging,
    total: fuelSurcharge + insurance + packaging
  };
}; 