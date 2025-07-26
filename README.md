# 搬家服务公司网站

一个专业的搬家服务公司网站，提供同城搬家、跨省搬家、家具存储等服务。支持多语言（中文/英文）、响应式设计和管理员后台。

## 🌟 功能特性

### 🏠 主要服务
- **同城搬家**：本地搬家服务，按小时计费
- **跨省搬家**：跨城市搬家，按托盘计费
- **家具存储**：安全可靠的家具存储服务
- **上门取货**：便捷的取货服务

### 🎨 用户界面
- **响应式设计**：完美适配桌面、平板、手机
- **多语言支持**：中文/英文双语切换
- **现代化UI**：美观的用户界面和交互体验
- **实时计算**：动态价格计算和费用明细

### ⚙️ 管理功能
- **管理员后台**：完整的后台管理系统
- **价格管理**：动态调整服务价格
- **城市管理**：管理服务城市和状态
- **系统设置**：网站配置和税费设置

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Sass/SCSS** - 样式预处理器
- **React Router** - 客户端路由
- **React i18next** - 国际化支持
- **Material-UI Icons** - 图标库

### 后端
- **Node.js** - 服务器运行环境
- **Express.js** - Web应用框架
- **SQLite** - 轻量级数据库
- **better-sqlite3** - SQLite数据库驱动

### 开发工具
- **Create React App** - React项目脚手架
- **Nodemon** - 开发环境自动重启
- **CORS** - 跨域资源共享

## 📦 安装和启动

### 环境要求
- Node.js 16.0 或更高版本
- npm 8.0 或更高版本

### 1. 克隆项目
```bash
git clone <repository-url>
cd moving-company
```

### 2. 安装依赖
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 3. 启动开发服务器

#### 启动后端服务器
```bash
cd server
npm start
```
后端服务器将在 `http://localhost:3001` 启动

#### 启动前端开发服务器
```bash
# 在新的终端窗口中
npm start
```
前端应用将在 `http://localhost:3000` 启动

### 4. 访问应用
- **前端网站**：http://localhost:3000
- **管理员后台**：http://localhost:3000/admin
- **后端API**：http://localhost:3001

## 🗂️ 项目结构

```
moving-company/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── AdminPage.tsx   # 管理员后台
│   │   ├── Header.tsx      # 页面头部
│   │   ├── Footer.tsx      # 页面底部
│   │   ├── LoginPage.tsx   # 登录页面
│   │   ├── MovingPage.tsx  # 跨省搬家页面
│   │   ├── StoragePage.tsx # 存储页面
│   │   └── ...
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── locales/            # 国际化文件
│   └── assets/             # 图片等资源
├── server/                 # 后端代码
│   ├── server.js           # 服务器入口
│   └── database.db         # SQLite数据库
└── package.json            # 项目配置
```

## 🌐 页面说明

### 主要页面
- **首页** (`/`) - 服务介绍和导航
- **同城搬家** (`/local-moving`) - 本地搬家服务
- **跨省搬家** (`/intercity-moving`) - 跨城市搬家服务
- **存储服务** (`/storage`) - 家具存储服务

### 管理页面
- **管理员登录** (`/login`) - 管理员登录入口
- **管理员后台** (`/admin`) - 完整的管理系统

## 🔧 配置说明

### 环境变量
创建 `.env` 文件（可选）：
```env
REACT_APP_API_URL=http://localhost:3001
NODE_ENV=development
PORT=3001
```

### 数据库配置
- 数据库文件：`server/database.db`
- 自动初始化：首次启动时自动创建表结构
- 数据持久化：所有配置数据保存在SQLite数据库中

## 🚀 部署

### 构建生产版本
```bash
npm run build
```

### 部署选项
- **Vercel** - 推荐，免费且简单
- **Netlify** - 免费，功能强大
- **Heroku** - 有免费层
- **DigitalOcean** - 完全控制

## 📱 响应式设计

网站完全响应式，支持以下设备：
- **桌面端**：1920px 及以上
- **平板端**：768px - 1919px
- **手机端**：320px - 767px

## 🌍 国际化

支持多语言切换：
- **中文** - 简体中文
- **English** - 英语

语言文件位置：`src/locales/`

## 🔒 安全特性

- **管理员认证** - 登录验证保护后台
- **路由保护** - 未登录用户无法访问管理页面
- **数据验证** - 输入数据验证和清理
- **CORS配置** - 安全的跨域设置

## 🐛 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查看端口占用
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

**2. 依赖安装失败**
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules
npm install
```

**3. 数据库问题**
```bash
# 删除数据库文件重新初始化
rm server/database.db
# 重启服务器
```

## 📄 许可证

本项目仅供学习和演示使用。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📞 联系

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者

---

**注意**：这是一个演示项目，实际使用时请根据具体需求进行调整和优化。
