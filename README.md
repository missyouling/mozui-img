# 🌄 MOZUI 图床 (mozui-img)

一个基于 Cloudflare Workers 构建的极简、纯粹、高颜值的 Serverless 代理图床。专为 [NodeImage](https://nodeimage.com/) (NodeSeek 专属图床) 打造，采用 macOS 原生设计语言，为你提供丝滑的图片上传体验。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-Cloudflare_Workers-orange.svg)
![UI](https://img.shields.io/badge/UI-macOS_Style-lightgrey.svg)

## 🚀 在线体验

**体验地址：** https://img.mozuiapp.com

## ✨ 核心特性

本项目遵循 **"大道至简"** 的设计哲学。由于第三方图床通常设有严格的防爬虫策略（如 Cloudflare 5 秒盾、CORS 跨域拦截），本项目去除了冗余的画廊管理功能，将核心 100% 聚焦于 **"极速上传与便捷分发"**，把图片管理权交还给官方控制台。

- **🍏 macOS 级视觉体验**：全局毛玻璃（Glassmorphism）面板、分段控制器导航、右上角原生堆叠式通知横幅（Toast），完美契合 Apple 设计规范
- **⚡ Serverless 极速代理**：完全部署在 Cloudflare Workers，零服务器成本，免维护。底层采用 cURL 级别的请求伪装，无感穿透目标站点的 WAF 拦截
- **🔒 双端安全守护**：
  - **访问鉴权**：内置系统入口密码，防止接口被他人滥用
  - **Token 隔离**：第三方 API Token 支持前台配置并加密存储于本地浏览器 `localStorage`，不会泄露给服务器
- **📊 动态额度监控**：实时拦截并监控上传配额，根据剩余张数自动变换状态色彩（🟢 充足 / 🟡 警告 / 🔴 耗尽），每日 0 点自动重置
- **🔗 一键聚合分发**：上传成功后自动生成并提供 `URL`、`Markdown`、`BBCode`、`HTML` 四种格式的一键复制，发帖/写博客快人一步
- **🖼️ 每日随机壁纸**：背景图接入自建随机图服务，每次刷新都有一份好心情
- **📌 醒目 Favicon**：内置品牌图标（苹果蓝链环），浏览器标签页清晰可辨

## 🔐 登录入口

1. 打开你的 Worker 部署域名
2. 输入系统入口密码登录（密码见下方环境变量配置）

> ⚠️ **强烈建议部署完成后立即修改默认密码**，避免接口被他人滥用。

## 🛠️ 快速部署指南

只需 3 分钟，即可拥有你的私人专属图床。

### 第 1 步：创建 Cloudflare Worker
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 导航至 **Workers & Pages** -> **Overview**
3. 点击 **Create Worker**，起个名字（如 `mozui-img`），然后 **Deploy**
4. 点击 **Edit code**，清空原有代码，将本仓库中的 `worker.js` 全部代码粘贴进去，点击 **Save and deploy**

### 第 2 步：配置环境变量（安全设置）

进入 Worker 管理页面 **Settings** -> **Variables**，添加以下环境变量：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `ADMIN_PWD_DEFAULT` | ✅ | 系统入口登录密码 |
| `NODEIMAGE_API_KEY` | 否 | 默认图床 API Token（推荐留空，直接在前端配置，存于浏览器 localStorage） |

### 第 3 步：初始化系统设置
1. 访问你刚刚部署好的 Worker 域名，输入密码登录
2. 点击右上角 **"系统设置"**，点击 **"前往官方获取 Token"** 跳转至 NodeImage 官方控制台
3. 复制官方分配的专属 API Key，粘贴并 **保存**
4. 尽情享受极速上传吧！

## 🖼️ 随机壁纸 API

系统背景图使用自建随机图服务：`https://random.mozuiapp.com/?day=random`

- 每日更新 Bing 高清壁纸
- 返回 302 重定向到当日壁纸原图
- 前端通过 `?timestamp=` 参数防缓存，每次刷新加载新图

## 📄 许可协议

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE) 开源，允许自由使用、修改和分发，但请保留原作者版权声明。
