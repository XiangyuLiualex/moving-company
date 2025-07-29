const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

// CORS配置 - 明确允许前端域名
app.use(cors({
  origin: [
    'https://moving-company-8j81.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 数据库初始化
const db = new Database(path.join(__dirname, 'moving_company.db'));

// 创建表
const initDatabase = () => {
  // 价格配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS pricing_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 城市配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT UNIQUE NOT NULL,
      city_icon TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 系统设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 插入默认价格数据
  const defaultPricing = {
    intercityPricing: JSON.stringify({
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
    }),
    intercityLocalServiceRate: '120',
    localMovingStandardArea: JSON.stringify({
      withVehicle: {
        baseRate: 80,
        additionalPersonFee: 40
      },
      withoutVehicle: {
        baseRate: 45
      }
    }),
    localMovingPremiumArea: JSON.stringify({
      withVehicle: {
        baseRate: 90,
        additionalPersonFee: 40
      },
      withoutVehicle: {
        baseRate: 55
      }
    }),
    localMovingSettings: JSON.stringify({
      minimumHours: 2,
      depositRequired: 3,
      depositRMB: 300
    }),
    storageItems: JSON.stringify({
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
        name: "Volume Storage (≤1m³)",
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
    })
  };

  // 插入默认城市数据
  const defaultCities = [
    { name: 'Vancouver', icon: '🏙️', active: 1 },
    { name: 'Calgary', icon: '🏔️', active: 1 },
    { name: 'Winnipeg', icon: '🏞️', active: 1 }
  ];

  // 插入默认系统设置数据
  const defaultSystemSettings = {
    'websiteInfo.titleZh': '搬家服务公司',
    'websiteInfo.titleEn': 'Moving Company',
    'websiteInfo.descriptionZh': '专业的搬家服务，提供同城搬家、跨省搬家、家具存储等服务',
    'websiteInfo.descriptionEn': 'Professional moving services including local moving, intercity moving, and furniture storage',
    'websiteInfo.companyName': '搬家服务公司',
    'websiteInfo.phone': '+1-xxx-xxx-xxxx',
    'websiteInfo.email': 'info@movingcompany.com',
    'websiteInfo.address': 'Vancouver, BC, Canada',
    'taxAndFees.gstRate': '5',
    'taxAndFees.pstRate': '7',
    'taxAndFees.gstEnabled': 'true',
    'taxAndFees.pstEnabled': 'true',
    'taxAndFees.fuelSurcharge': '3',
    'taxAndFees.fuelSurchargeEnabled': 'true',
    'taxAndFees.insuranceRate': '1',
    'taxAndFees.insuranceEnabled': 'true',
    'taxAndFees.packagingFee': '20',
    'taxAndFees.packagingEnabled': 'true'
  };

  // 检查是否已有数据
  const existingPricing = db.prepare('SELECT COUNT(*) as count FROM pricing_config').get();
  if (existingPricing.count === 0) {
    const insertPricing = db.prepare('INSERT OR IGNORE INTO pricing_config (config_key, config_value) VALUES (?, ?)');
    Object.entries(defaultPricing).forEach(([key, value]) => {
      insertPricing.run(key, value);
    });
  }

  const existingCities = db.prepare('SELECT COUNT(*) as count FROM cities_config').get();
  if (existingCities.count === 0) {
    const insertCity = db.prepare('INSERT OR IGNORE INTO cities_config (city_name, city_icon, is_active) VALUES (?, ?, ?)');
    defaultCities.forEach(city => {
      insertCity.run(city.name, city.icon, city.active);
    });
  }

  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
  if (existingSettings.count === 0) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)');
    Object.entries(defaultSystemSettings).forEach(([key, value]) => {
      insertSetting.run(key, value);
    });
  }
};

// 初始化数据库
initDatabase();

// API路由

// 获取所有价格配置
app.get('/api/pricing', (req, res) => {
  try {
    const stmt = db.prepare('SELECT config_key, config_value FROM pricing_config');
    const rows = stmt.all();
    
    const pricingData = {};
    rows.forEach(row => {
      try {
        pricingData[row.config_key] = JSON.parse(row.config_value);
      } catch (e) {
        pricingData[row.config_key] = row.config_value;
      }
    });
    
    res.json(pricingData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新价格配置
app.put('/api/pricing', (req, res) => {
  try {
    const { pricingData } = req.body;
    
    const updateStmt = db.prepare('UPDATE pricing_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?');
    const insertStmt = db.prepare('INSERT OR REPLACE INTO pricing_config (config_key, config_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    
    Object.entries(pricingData).forEach(([key, value]) => {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      insertStmt.run(key, stringValue);
    });
    
    res.json({ success: true, message: '价格配置已更新' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有城市配置
app.get('/api/cities', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM cities_config ORDER BY city_name');
    const cities = stmt.all();
    
    // 转换为前端期望的格式
    const formattedCities = cities.map(city => ({
      id: city.city_name.toLowerCase(),
      name: city.city_name,
      displayName: city.city_name, // 可以根据需要添加中文显示名
      isActive: Boolean(city.is_active),
      icon: city.city_icon || '🏙️'
    }));
    
    res.json(formattedCities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新城市配置
app.put('/api/cities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive, icon } = req.body;
    
    const stmt = db.prepare('UPDATE cities_config SET city_name = ?, city_icon = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE city_name = ?');
    stmt.run(name, icon || '🏙️', isActive ? 1 : 0, id);
    
    res.json({ success: true, message: '城市配置已更新' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加新城市
app.post('/api/cities', (req, res) => {
  try {
    const { city_name, city_icon, is_active } = req.body;
    
    const stmt = db.prepare('INSERT INTO cities_config (city_name, city_icon, is_active) VALUES (?, ?, ?)');
    stmt.run(city_name, city_icon, is_active || 1);
    
    res.json({ success: true, message: '城市已添加' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除城市
app.delete('/api/cities/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM cities_config WHERE id = ?');
    stmt.run(id);
    
    res.json({ success: true, message: '城市已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量更新城市状态
app.put('/api/cities', (req, res) => {
  try {
    const { cities } = req.body;
    if (!Array.isArray(cities)) {
      return res.status(400).json({ error: 'Invalid cities data' });
    }
    const updateStmt = db.prepare('UPDATE cities_config SET is_active = ?, city_icon = ? WHERE city_name = ?');
    cities.forEach(city => {
      updateStmt.run(city.isActive ? 1 : 0, city.icon || '🏙️', city.name);
    });
    res.json({ success: true, message: '城市状态已批量更新' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取系统设置
app.get('/api/settings', (req, res) => {
  try {
    const stmt = db.prepare('SELECT setting_key, setting_value FROM system_settings');
    const rows = stmt.all();
    
    const settings = {};
    rows.forEach(row => {
      const keys = row.setting_key.split('.');
      let current = settings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // 处理布尔值
      if (row.setting_value === 'true' || row.setting_value === 'false') {
        current[keys[keys.length - 1]] = row.setting_value === 'true';
      } else if (!isNaN(row.setting_value)) {
        current[keys[keys.length - 1]] = parseFloat(row.setting_value);
      } else {
        current[keys[keys.length - 1]] = row.setting_value;
      }
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新系统设置
app.put('/api/settings', (req, res) => {
  try {
    const { settings } = req.body;
    console.log('后端收到系统设置更新请求:', settings);
    
    const updateStmt = db.prepare('UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?');
    const insertStmt = db.prepare('INSERT OR REPLACE INTO system_settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    
    const flattenSettings = (obj, prefix = '') => {
      const result = {};
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          Object.assign(result, flattenSettings(value, newKey));
        } else {
          result[newKey] = String(value);
        }
      });
      return result;
    };
    
    const flattenedSettings = flattenSettings(settings);
    console.log('扁平化后的系统设置:', flattenedSettings);
    
    Object.entries(flattenedSettings).forEach(([key, value]) => {
      console.log('保存设置项:', key, '=', value);
      insertStmt.run(key, value);
    });
    
    console.log('系统设置更新完成');
    res.json({ success: true, message: '系统设置已更新' });
  } catch (error) {
    console.error('系统设置更新错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 重置系统设置为默认值
app.post('/api/settings/reset', (req, res) => {
  try {
    db.prepare('DELETE FROM system_settings').run();
    initDatabase();
    res.json({ success: true, message: '系统设置已重置为默认值' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 重置价格配置为默认值
app.post('/api/pricing/reset', (req, res) => {
  try {
    db.prepare('DELETE FROM pricing_config').run();
    initDatabase();
    res.json({ success: true, message: '价格配置已重置为默认值' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('数据库文件位置:', path.join(__dirname, 'moving_company.db'));
}); 