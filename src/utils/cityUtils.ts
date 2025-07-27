export interface SimpleCityData {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
}

// 默认城市数据
export const defaultCities: SimpleCityData[] = [
  {
    id: 'vancouver',
    name: 'Vancouver',
    displayName: '温哥华',
    isActive: true
  },
  {
    id: 'calgary',
    name: 'Calgary',
    displayName: '卡尔加里',
    isActive: true
  },
  {
    id: 'winnipeg',
    name: 'Winnipeg',
    displayName: '温尼伯',
    isActive: true
  }
];

// 获取启用的城市列表
export const getActiveCities = async (): Promise<SimpleCityData[]> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/cities`);
    if (response.ok) {
      const cities = await response.json();
      return cities.filter((city: any) => city.isActive);
    }
  } catch (error) {
    console.error('Failed to fetch cities from API:', error);
  }
  
  // 如果API失败，返回默认数据
  return defaultCities.filter(city => city.isActive);
};

// 获取启用的城市名称列表（保持向后兼容）
export const getActiveCityNames = async (): Promise<string[]> => {
  const cities = await getActiveCities();
  return cities.map(city => city.name);
};

// 获取启用的城市显示名称映射
export const getActiveCitiesDisplayNames = async (): Promise<{ [key: string]: string }> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/cities`);
    if (response.ok) {
      const cities = await response.json();
      const result: { [key: string]: string } = {};
      cities.filter((city: any) => city.isActive).forEach((city: any) => {
        result[city.name] = city.displayName || city.name;
      });
      return result;
    }
  } catch (error) {
    console.error('Failed to fetch cities from API:', error);
  }
  
  // 如果API失败，返回默认数据
  const result: { [key: string]: string } = {};
  defaultCities.filter(city => city.isActive).forEach(city => {
    result[city.name] = city.displayName;
  });
  return result;
}; 