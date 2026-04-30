# Cream Market 电商与二手交易平台

## 功能清单

- 商品商城：首页展示、关键词搜索、分类筛选、成色筛选。
- 二手交易：通过 `condition=used` 独立展示二手商品。
- 商品管理：新增、查看、编辑、删除商品。
- 用户系统：注册、登录、退出，登录状态使用 cookie 保存。
- 购物车：加入商品、增加数量、减少数量、移除商品、清空购物车。
- 订单流程：填写收货信息、提交演示订单、查看订单详情。
- MVC 结构：`models/`、`controllers/`、`routes/`、`views/` 分层组织。
- 响应式页面：原生 CSS 适配桌面端与移动端。

## 目录结构

```text
cream/
├── server.js
├── package.json
├── models/
├── controllers/
├── routes/
├── middleware/
├── utils/
├── views/
└── public/
```

## 部署与运行指南 (Linux 环境)

本项目需要在装有 Node.js 和 MongoDB 的系统上运行。请按照以下步骤进行配置和启动：

### 1. 环境准备与依赖安装

请确保当前系统已安装 Node.js。在项目根目录下执行：

```bash
# 安装项目中需要用到的所有依赖包 (Express, Mongoose, EJS 等)
npm install
```

### 2. 启动 MongoDB 数据库

项目的所有数据（用户、商品、订单）均存储在 MongoDB 中，启动项目前必须确保数据库服务已开启。


**使用 Docker 运行**

如果系统已安装 Docker，使用容器化运行 MongoDB 是最整洁的方法。请按照以下步骤进行完整配置：

1. **拉取并首次运行 MongoDB 容器**
   如果你的机器上还没有名为 `mongodb` 的容器，可以运行以下命令拉取官方镜像并启动：
   ```bash
   sudo docker run -d -p 27017:27017 --name mongodb mongo
   ```
   > 参数解释：
   > `-d`: 后台运行。
   > `-p 27017:27017`: 将主机的 27017 端口映射到容器内的 27017 端口。
   > `--name mongodb`: 给这个容器起个名字叫 `mongodb`，方便后续管理。
   > `mongo`: 指定使用的镜像名称。

2. **查看容器运行状态**
   运行以下命令，你可以看到当前所有 Docker 容器的状态：
   ```bash
   sudo docker ps -a
   ```
   如果一切正常，你会看到列表中包含 `mongodb` 容器，并且 `STATUS` 显示为 `Up`。

3. **日常服务管理**
   因为我们已经在第一步创建并命名了这个容器，之后你**不需要**每次开机都重新执行 `docker run`。你可以使用以下简单命令来控制它：
   ```bash
   # 启动已有的数据库
   sudo docker start mongodb

   # 停止数据库
   sudo docker stop mongodb

   # 重启数据库
   sudo docker restart mongodb
   ```

4. **排查问题（查看数据库日志）**
   如果后续 Node.js 连接不上数据库，你可以直接查看 Docker 容器的运行日志：
   ```bash
   sudo docker logs mongodb
   ```

### 3. 配置环境变量 (可选)

本项目默认会在本机的 `12399` 端口启动，并自动连接至 `mongodb://127.0.0.1:27017/cream-market`。

### 4. 启动应用服务器

服务依赖启动完成后，即可启动后端项目：

```bash

# 直接运行 node
node server.js
```

当你在终端看到 `Cream Market is running at http://localhost:12399` 且带有 `MongoDB connected` 的提示时，代表后端已完全准备就绪。

### 5. 访问系统与测试数据

打开你的浏览器，访问以下地址：

```text
http://localhost:12399
```

> **💡 贴心提示：** 当应用第一次成功连接到全新的数据库时，系统内部的 `utils/seed.js` 脚本会自动往数据库中注入一组预设的演示商品（包含全新数码设备和二手物品）。这样你一打开首页就能立刻看到丰富的内容，直接开始体验搜索、加入购物车和下单等完整业务流程！

## 评分点对应

- 页面输出：EJS 模板渲染商品、购物车、订单等动态页面。
- 页面输入：注册、登录、商品表单、结算表单通过 POST 提交。
- 数据处理：商品、用户、订单使用 MongoDB 完成增删改查。
- 系统开发：在博客系统 CRUD 基础上扩展出完整电商业务流程。
- 创新功能：二手交易专区、搜索筛选、购物车、订单、响应式 UI。

## AI 使用标记

代码相应部分有AI使用标记
