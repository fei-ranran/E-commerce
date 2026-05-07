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

## 部署与运行指南

本项目需要 **Node.js** 和 **MongoDB** 才能运行。以下分别提供 Windows 和 Linux/WSL 两种环境的完整部署步骤。

---

### 1. 安装 Node.js

如果你的电脑上还没有安装 Node.js，请前往官网下载并安装：

- **下载地址**：https://nodejs.org/
- 推荐下载 **LTS（长期支持）版本**，按照安装向导默认选项一路安装即可。

安装完成后，打开终端（Windows 用 CMD 或 PowerShell，Linux/WSL 用 bash），验证安装是否成功：

```bash
node -v
npm -v
```

如果能正确显示版本号，说明安装成功。

### 2. 安装项目依赖

在项目根目录下执行：

```bash
# 安装项目中需要用到的所有依赖包 (Express, Mongoose, EJS 等)
npm install
```

### 3. 启动 MongoDB 数据库

项目的所有数据（用户、商品、订单）均存储在 MongoDB 中，**启动项目前必须确保数据库服务已开启**。

请根据你的操作系统选择对应的安装方式：

#### 方式一：Windows 原生安装（推荐 Windows 用户使用）

1. **下载 MongoDB Community Server**
   前往官网下载页面：https://www.mongodb.com/try/download/community
   选择 `Windows` 平台，下载 `.msi` 安装包。

2. **安装 MongoDB**
   运行下载好的 `.msi` 安装包，安装过程中：
   - 选择 **Complete（完整安装）**。
   - **勾选 "Install MongoDB as a Service"**（安装为系统服务），这样 MongoDB 会在你每次开机时自动启动，省去手动操作。
   - 可选：同时勾选安装 **MongoDB Compass**（官方的图形化数据库管理工具，方便查看数据）。

3. **验证 MongoDB 是否在运行**
   安装完成后，打开 CMD 或 PowerShell，执行：
   ```bash
   mongosh
   ```
   如果成功进入 MongoDB Shell（出现 `test>` 提示符），说明数据库已正常运行。输入 `exit` 退出即可。

   > ⚠️ 如果提示 `mongosh 不是内部或外部命令`，说明 MongoDB 的 bin 目录没有被加入系统 PATH。你可以找到安装目录（通常是 `C:\Program Files\MongoDB\Server\7.0\bin`），将其手动添加到系统环境变量的 PATH 中，或者直接使用完整路径运行。

#### 方式二：使用 Docker 运行（推荐 Linux/WSL 用户使用）

如果系统已安装 Docker，使用容器化运行 MongoDB 是最整洁的方法：

1. **拉取并首次运行 MongoDB 容器**
   ```bash
   sudo docker run -d -p 27017:27017 --name mongodb mongo
   ```
   > 参数解释：
   > `-d`: 后台运行。
   > `-p 27017:27017`: 将主机的 27017 端口映射到容器内的 27017 端口。
   > `--name mongodb`: 给这个容器起个名字叫 `mongodb`，方便后续管理。
   > `mongo`: 指定使用的镜像名称。

2. **查看容器运行状态**
   ```bash
   sudo docker ps -a
   ```
   如果一切正常，你会看到列表中包含 `mongodb` 容器，并且 `STATUS` 显示为 `Up`。

3. **日常服务管理**
   创建容器后，之后**不需要**每次都重新执行 `docker run`，只需使用以下命令：
   ```bash
   # 启动已有的数据库
   sudo docker start mongodb

   # 停止数据库
   sudo docker stop mongodb

   # 重启数据库
   sudo docker restart mongodb
   ```

4. **排查问题（查看数据库日志）**
   如果 Node.js 连接不上数据库，可以查看 Docker 容器的运行日志：
   ```bash
   sudo docker logs mongodb
   ```

### 4. 配置环境变量 (可选)

本项目默认会在本机的 `12399` 端口启动，并自动连接至 `mongodb://127.0.0.1:27017/cream-market`。

如果你需要自定义，可以在启动前设置环境变量：
```bash
# Linux/WSL
export PORT=3000
export MONGO_URL=mongodb://127.0.0.1:27017/cream-market

# Windows (CMD)
set PORT=3000
set MONGO_URL=mongodb://127.0.0.1:27017/cream-market
```

### 5. 启动应用服务器

确保 MongoDB 已经在运行后，执行：

```bash
npm start
# 或者直接运行
node server.js
```

当你在终端看到以下两条提示时，代表后端已完全准备就绪：
```
MongoDB connected: mongodb://127.0.0.1:27017/cream-market
Cream Market is running at http://localhost:12399
```

> ⚠️ 如果终端显示 `MongoDB connection failed`，请检查你的 MongoDB 服务是否已经启动（参考第 3 步）。

### 6. 访问系统与测试数据

打开你的浏览器，访问以下地址：

```text
http://localhost:12399
```

> **💡 贴心提示：** 当应用第一次成功连接到全新的数据库时，系统内部的 `utils/seed.js` 脚本会自动往数据库中注入一组预设的演示商品（包含全新数码设备和二手物品）。这样你一打开首页就能立刻看到丰富的内容，直接开始体验搜索、加入购物车和下单等完整业务流程！

## AI 使用标记

代码相应部分有AI使用标记
