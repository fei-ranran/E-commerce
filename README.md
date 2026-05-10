# Cream Market 电商与二手交易平台

> 基于 Node.js + Express + MongoDB + EJS 构建的全栈电商平台，支持商品商城与二手交易功能。

---

## 📖 目录

- [ 项目简介](#项目简介)
- [ 技术栈](#技术栈)
- [ 功能清单](#功能清单)
- [ 目录结构](#目录结构)
- [ 部署与运行指南](#部署与运行指南)
- [ 常见问题排查 (FAQ)](#常见问题排查-faq)
- [ AI 使用标记](#ai-使用标记)

---


## 项目简介

Cream Market 是一个课程项目级别的全功能电商平台，采用经典的 **MVC（Model-View-Controller）** 架构，使用服务端渲染（SSR）技术构建。用户可以在平台上浏览商品、搜索筛选、注册登录、加入购物车、提交订单，同时也支持二手商品的发布与交易。

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 运行环境 | Node.js | JavaScript 服务端运行环境 |
| Web 框架 | Express.js | 轻量级 Node.js Web 框架，处理路由与中间件 |
| 模板引擎 | EJS | 嵌入式 JavaScript 模板，用于服务端渲染 HTML 页面 |
| 数据库 | MongoDB | NoSQL 文档数据库，存储用户、商品、订单等数据 |
| ODM | Mongoose | MongoDB 的对象文档映射库，定义数据模型与校验 |
| 样式 | 原生 CSS | 响应式布局，适配桌面端与移动端 |

## 功能清单

### 核心功能
- **商品商城**：首页展示全部商品、关键词搜索、分类筛选、成色筛选、多维度排序
- **二手交易**：通过 `condition=used` 独立展示二手商品，支持磨损等级标注
- **商品管理**：发布、查看详情、编辑、删除商品（CRUD 完整操作），支持图片上传
- **用户系统**：注册（图形验证码 + 密码强度校验）、登录、退出、账户注销，登录状态通过 Cookie 保存
- **购物车**：加入商品、增减数量、移除商品、清空购物车，库存超限自动拦截
- **订单流程**：填写收货信息、提交订单（库存原子扣减）、确认收货、查看订单详情与状态
- **收藏夹**：收藏/取消收藏商品，降价提醒开关，全局提醒偏好设置
- **后台管理**：超管可任免管理员、删除用户；管理员可配置重复商品检测阈值

### 附加功能
- **商品评论**：支持评分、文字评论、图片/视频上传
- **站内私信**：买家与卖家可通过商品页发起一对一沟通
- **卖家信誉体系**：基于历史评价计算卖家评分、好评率、交易成功率
- **价格历史**：自动记录每次价格变动，商品详情页 Chart.js 可视化趋势图
- **智能推荐**：基于浏览历史、购物车和购买记录，在商品详情页推荐相关商品
- **重复检测**：发布商品时自动检测平台相似商品，防止重复发布
- **降价通知**：收藏商品降价时自动生成系统通知
- **国际化 (i18n)**：支持中文 / English 切换
- **日夜模式**：亮色 / 暗色主题一键切换
- **响应式页面**：原生 CSS Media Queries 适配桌面端与移动端
- **种子数据**：首次启动自动注入演示商品、管理员账号、卖家信誉评价数据

## 目录结构

```text
cream/
├── server.js                  # 应用入口，Express 服务器与数据库连接
├── package.json               # 项目依赖配置与启动脚本
│
├── models/                    # 数据模型层 (Model)
│   ├── User.js                #   用户模型：用户名、邮箱、密码哈希、角色、软删除
│   ├── Product.js             #   商品模型：名称、价格、分类、成色、库存、价格历史
│   ├── Order.js               #   订单模型：收货信息、商品列表、总价、状态、评价窗口
│   ├── Favorite.js            #   收藏模型：用户与商品的关联、降价提醒开关
│   ├── Review.js              #   评价模型：买家对卖家的交易评价
│   ├── Comment.js             #   评论模型：商品评论（支持图文/视频）
│   ├── Message.js             #   消息模型：买卖双方站内私信
│   └── Notification.js        #   通知模型：降价提醒等系统通知
│
├── controllers/               # 控制器层 (Controller)
│   ├── authController.js      #   注册、登录、退出、注销账户
│   ├── productController.js   #   商品 CRUD、评论、私信、推荐
│   ├── cartController.js      #   购物车增删改查
│   ├── orderController.js     #   订单创建、确认收货、交易评价
│   ├── favoriteController.js  #   收藏/取消、降价提醒开关
│   └── adminController.js     #   用户管理、相似度阈值配置
│
├── routes/                    # 路由层
│   ├── index.js               #   首页 /、二手页 /second-hand、消息 /messages
│   ├── auth.js                #   /login、/register、/logout
│   ├── products.js            #   /products/*
│   ├── cart.js                #   /cart/*
│   ├── orders.js              #   /orders/*
│   ├── favorites.js           #   /favorites/*
│   ├── admin.js               #   /admin/*
│   ├── uploads.js             #   文件上传 /uploads
│   └── captcha.js             #   图形验证码 /captcha
│
├── views/                     # 视图层 (View) - EJS 模板
│   ├── home.ejs               #   商城首页
│   ├── second-hand.ejs        #   二手专区
│   ├── 404.ejs / error.ejs    #   错误页面
│   ├── partials/              #   公共组件（页头、页脚、商品卡片等）
│   ├── auth/                  #   登录、注册
│   ├── products/              #   商品详情、发布/编辑、我的发布、私信
│   ├── cart/                  #   购物车
│   ├── orders/                #   订单列表、详情、结算
│   ├── favorites/             #   收藏夹
│   ├── messages/              #   消息收件箱
│   └── admin/                 #   用户管理、相似度设置
│
├── services/                  # 业务服务层
│   ├── sellerReputation.js    #   卖家信誉统计（评分、好评率、成交率）
│   ├── priceDropNotifier.js   #   降价通知（匹配收藏用户并生成通知）
│   ├── productRecommendations.js # 智能推荐（浏览/购物车/购买记录多维召回）
│   └── duplicateProductDetector.js # 重复商品检测（名称/描述/分类/价格相似度）
│
├── middleware/                # 中间件
│   ├── currentUser.js         #   Cookie 解析当前用户，注入 res.locals
│   ├── i18n.js                #   服务端国际化（中文/English）
│   ├── authRequired.js        #   登录保护
│   ├── adminRequired.js       #   管理员/超管权限保护
│   ├── superAdminRequired.js  #   超管专属权限保护
│   └── redirectToLogin.js     #   未登录重定向到登录页
│
├── utils/                     # 工具函数
│   ├── seed.js                #   演示商品种子数据
│   ├── seedUsers.js           #   超管/管理员账号种子
│   ├── seedSellerReputation.js #  卖家信誉评价种子数据
│   ├── productSearch.js       #   高级筛选与排序
│   ├── publishAssist.js       #   发布辅助（分类推荐、标签生成、校验）
│   ├── reviewTextFilter.js    #   敏感词过滤
│   ├── browseHistory.js       #   浏览历史 Cookie 管理
│   ├── runtimeConfigStore.js  #   运行时配置持久化
│   ├── recommendCache.js      #   推荐结果缓存（内存/Redis）
│   ├── migrateProductCompat.js #  商品文档兼容迁移
│   └── migrateOrderCompat.js  #   订单文档兼容迁移
│
├── config/
│   └── i18n.json              #   中英文翻译字典
│
├── data/
│   └── runtime-config.json    #   运行时配置（相似度阈值等）
│
└── public/                    # 静态资源
    ├── css/style.css          #   样式表（含日夜模式变量）
    ├── js/                    #   前端脚本（收藏/图表/评论/主题等）
    ├── images/                #   商品默认图 SVG
    └── uploads/               #   用户上传文件
```

## 部署与运行指南

本项目需要 **Node.js** 和 **MongoDB** 才能运行。以下分别提供 **Windows** 和 **Linux/WSL** 两种环境的完整部署步骤。

> 💡 **快速概览**：整个部署过程分为 6 步：安装 Node.js → 安装依赖 → 启动 MongoDB → 配置环境变量（可选）→ 启动服务器 → 打开浏览器访问。

---

### 第 1 步：安装 Node.js

Node.js 是本项目的运行环境，必须先安装它才能运行项目代码。

#### Windows 用户

1. 打开 Node.js 官网：https://nodejs.org/
2. 点击下载 **LTS（长期支持）版本**（页面上较大的绿色按钮）。
3. 双击下载好的 `.msi` 安装包，按照默认选项一路点击 **Next** 直到安装完成。
4. 安装完成后，打开 **CMD**（按 `Win + R`，输入 `cmd`，回车）或 **PowerShell**，输入以下命令验证：
   ```bash
   node -v
   npm -v
   ```
   如果分别显示了版本号（如 `v20.x.x` 和 `10.x.x`），说明安装成功。

#### Linux / WSL 用户

如果你使用的是 Ubuntu/Debian 系统，可以通过以下命令安装：
```bash
# 使用 NodeSource 安装最新 LTS 版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

---

### 第 2 步：安装项目依赖

打开终端，进入项目根目录，执行以下命令安装所有依赖包：

```bash
npm install
```

> 📌 这条命令会根据 `package.json` 文件自动下载并安装 Express、Mongoose、EJS 等所有必要的第三方库到 `node_modules/` 目录下。如果你看到终端输出了一堆包名和版本号，最后没有报错（没有 `ERR!` 字样），就说明安装成功了。

---

### 第 3 步：启动 MongoDB 数据库

项目的所有数据（用户账号、商品信息、订单记录）均存储在 MongoDB 数据库中。**在启动项目之前，必须确保 MongoDB 服务已经在运行**，否则你会在终端看到 `MongoDB connection failed` 的错误。

请根据你的操作系统选择对应的安装方式：

#### 方式一：Windows 原生安装（推荐 Windows 用户使用）

##### 1. 下载 MongoDB

前往 MongoDB 官方下载页面：
 https://www.mongodb.com/try/download/community

- **Version**：选择最新版本即可
- **Platform**：选择 `Windows`
- **Package**：选择 `msi`
- 点击 **Download** 下载

##### 2. 安装 MongoDB

双击下载好的 `.msi` 安装包：

1. 点击 **Next**，接受许可协议。
2. 选择 **Complete（完整安装）**。
3. **重要**：在 "Service Configuration" 页面中，确保勾选了 **"Install MongoDB as a Service"**。
   - 这会把 MongoDB 注册为 Windows 系统服务，**每次开机都会自动启动**，你不需要手动操作。
   - 保持默认的 "Run service as Network Service user" 即可。
4. 在下一页中，可以选择是否安装 **MongoDB Compass**（一个图形化的数据库管理工具，可以直观地查看和操作数据库中的数据）。**建议勾选安装**，对调试和学习都很有帮助。
5. 继续点击 **Next** → **Install** → 等待安装完成 → **Finish**。

##### 3. 验证 MongoDB 是否正在运行

安装完成后，MongoDB 应该已经在后台自动运行了。打开 **CMD** 或 **PowerShell**，输入：

```bash
mongosh
```

如果你看到类似以下内容，说明 MongoDB 已经在正常运行：
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/...
Using MongoDB: 7.x.x
...
test>
```

输入 `exit` 即可退出 MongoDB Shell。

> **如果提示 `mongosh 不是内部或外部命令`**：
>
> 这说明 MongoDB 的程序目录没有被添加到系统的 PATH 环境变量中。解决方法：
> 1. 找到 MongoDB 的安装目录，通常是 `C:\Program Files\MongoDB\Server\7.0\bin`
> 2. 右键 "此电脑" → "属性" → "高级系统设置" → "环境变量"
> 3. 在 "系统变量" 中找到 `Path`，双击编辑
> 4. 点击 "新建"，粘贴上面的路径
> 5. 一路点击 "确定" 保存
> 6. **重新打开** CMD 或 PowerShell，再次输入 `mongosh` 验证

> ⚠️ **如果 `mongosh` 能打开但提示连接失败**：
>
> 说明 MongoDB 服务没有在运行。按 `Win + R`，输入 `services.msc`，在服务列表中找到 **MongoDB Server**，右键点击 → **启动**。

---

#### 方式二：使用 Docker 运行（推荐 Linux/WSL 用户使用）

Docker 是一种容器化技术，可以让你在不污染系统环境的情况下快速运行 MongoDB。

##### 2-1. 安装 Docker

如果你的 Linux/WSL 系统还没有安装 Docker，请按以下步骤操作：

```bash
# 更新系统软件包列表
sudo apt update

# 安装 Docker
sudo apt install -y docker.io
```

##### 2-2. 启动 Docker 服务 & 修复 iptables（WSL 用户必做）

> **这一步仅 WSL 用户需要执行**。如果你是原生 Linux 系统，可以跳过 iptables 部分，直接启动 Docker。

WSL 默认使用的 `iptables-nft` 与 Docker 不兼容，需要先切换为 `iptables-legacy`：

```bash
sudo update-alternatives --config iptables
```

系统会显示类似以下选项：
```
There are 2 choices for the alternative iptables (providing /usr/sbin/iptables).

  Selection    Path                       Priority   Status
------------------------------------------------------------
* 0            /usr/sbin/iptables-nft      20        auto mode
  1            /usr/sbin/iptables-legacy   10        manual mode
  2            /usr/sbin/iptables-nft      20        manual mode
```

**输入 `1` 并回车**，选择 `/usr/sbin/iptables-legacy`。

然后启动 Docker 服务：

```bash
# 启动 Docker
sudo service docker start

# 确认 Docker 正在运行
sudo service docker status
```

你应该看到输出：**`Docker is running.`**

> 如果显示 `Docker is not running`，请检查是否完成了上面的 iptables 切换，然后重新执行 `sudo service docker start`。

##### 2-3. 创建并启动 MongoDB 容器

**方法一：直接拉取（先试这个）**

```bash
sudo docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

如果命令执行后能正常下载镜像并启动容器，就说明成功了，可以直接跳到 **2-4. 验证 MongoDB 容器状态**。

**方法二：配置镜像加速后再拉取（方法一失败时使用）**

如果方法一执行时出现类似以下报错，说明你的网络无法直接访问 Docker Hub：
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": net/http: request canceled
```

这时需要先配置国内镜像加速源，然后重新拉取：

```bash
# 第一步：写入镜像加速配置
sudo tee /etc/docker/daemon.json << 'EOF'
{
    "registry-mirrors": 
    [
        "https://docker-0.unsee.tech",
        "https://docker-cf.registry.cyou",
        "https://docker.1panel.live"
    ]
}
EOF

# 第二步：重启 Docker 使配置生效
sudo service docker restart

# 第三步：重新创建 MongoDB 容器
sudo docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

> 如果方法一已经创建了一个失败的容器，需要先删除它再重新创建：
> ```bash
> sudo docker rm mongodb
> sudo docker run -d -p 27017:27017 --name mongodb mongo:7.0
> ```
##### 2-4. 验证 MongoDB 容器状态

```bash
# 查看所有容器（包括已停止的）
sudo docker ps -a
```

你应该能看到 `mongodb` 容器，且 `STATUS` 显示为 `Up`：
```
CONTAINER ID   IMAGE       COMMAND                  STATUS        NAMES
a1b2c3d4e5f6   mongo:7.0   "docker-entrypoint.s…"   Up 2 hours    mongodb
```

查看容器日志（排查问题时使用）：
```bash
sudo docker logs mongodb
```

##### 2-5. 日常容器管理

容器创建好之后，以后**不需要**每次都重新执行 `docker run`。日常只需使用以下命令：

```bash
# 启动已有的数据库容器（比如重启电脑后）
sudo docker start mongodb

# 停止数据库
sudo docker stop mongodb

# 重启数据库
sudo docker restart mongodb

# 删除容器（慎用！会丢失数据库中的所有数据）
sudo docker rm mongodb
```

##### 2-6. 测试 MongoDB 连接（可选）

```bash
sudo docker exec -it mongodb mongosh
```


如果成功进入 MongoDB Shell（出现 `test>` 提示符），说明数据库运行正常。输入 `exit` 退出。

---




### 第 4 步：启动应用服务器

确保 MongoDB 已经在运行后（参考第 3 步），在项目根目录下执行：

```bash
npm start
```

或者直接运行：

```bash
node server.js
# 或者运行npm
npm start
```

**启动成功**时，你会在终端看到以下两条关键提示：
```
MongoDB connected: mongodb://127.0.0.1:27017/cream-market
Cream Market is running at http://localhost:12399
```

> ⚠️ **如果终端显示 `MongoDB connection failed`**：
> - 请确认 MongoDB 服务是否已启动（参考第 3 步）
> - Windows 用户：按 `Win + R` → 输入 `services.msc` → 找到 MongoDB Server → 右键启动
> - Docker 用户：执行 `sudo docker start mongodb`

> ⚠️ **如果终端什么都不输出就卡住了**：
> - 请等待几秒钟，可能是 MongoDB 正在建立连接
> - 如果超过 10 秒没有任何输出，按 `Ctrl + C` 终止，检查 MongoDB 状态后重新启动

---

### 第 5 步：访问系统

打开Chrome浏览器，在地址栏输入：

```
http://localhost:12399
```

回车后你应该能看到 Cream Market 的首页，页面上会展示预设的商品数据。

> **💡 关于演示数据：** 当应用第一次成功连接到全新的数据库时，系统内部的 `utils/seed.js` 脚本会自动注入一组预设的演示商品（包含全新数码设备和二手物品）。这样你一打开首页就能立刻看到丰富的内容，直接开始体验搜索、加入购物车和下单等完整业务流程！

---

## 常见问题排查 (FAQ)

### Q: 浏览器提示 "拒绝连接" / "无法访问此网站"

**可能原因与解决方案**：
1. **服务器没有启动**：确认终端中已执行 `node server.js` 且没有报错。
2. **MongoDB 没有启动**：服务器虽然在运行，但数据库连接失败了。检查终端是否有 `MongoDB connection failed` 提示。
3. **WSL2 网络问题**（仅 WSL 用户）：如果你在 WSL2 中运行服务器，但在 Windows 浏览器中访问，可能是 IPv4/IPv6 协议不匹配的问题，项目已通过 `app.listen(PORT, '0.0.0.0')` 修复了此问题。

### Q: 终端报错 "Error: listen EADDRINUSE: address already in use 0.0.0.0:12399"

**说明 12399 端口已经被其他程序占用了**（通常是因为你之前启动了一个服务器还没关闭，或者刚才的进程卡死了）。

**解决方案：**

**方法一：杀死占用端口的进程**
- **Windows (CMD/PowerShell)**: 
  1. 输入 `netstat -ano | findstr :12399` 找到最后一列的数字（PID）。
  2. 输入 `taskkill /F /PID <PID数字>`（把 `<PID数字>` 替换为刚才找到的数字）。
- **Linux / WSL**: 
  1. 输入 `sudo lsof -i :12399` 找到 PID 列对应的数字。
  2. 输入 `sudo kill -9 <PID数字>`。

**方法二：修改项目启动端口**
打开 `server.js`，修改第 25 行：
```javascript
const PORT = process.env.PORT || 12399; // 把 12399 改成其他数字，如 12400
```


### Q: 终端显示 "MongoDB connection failed"

**说明 MongoDB 数据库没有在运行**，请根据你的安装方式进行排查：
- **Windows 原生安装**：打开 "服务" 管理器（`Win + R` → `services.msc`），找到 **MongoDB Server**，确认状态为"正在运行"。如果已停止，右键点击"启动"。
- **Docker 安装**：执行 `sudo docker ps -a` 查看容器状态，如果 STATUS 是 `Exited`，执行 `sudo docker start mongodb` 启动。

### Q: 终端显示 "Command aggregate requires authentication"

**说明你的 MongoDB 开启了密码认证**（比如之前做其他作业时创建了带 `--auth` 的容器），但本项目默认是无密码连接的。

有两种解决方法：

**方法一：重新创建一个不带认证的 MongoDB 容器（推荐）**

```bash
# 停掉旧容器
sudo docker stop mongodb

# 删除旧容器
sudo docker rm mongodb

# 创建新的无认证容器
sudo docker run -d -p 27017:27017 --name mongodb mongo:7.0

# 重新启动项目
node server.js
```

**方法二：设置环境变量让项目带密码连接**

如果你不想删掉原来的容器（里面可能有其他作业的数据），可以在启动项目前设置用户名和密码（请将 yourname 和 yourpass 替换为你自己的账号密码）：

**如果你使用 Linux / WSL / Mac：**
```bash
export MONGO_USER=yourname
export MONGO_PASS=yourpass
node server.js
```

**如果你使用 Windows CMD：**
```cmd
set MONGO_USER=yourname
set MONGO_PASS=yourpass
node server.js
```

**如果你使用 Windows PowerShell：**
```powershell
$env:MONGO_USER="yourname"
$env:MONGO_PASS="yourpass"
node server.js
```

### Q: 首页打开后看不到任何商品

这通常意味着数据库连接虽然成功，但种子数据没有正确插入。你可以：
1. 关闭服务器（`Ctrl + C`）
2. 清空数据库后重新启动（参考下方"重置数据库"）
3. 重新运行 `node server.js`，观察终端是否输出 `Sample products inserted.`

### Q: 如何重置数据库？

如果你需要清空所有数据（用户、商品、订单等）并恢复到初始状态：

```bash
# Docker 用户
sudo docker exec -it mongodb mongosh cream-market --eval "db.dropDatabase()"

# Windows 原生安装用户
mongosh cream-market --eval "db.dropDatabase()"
```

然后重新启动 `node server.js`，种子数据会自动重新注入。

---

## AI 使用标记

代码相应部分有 AI 使用标记。



