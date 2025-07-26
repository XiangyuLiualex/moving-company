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

// 从localStorage获取城市数据
export const getCitiesData = (): SimpleCityData[] => {
  try {
    const stored = localStorage.getItem('citiesData');
    return stored ? JSON.parse(stored) : defaultCities;
  } catch {
    return defaultCities;
  }
};

// 保存城市数据到localStorage
export const saveCitiesData = (cities: SimpleCityData[]): void => {
  try {
    localStorage.setItem('citiesData', JSON.stringify(cities));
  } catch (error) {
    console.error('Failed to save cities data:', error);
  }
};

// 获取启用的城市列表
export const getActiveCities = (): string[] => {
  const cities = getCitiesData();
  return cities.filter(city => city.isActive).map(city => city.name);
};

// 获取启用的城市显示名称映射
export const getActiveCitiesDisplayNames = (): { [key: string]: string } => {
  const cities = getCitiesData();
  const result: { [key: string]: string } = {};
  cities.filter(city => city.isActive).forEach(city => {
    result[city.name] = city.displayName;
  });
  return result;
};

// 更新城市状态
export const updateCityStatus = (cityId: string, isActive: boolean): void => {
  const cities = getCitiesData();
  const updatedCities = cities.map(city => 
    city.id === cityId ? { ...city, isActive } : city
  );
  saveCitiesData(updatedCities);
}; 