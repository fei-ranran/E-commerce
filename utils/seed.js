// Codex, GPT-5.5 High, OpenAI.
const Product = require('../models/Product');

const samples = [
  {
    name: 'Linux 开发工作站',
    description: '适合 Node.js 开发、数据库调试和日常办公的高性能主机。',
    price: 6999,
    category: '数码设备',
    condition: 'new',
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
    imageUrl: '/images/monitor.svg',
    sellerName: '个人卖家',
    stock: 1,
    tags: ['显示器', '二手']
  }
];

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany(samples);
  console.log('Sample products inserted.');
}

module.exports = seedProducts;
//end: Codex, GPT-5.5 High, OpenAI.
