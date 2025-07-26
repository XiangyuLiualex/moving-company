const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
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
    localMovingHourlyRate: '45',
    localMovingAdditionalPersonFee: '40',
    localMovingDeposit: '60',
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
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新城市配置
app.put('/api/cities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { city_name, city_icon, is_active } = req.body;
    
    const stmt = db.prepare('UPDATE cities_config SET city_name = ?, city_icon = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(city_name, city_icon, is_active, id);
    
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