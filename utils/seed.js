// Codex, GPT-5.5 High, OpenAI.
const Product = require('../models/Product');
const migrateProductDocuments = require('./migrateProductCompat');

const samples = [
  {
    name: 'Linux 开发工作站',
    description: '适合 Node.js 开发、数据库调试和日常办公的高性能主机。',
    price: 6999,
    category: '数码设备',
    condition: 'new',
    freeShipping: true,
    salesCount: 12,
    imageUrl: '/images/workstation.svg',
    sellerName: 'Cream Market',
    stock: 8,
    tags: ['linux', 'nodejs', '开发']
  },
  {
    name: 'MongoDB 实验服务器',
    description: '预装 MongoDB 的小型服务器，适合小组项目部署和演示。',
    price: 3299,
    category: '云应用',
    condition: 'new',
    freeShipping: false,
    salesCount: 3,
    imageUrl: '/images/server.svg',
    sellerName: 'Cream Market',
    stock: 5,
    tags: ['mongodb', 'express']
  },
  {
    name: '二手机械键盘',
    description: '八成新，青轴，适合长时间写代码，支持线下自提。',
    price: 159,
    category: '二手数码',
    condition: 'used',
    wearGrade: 'good',
    freeShipping: true,
    salesCount: 28,
    imageUrl: '/images/keyboard.svg',
    sellerName: '个人卖家',
    stock: 1,
    tags: ['二手', '键盘']
  },
  {
    name: '云应用开发教材',
    description: 'Web 开发资料，带少量笔记，适合学习 Express 与 EJS。',
    price: 35,
    category: '二手书籍',
    condition: 'used',
    wearGrade: 'fair',
    freeShipping: true,
    salesCount: 6,
    imageUrl: '/images/book.svg',
    sellerName: '个人卖家',
    stock: 1,
    tags: ['教材', '二手']
  },
  {
    name: '响应式页面设计服务',
    description: '提供原生 HTML、CSS、JavaScript 页面优化服务。',
    price: 299,
    category: '服务',
    condition: 'new',
    freeShipping: true,
    salesCount: 0,
    imageUrl: '/images/design.svg',
    sellerName: 'Cream Market',
    stock: 20,
    tags: ['css', 'ui']
  },
  {
    name: '二手显示器',
    description: '24 英寸 IPS 显示器，色彩稳定，适合宿舍学习桌使用。',
    price: 420,
    category: '二手数码',
    condition: 'used',
    wearGrade: 'like_new',
    freeShipping: false,
    salesCount: 15,
    imageUrl: '/images/monitor.svg',
    sellerName: '个人卖家',
    stock: 1,
    tags: ['显示器', '二手']
  },
  {
    name: '二手人体工学椅',
    description: '网布靠背，带腰托和升降功能，适合长时间学习办公。',
    price: 380,
    category: '二手家具',
    condition: 'used',
    wearGrade: 'good',
    freeShipping: false,
    salesCount: 9,
    imageUrl: '/images/product-default.svg',
    sellerName: '校园卖家A',
    stock: 2,
    tags: ['椅子', '办公', '二手']
  },
  {
    name: '95 新蓝牙耳机',
    description: '支持主动降噪与通透模式，续航约 24 小时。',
    price: 279,
    category: '二手数码',
    condition: 'used',
    wearGrade: 'like_new',
    freeShipping: true,
    salesCount: 14,
    imageUrl: '/images/product-default.svg',
    sellerName: '数码回收店',
    stock: 3,
    tags: ['耳机', '蓝牙', '降噪']
  },
  {
    name: '入门摄影微单相机',
    description: '适合旅行和日常拍摄，机身轻便，附赠 32G 存储卡。',
    price: 2599,
    category: '数码设备',
    condition: 'new',
    freeShipping: true,
    salesCount: 7,
    imageUrl: '/images/product-default.svg',
    sellerName: '影像旗舰店',
    stock: 6,
    tags: ['相机', '摄影', '旅行']
  },
  {
    name: '二手吉他民谣 41 寸',
    description: '琴颈顺手，音色通透，带琴包与备用琴弦。',
    price: 520,
    category: '二手乐器',
    condition: 'used',
    wearGrade: 'fair',
    freeShipping: false,
    salesCount: 5,
    imageUrl: '/images/product-default.svg',
    sellerName: '音乐社学长',
    stock: 1,
    tags: ['吉他', '乐器', '二手']
  },
  {
    name: '智能手环 Pro',
    description: '支持心率监测、睡眠分析与 50 米防水，适合跑步训练。',
    price: 189,
    category: '运动户外',
    condition: 'new',
    freeShipping: true,
    salesCount: 26,
    imageUrl: '/images/product-default.svg',
    sellerName: '运动装备店',
    stock: 25,
    tags: ['手环', '运动', '健康']
  },
  {
    name: '二手路由器 WiFi6',
    description: '千兆双频，支持多设备稳定连接，宿舍路由优选。',
    price: 168,
    category: '二手数码',
    condition: 'used',
    wearGrade: 'visible_wear',
    freeShipping: true,
    salesCount: 12,
    imageUrl: '/images/product-default.svg',
    sellerName: '校园卖家B',
    stock: 4,
    tags: ['路由器', '网络', '宿舍']
  },
  {
    name: 'JavaScript 高级程序设计（九成新）',
    description: '经典前端进阶书籍，少量划线，附学习笔记。',
    price: 52,
    category: '二手书籍',
    condition: 'used',
    wearGrade: 'good',
    freeShipping: true,
    salesCount: 18,
    imageUrl: '/images/book.svg',
    sellerName: '前端学习社',
    stock: 2,
    tags: ['前端', 'javascript', '书籍']
  },
  {
    name: 'TypeScript 企业项目实战',
    description: '从类型系统到工程化，配套示例代码下载。',
    price: 88,
    category: '图书教材',
    condition: 'new',
    freeShipping: true,
    salesCount: 11,
    imageUrl: '/images/book.svg',
    sellerName: '技术书店',
    stock: 30,
    tags: ['typescript', '工程化', '学习']
  },
  {
    name: '二手空气炸锅 4L',
    description: '功能正常，轻微使用痕迹，适合宿舍/单身公寓。',
    price: 210,
    category: '二手家电',
    condition: 'used',
    wearGrade: 'fair',
    freeShipping: false,
    salesCount: 4,
    imageUrl: '/images/product-default.svg',
    sellerName: '生活好物店',
    stock: 1,
    tags: ['家电', '厨房', '二手']
  },
  {
    name: '桌面补光灯套装',
    description: '适合直播、拍摄和线上会议，亮度与色温可调。',
    price: 129,
    category: '数码配件',
    condition: 'new',
    freeShipping: true,
    salesCount: 22,
    imageUrl: '/images/product-default.svg',
    sellerName: '创作设备店',
    stock: 16,
    tags: ['补光灯', '直播', '拍摄']
  },
  {
    name: '二手 iPad 保护壳合集',
    description: '三款风格可选，轻微磨损，功能完好。',
    price: 39,
    category: '二手配件',
    condition: 'used',
    wearGrade: 'visible_wear',
    freeShipping: true,
    salesCount: 31,
    imageUrl: '/images/product-default.svg',
    sellerName: '校园卖家C',
    stock: 6,
    tags: ['平板', '保护壳', '二手']
  },
  {
    name: '远程简历优化服务',
    description: '针对互联网岗位提供简历修改与面试建议。',
    price: 199,
    category: '服务',
    condition: 'new',
    freeShipping: true,
    salesCount: 16,
    imageUrl: '/images/design.svg',
    sellerName: '职业顾问',
    stock: 50,
    tags: ['简历', '求职', '咨询']
  },
  {
    name: '二手篮球鞋 42 码',
    description: '缓震良好，鞋底轻微磨损，适合室内木地板场地。',
    price: 260,
    category: '二手服饰',
    condition: 'used',
    wearGrade: 'good',
    freeShipping: false,
    salesCount: 10,
    imageUrl: '/images/product-default.svg',
    sellerName: '运动达人',
    stock: 1,
    tags: ['球鞋', '运动', '二手']
  },
  {
    name: '4K 便携显示器 15.6 英寸',
    description: 'Type-C 一线直连，适合双屏办公与外出演示。',
    price: 1199,
    category: '数码设备',
    condition: 'new',
    freeShipping: true,
    salesCount: 8,
    imageUrl: '/images/monitor.svg',
    sellerName: '显示设备店',
    stock: 9,
    tags: ['显示器', '便携', '办公']
  },
  {
    name: '二手电动牙刷套装',
    description: '主机运行正常，赠送全新刷头与旅行盒。',
    price: 85,
    category: '二手家居',
    condition: 'used',
    wearGrade: 'fair',
    freeShipping: true,
    salesCount: 3,
    imageUrl: '/images/product-default.svg',
    sellerName: '宿舍搬家清仓',
    stock: 2,
    tags: ['家居', '个护', '二手']
  },
  {
    name: 'Node.js 项目部署代运维',
    description: '支持 PM2、Nginx、日志排查与简单性能优化。',
    price: 499,
    category: '云应用',
    condition: 'new',
    freeShipping: true,
    salesCount: 6,
    imageUrl: '/images/server.svg',
    sellerName: '云架构服务商',
    stock: 12,
    tags: ['nodejs', '部署', '运维']
  },
  {
    name: '二手办公桌 120cm',
    description: '桌面平整，无结构问题，需同城自提。',
    price: 240,
    category: '二手家具',
    condition: 'used',
    wearGrade: 'visible_wear',
    freeShipping: false,
    salesCount: 2,
    imageUrl: '/images/product-default.svg',
    sellerName: '毕业清仓',
    stock: 1,
    tags: ['办公桌', '家具', '二手']
  },
  {
    name: '小型 NAS 家庭存储',
    description: '双盘位，支持自动备份与远程访问，含基础安装指导。',
    price: 1799,
    category: '数码设备',
    condition: 'new',
    freeShipping: true,
    salesCount: 5,
    imageUrl: '/images/server.svg',
    sellerName: '数码仓库',
    stock: 7,
    tags: ['nas', '存储', '备份']
  },
  {
    name: '二手咖啡机入门款',
    description: '萃取稳定，轻微外观划痕，适合宿舍咖啡党。',
    price: 330,
    category: '二手家电',
    condition: 'used',
    wearGrade: 'good',
    freeShipping: false,
    salesCount: 7,
    imageUrl: '/images/product-default.svg',
    sellerName: '咖啡爱好者',
    stock: 1,
    tags: ['咖啡机', '家电', '二手']
  },
  {
    name: '轻量跑步外套',
    description: '速干透气面料，夜跑反光条设计，春秋通勤可穿。',
    price: 149,
    category: '运动户外',
    condition: 'new',
    freeShipping: true,
    salesCount: 19,
    imageUrl: '/images/product-default.svg',
    sellerName: '运动装备店',
    stock: 18,
    tags: ['外套', '跑步', '速干']
  },
  {
    name: '二手程序员午休折叠床',
    description: '可折叠收纳，承重稳定，成色一般但功能完好。',
    price: 118,
    category: '二手家居',
    condition: 'used',
    wearGrade: 'fair',
    freeShipping: false,
    salesCount: 4,
    imageUrl: '/images/product-default.svg',
    sellerName: '工位整理铺',
    stock: 2,
    tags: ['折叠床', '午休', '二手']
  }
];

async function seedProducts() {
  const existing = await Product.find({}, { name: 1 }).lean();
  const existingNames = new Set(existing.map((item) => item.name));
  const toInsert = samples.filter((item) => !existingNames.has(item.name));

  if (toInsert.length > 0) {
    await Product.insertMany(toInsert);
    console.log('Sample products inserted:', toInsert.length);
  }

  await migrateProductDocuments();
}

module.exports = seedProducts;
// end: Codex, GPT-5.5 High, OpenAI.
