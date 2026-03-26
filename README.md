# 🌄 MOZUI 图床 (mozui-img)

一个基于 Cloudflare Workers 构建的极简、纯粹、高颜值的 Serverless 代理图床。专为 [NodeImage](https://nodeimage.com/) (NodeSeek 专属图床) 打造，采用 macOS 原生设计语言，为你提供丝滑的图片上传体验。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-Cloudflare_Workers-orange.svg)
![UI](https://img.shields.io/badge/UI-macOS_Style-lightgrey.svg)

## ✨ 设计理念与核心特性

本项目遵循 **“大道至简”** 的设计哲学。由于第三方图床通常设有严格的防爬虫策略（如 Cloudflare 5秒盾、CORS 跨域拦截），本项目去除了冗余的画廊管理功能，将核心 100% 聚焦于 **“极速上传与便捷分发”**，把图片管理权交还给官方控制台。

* **🍏 macOS 级视觉体验**：全局毛玻璃（Glassmorphism）面板、分段控制器导航、右上角原生的堆叠式通知横幅（Toast），完美契合 Apple 设计规范。
* **⚡ Serverless 极速代理**：完全部署在 Cloudflare Workers，零服务器成本，免维护。底层采用 cURL 级别的请求伪装，无感穿透目标站点的 WAF 拦截。
* **🔒 双端安全守护**：
    * **访问鉴权**：内置系统入口密码，防止接口被他人滥用。
    * **Token 隔离**：第三方 API Token 支持前台配置并加密存储于本地浏览器 `localStorage`，不会泄露给服务器。
* **📊 动态额度监控**：实时拦截并监控上传配额，根据剩余张数自动变换状态色彩（🟢 充足 / 🟡 警告 / 🔴 耗尽），每日 0 点自动重置。
* **🔗 一键聚合分发**：上传成功后自动生成并提供 `URL`、`Markdown`、`BBCode`、`HTML` 四种格式的一键复制，发帖/写博客快人一步。
* **🖼️ 每日随机壁纸**：接入高质量 Bing 随机壁纸 API，每次刷新都有一份好心情。

## 🛠️ 快速部署指南

只需 3 分钟，即可拥有你的私人专属图床。

### 第 1 步：创建 Cloudflare Worker
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 导航至左侧的 **Workers & Pages** -> **Overview**。
3. 点击 **Create Worker**，随便起个名字（如 `mozui-img`），然后点击 **Deploy**。
4. 点击 **Edit code**，清空原有代码，将本仓库中的 `worker.js` 代码全部粘贴进去，点击 **Save and deploy**。

### 第 2 步：配置环境变量 (安全设置)
为了保护你的图床入口，需要设置一个管理员密码：
1. 返回该 Worker 的管理页面，进入 **Settings** -> **Variables**。
2. 在 **Environment Variables** (环境变量) 中添加以下键值对：
   * `ADMIN_PWD_DEFAULT` : 你的专属登录密码（必填，例如 `mysecret888`）。
   * `NODEIMAGE_API_KEY` : （选填）默认的图床 API Token。推荐留空，直接在前端配置。
3. 保存后重新部署（或系统会自动应用）。

### 第 3 步：初始化系统设置
1. 访问你刚刚部署好的 Worker 域名。
2. 输入你在上一步设置的密码进行登录。
3. 点击右上角的 **“系统设置”**，点击 **“前往官方获取 Token”** 跳转至 NodeImage 官方控制台。
4. 复制官方分配给你的专属 API Key，回到我们的系统设置中粘贴并 **保存**。
5. 尽情享受极速上传吧！

## 📄 许可协议

本项目基于 [MIT License](https://www.google.com/search?q=LICENSE) 开源，允许自由使用、修改和分发，但请保留原作者版权声明。