/**
 * MOZUI Image - macOS 风格 Serverless 代理图床 (UI 视觉优化最终版)
 * 部署方式：粘贴到 Cloudflare Worker -> 部署完成！
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const ADMIN_PWD = (env.ADMIN_PWD_DEFAULT || "admin888*").trim();
    const ENV_API_KEY = (env.NODEIMAGE_API_KEY || "").trim();

    if (method === 'GET' && path === '/') {
      return new Response(renderIndexHtml(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path.startsWith('/api/')) {
      const clientPwd = decodeURIComponent(request.headers.get('X-Mozui-Pwd') || '').trim();
      
      if (clientPwd !== ADMIN_PWD) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', 'X-Mozui-Auth': 'Failed' } 
        });
      }

      if (method === 'GET' && path === '/api/verify') {
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      const clientApiKey = decodeURIComponent(request.headers.get('X-NodeImage-Key') || '').trim();
      const API_KEY = clientApiKey || ENV_API_KEY;

      const apiHeaders = {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'curl/7.81.0',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };

      if (method === 'POST' && path === '/api/upload') {
        try {
          const proxyReq = new Request('https://api.nodeimage.com/api/upload', {
            method: 'POST',
            headers: { 
              ...apiHeaders,
              'Content-Type': request.headers.get('Content-Type') 
            },
            body: request.body,
            duplex: 'half' 
          });
          
          const response = await fetch(proxyReq);
          const respText = await response.text(); 
          return new Response(respText, { status: response.status, headers: { 'Content-Type': 'application/json' } });
        } catch (err) {
          return new Response(JSON.stringify({ error: "代理通道异常: " + err.message }), { status: 500 });
        }
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

// ==========================================
// 🎨 前端 UI (修复导航栏在暗色壁纸下的可见性)
// ==========================================
function renderIndexHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MOZUI 图床</title>
  <style>
    :root { --app-text: #1D1D1F; --app-secondary-text: #86868B; --apple-blue: #007AFF; --apple-blue-hover: #0062CC; --border-color: rgba(0, 0, 0, 0.1); --border-radius: 20px; }
    body { font-family: -apple-system, "SF Pro Display", sans-serif; margin: 0; padding: 0; color: var(--app-text); min-height: 100vh; display: flex; flex-direction: column; align-items: center; background-image: url('https://bing.img.run/rand.php'); background-size: cover; background-position: center; background-attachment: fixed; overflow-x: hidden; }
    
    /* 🏆 修复：导航栏换成白色毛玻璃底，确保在任何随机壁纸下文字都清晰可见 */
    .nav { margin-top: 40px; display: inline-flex; background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(30px) saturate(180%); -webkit-backdrop-filter: blur(30px) saturate(180%); padding: 5px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8); z-index: 10; border: 0.5px solid rgba(255,255,255,0.5); }
    .nav-tab { padding: 6px 24px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); color: #1D1D1F; opacity: 0.6; }
    .nav-tab.active { background: #fff; opacity: 1; box-shadow: 0 2px 6px rgba(0,0,0,0.08); color: var(--apple-blue); }

    .container { width: 100%; max-width: 720px; padding: 20px; box-sizing: border-box; flex: 1; display: flex; flex-direction: column; }
    .glass-panel { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%); padding: 40px; border-radius: var(--border-radius); border: 0.5px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); width: 100%; box-sizing: border-box; position: relative; overflow: hidden; min-height: 300px; }
    
    h1 { font-size: 32px; font-weight: 700; margin: 0 0 24px 0; letter-spacing: -0.02em; text-align: center; color: var(--app-text); }

    .tab-content { display: none; animation: fadeIn 0.2s ease; }
    .tab-content.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    #loginUI { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0; }
    .input-base { width: 100%; max-width: 260px; font-size: 13px; padding: 8px 12px; border: 0.5px solid var(--border-color); border-radius: 8px; background: rgba(255, 255, 255, 0.8); outline: none; transition: all 0.2s; margin-bottom: 16px; box-sizing: border-box; text-align: center; font-family: -apple-system, sans-serif; }
    .input-base:focus { border-color: var(--apple-blue); box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2); background: #fff; }
    
    .btn-base { padding: 6px 16px; font-size: 13px; font-weight: 500; border-radius: 6px; border: 0.5px solid rgba(0,0,0,0.05); background: var(--apple-blue); color: white; cursor: pointer; transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); letter-spacing: 0.2px; }
    .btn-base:hover { background: var(--apple-blue-hover); }
    .btn-base:active { transform: scale(0.97); }
    .btn-base:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .btn-secondary { background: #E5E5EA; color: #1D1D1F; border: 0.5px solid rgba(0,0,0,0.05); box-shadow: none; }
    .btn-secondary:hover { background: #D1D1D6; }

    .drop-zone { border: 2px dashed rgba(0,0,0,0.1); border-radius: 12px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
    .drop-zone:hover, .drop-zone.dragover { border-color: var(--apple-blue); background: rgba(0,122,255,0.05); }
    .drop-zone svg { width: 40px; height: 40px; stroke: var(--app-secondary-text); opacity: 0.7; }
    
    .limit-warning { font-size: 12px; font-weight: 500; margin-top: 4px; padding: 4px 12px; border-radius: 6px; transition: all 0.3s ease; }
    .quota-green { color: #34C759; background: rgba(52, 199, 89, 0.1); }
    .quota-yellow { color: #FF9F0A; background: rgba(255, 159, 10, 0.1); }
    .quota-red { color: #FF3B30; background: rgba(255, 59, 48, 0.1); }
    
    .preview-container { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 15px; width: 100%; }
    .preview-item { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; box-shadow: 0 1px 4px rgba(0,0,0,0.1); border: 0.5px solid rgba(0,0,0,0.05); }
    
    .result-box { display: none; margin-top: 20px; background: rgba(255,255,255,0.6); padding: 16px; border-radius: 12px; border: 0.5px solid rgba(0,0,0,0.05); }
    .bulk-actions { display: inline-flex; background: rgba(0,0,0,0.06); padding: 3px; border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; gap: 2px;}
    .btn-bulk { background: transparent; border: none; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 6px; cursor: pointer; color: #1D1D1F; transition: all 0.15s; }
    .btn-bulk:hover { background: rgba(0,0,0,0.05); }
    .btn-bulk:active { background: rgba(255,255,255,0.8); box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    
    .result-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding-right: 5px; }
    .result-list::-webkit-scrollbar { width: 6px; }
    .result-list::-webkit-scrollbar-track { background: transparent; }
    .result-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
    
    .result-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.9); padding: 8px 12px; border-radius: 10px; border: 0.5px solid rgba(0,0,0,0.05); box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .result-item img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 0.5px solid rgba(0,0,0,0.05); cursor: pointer; }
    .result-item-content { flex: 1; min-width: 0; }
    .result-item-url { font-size: 12px; color: var(--app-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; font-family: monospace; }
    .result-item-actions { display: flex; gap: 4px; }
    .result-item-actions .btn-secondary { padding: 2px 8px; font-size: 11px; }

    .settings-group { background: rgba(255,255,255,0.8); border-radius: 10px; border: 0.5px solid rgba(0,0,0,0.1); overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.02); margin-bottom: 20px; }
    .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.05); }
    .settings-row:last-child { border-bottom: none; }
    .settings-label { font-weight: 500; font-size: 13px; color: var(--app-text); }
    .settings-input { border: 0.5px solid rgba(0,0,0,0.15); border-radius: 6px; padding: 4px 8px; font-size: 13px; width: 200px; outline: none; background: #fff; font-family: monospace; }
    .settings-input:focus { border-color: var(--apple-blue); box-shadow: 0 0 0 3px rgba(0,122,255,0.2); }

    .footer { margin-top: 24px; margin-bottom: 30px; text-align: center; font-size: 13px; color: rgba(255, 255, 255, 0.9); text-shadow: 0 1px 5px rgba(0,0,0,0.5); font-weight: 500; z-index: 1; }
    .footer a { color: #fff; text-decoration: none; transition: opacity 0.2s; }
    .footer a:hover { opacity: 0.8; text-decoration: underline; }

    #toastRoot { position: fixed; top: 100px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; pointer-events: none; }
    .toast-message { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(30px) saturate(180%); border: 0.5px solid rgba(0,0,0,0.1); box-shadow: 0 4px 14px rgba(0,0,0,0.1); border-radius: 10px; padding: 10px 16px; font-size: 13px; font-weight: 500; color: #1D1D1F; display: flex; align-items: center; animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; max-width: 300px; word-break: break-all; pointer-events: auto;}
    .toast-message.hide { animation: slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }

  </style>
</head>
<body>
  <div id="toastRoot"></div>
  
  <div class="nav" id="mainNav" style="display:none;">
    <div class="nav-tab active" onclick="switchTab('upload')">上传图片</div>
    <div class="nav-tab" onclick="switchTab('settings'); loadSettings();">系统设置</div>
  </div>

  <div class="container">
    <div class="glass-panel">
      
      <h1>MOZUI 图床</h1>
      
      <div id="loginUI">
        <h2 style="margin:0 0 6px 0; font-size: 16px; font-weight: 600;">安全认证</h2>
        <p style="color:#86868B; margin-bottom:20px; font-size: 13px;">请输入您的管理员密码以继续</p>
        <input type="password" id="pwdInput" class="input-base" placeholder="密码" onkeydown="if(event.key==='Enter') login()">
        <button class="btn-base" onclick="login()">登录</button>
      </div>

      <div id="uploadUI" class="tab-content">
        <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" onchange="handleFileSelect(event)">
        <div class="drop-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
          <svg id="dropIcon" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div id="dropText" style="font-weight:500; font-size:14px; color: var(--app-text);">点击或拖拽图片</div>
          <div id="dropSubText" style="font-size:12px; color:#86868B;">支持 JPG, PNG, GIF, WebP</div>
          <div id="dropWarning" class="limit-warning quota-green">加载额度中...</div>
          <div id="previewContainer" class="preview-container"></div>
        </div>
        <div style="text-align:right;">
          <button class="btn-base" id="uploadBtn" style="display:none;" onclick="uploadFiles()">上传</button>
        </div>

        <div class="result-box" id="resultBox">
          <div class="bulk-actions">
            <button class="btn-bulk" onclick="copyBulk('url')">URL</button>
            <button class="btn-bulk" onclick="copyBulk('md')">Markdown</button>
            <button class="btn-bulk" onclick="copyBulk('bb')">BBCode</button>
            <button class="btn-bulk" onclick="copyBulk('html')">HTML</button>
          </div>
          <div class="result-list" id="resultList"></div>
        </div>
      </div>

      <div id="settingsUI" class="tab-content">
        <div class="settings-group">
          <div class="settings-row">
            <span class="settings-label">API Token</span>
            <input type="text" id="apiTokenInput" class="settings-input" placeholder="默认使用系统变量">
          </div>
        </div>
        <p style="color:#86868B; font-size: 12px; margin-top:-10px; margin-bottom: 20px;">配置将加密保存在本地浏览器缓存中，优先于后端配置生效。</p>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn-base btn-secondary" onclick="window.open('https://www.nodeimage.com/', '_blank')">获取 Token</button>
          <button class="btn-base" onclick="saveSettings()">保存</button>
        </div>
      </div>

    </div>
    
    <div class="footer">
      MOZUI 图床 | GitHub: <a href="https://github.com/missyouling/mozui-img" target="_blank">missyouling/mozui-img</a>
    </div>
  </div>

  <script>
    let selectedFiles = []; 
    let uploadedUrls = []; 

    function showToast(msg) {
      const root = document.getElementById('toastRoot');
      const toast = document.createElement('div');
      toast.className = 'toast-message';
      toast.innerHTML = msg;
      root.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
      }, 3500); 
    }

    function initQuota() {
      const d = new Date();
      const today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      const savedDate = localStorage.getItem('mozui_img_quota_date');
      if (savedDate !== today) {
        localStorage.setItem('mozui_img_quota_date', today);
        localStorage.setItem('mozui_img_quota_left', '100');
      }
      updateQuotaUI();
    }

    function updateQuotaUI() {
      const left = parseInt(localStorage.getItem('mozui_img_quota_left') || '100');
      const el = document.getElementById('dropWarning');
      if(!el) return;
      el.classList.remove('quota-green', 'quota-yellow', 'quota-red');
      if (left >= 50) {
        el.classList.add('quota-green');
        el.innerHTML = \`剩 \${left} 张\`;
      } else if (left >= 20) {
        el.classList.add('quota-yellow');
        el.innerHTML = \`剩 \${left} 张\`;
      } else if (left > 0) {
        el.classList.add('quota-red');
        el.innerHTML = \`仅剩 \${left} 张\`;
      } else {
        el.classList.add('quota-red');
        el.innerHTML = \`额度耗尽\`;
      }
    }

    function consumeQuota() {
      let left = parseInt(localStorage.getItem('mozui_img_quota_left') || '100');
      left = Math.max(0, left - 1);
      localStorage.setItem('mozui_img_quota_left', left);
      updateQuotaUI();
    }

    function findUrlInJson(obj) {
      let possibleUrl = '';
      function search(o) {
        if (possibleUrl || typeof o !== 'object' || o === null) return;
        for (let k in o) {
          const val = o[k];
          if (typeof val === 'string' && val.startsWith('http') && 
              (k.toLowerCase().includes('url') || k.toLowerCase().includes('link') || k.toLowerCase().includes('src') || 
               k.toLowerCase() === 'data' || k.toLowerCase() === 'file' || k.toLowerCase() === 'path' || k.toLowerCase() === 'image')) {
            possibleUrl = val;
            return;
          }
          if (typeof val === 'object') search(val);
        }
      }
      search(obj);
      return possibleUrl;
    }

    function getPwd() { return localStorage.getItem('mozui_img_pwd') || ''; }
    function getApiToken() { return localStorage.getItem('mozui_img_api_key') || ''; }
    
    async function apiFetch(path, options = {}) {
      if(!options.headers) options.headers = {};
      options.headers['X-Mozui-Pwd'] = encodeURIComponent(getPwd());
      const customToken = getApiToken();
      if (customToken) options.headers['X-NodeImage-Key'] = encodeURIComponent(customToken);

      const res = await fetch(path, options);
      if (res.headers.get('X-Mozui-Auth') === 'Failed') {
        localStorage.removeItem('mozui_img_pwd');
        document.getElementById('loginUI').style.display = 'flex';
        document.getElementById('uploadUI').classList.remove('active');
        document.getElementById('settingsUI').classList.remove('active');
        document.getElementById('mainNav').style.display = 'none';
        showToast('🔒 密码错误');
        throw new Error('Unauthorized');
      }
      return res;
    }

    function login() {
      const pwd = document.getElementById('pwdInput').value.trim();
      if(!pwd) return showToast('⚠️ 请输入密码');
      localStorage.setItem('mozui_img_pwd', pwd);
      apiFetch('/api/verify').then(res => {
        showToast('✅ 登录成功');
        document.getElementById('loginUI').style.display = 'none';
        document.getElementById('mainNav').style.display = 'inline-flex';
        initQuota(); 
        switchTab('upload');
      }).catch(e => {});
    }

    window.onload = () => {
      if(getPwd()) {
        document.getElementById('loginUI').style.display = 'none';
        document.getElementById('mainNav').style.display = 'inline-flex';
        initQuota(); 
        switchTab('upload');
      }
    };

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId + 'UI').classList.add('active');
      const targetTab = document.querySelector('.nav-tab[onclick*="' + tabId + '"]');
      if (targetTab) targetTab.classList.add('active');
    }

    function loadSettings() { document.getElementById('apiTokenInput').value = getApiToken(); }

    function saveSettings() {
      const token = document.getElementById('apiTokenInput').value.trim();
      localStorage.setItem('mozui_img_api_key', token);
      showToast('✅ 保存成功');
    }

    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover')); 
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault(); dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    });

    function handleFileSelect(e) { if(e.target.files.length > 0) processFiles(e.target.files); }
    
    function processFiles(files) {
      selectedFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if(selectedFiles.length === 0) return showToast('⚠️ 请选择图片文件');
      
      const container = document.getElementById('previewContainer');
      container.innerHTML = ''; 
      
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'preview-item';
          container.appendChild(img);
        };
        reader.readAsDataURL(file);
      });

      document.getElementById('dropIcon').style.display = 'none';
      document.getElementById('dropText').style.display = 'none';
      document.getElementById('dropSubText').style.display = 'none';
      document.getElementById('uploadBtn').style.display = 'inline-flex';
      document.getElementById('resultBox').style.display = 'none';
    }

    function copyCard(url, type) {
      let txt = url;
      if (type === 'md') txt = \`![](\${url})\`;
      if (type === 'bb') txt = \`[img]\${url}[/img]\`;
      if (type === 'html') txt = \`<img src="\${url}" />\`;
      navigator.clipboard.writeText(txt).then(() => showToast('✅ 复制成功'));
    }

    function copyBulk(type) {
      if(uploadedUrls.length === 0) return;
      let txt = '';
      uploadedUrls.forEach(url => {
        if(type === 'url') txt += url + '\\n';
        if(type === 'md') txt += \`![](\${url})\\n\`;
        if(type === 'bb') txt += \`[img]\${url}[/img]\\n\`;
        if(type === 'html') txt += \`<img src="\${url}" />\\n\`;
      });
      navigator.clipboard.writeText(txt).then(() => showToast('✅ 批量复制成功'));
    }

    function renderResultList() {
      const listDiv = document.getElementById('resultList');
      listDiv.innerHTML = uploadedUrls.map(url => \`
        <div class="result-item">
          <img src="\${url}" loading="lazy" onclick="window.open('\${url}')">
          <div class="result-item-content">
            <div class="result-item-url">\${url}</div>
            <div class="result-item-actions">
              <button class="btn-base btn-secondary" onclick="copyCard('\${url}', 'url')">URL</button>
              <button class="action-btn" style="padding: 2px 8px; font-size: 11px; margin-left: 4px;" onclick="copyCard('\${url}', 'md')">MD</button>
              <button class="action-btn" style="padding: 2px 8px; font-size: 11px; margin-left: 4px;" onclick="copyCard('\${url}', 'bb')">BB</button>
              <button class="action-btn" style="padding: 2px 8px; font-size: 11px; margin-left: 4px;" onclick="copyCard('\${url}', 'html')">HTML</button>
            </div>
          </div>
        </div>
      \`).join('');
      document.getElementById('resultBox').style.display = 'block';
    }

    async function uploadFiles() {
      if(selectedFiles.length === 0) return;

      const left = parseInt(localStorage.getItem('mozui_img_quota_left') || '100');
      if (left <= 0) return showToast('🛑 额度耗尽，请配置 Token');
      if (selectedFiles.length > left) return showToast(\`⚠️ 额度不足，仅剩 \${left} 张\`);

      const btn = document.getElementById('uploadBtn');
      btn.disabled = true;

      uploadedUrls = []; 
      let successCount = 0;
      
      for(let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        btn.innerText = \`上传中 (\${i + 1}/\${selectedFiles.length})\`;
        const formData = new FormData();
        formData.append('image', file);

        try {
          const res = await apiFetch('/api/upload', { method: 'POST', body: formData });
          const text = await res.text();
          let data;
          try { data = JSON.parse(text); } catch(e) { data = { _raw: text }; }

          if (!res.ok) {
            let errorMsg = \`HTTP \${res.status}\`;
            if (text.includes("blocked") || text.includes("cloudflare")) errorMsg = "被目标防火墙拦截";
            else errorMsg = data.error || data.message || data.msg || errorMsg;
            throw new Error(errorMsg);
          }

          if (data.status === false || data.status === 'error' || data.success === false || data.code === 0) {
            throw new Error(data.message || data.msg || data.error || "业务失败");
          }
          
          let url = findUrlInJson(data);
          if (!url) {
            const regexMatch = text.match(/"(https?:\\/\\/[^"]+)"/g);
            if (regexMatch) {
              const matchedUrls = regexMatch.map(m => m.replace(/"/g, ''));
              url = matchedUrls.find(u => u.toLowerCase().includes('.jpg') || u.toLowerCase().includes('.png') || u.toLowerCase().includes('.gif') || u.toLowerCase().includes('.webp') || u.toLowerCase().includes('.jpeg')) || matchedUrls[0];
            }
          }
          
          if(url) {
            uploadedUrls.push(url);
            successCount++;
            consumeQuota(); 
          } else {
            throw new Error("无有效链接");
          }
        } catch(e) {
          if(e.message !== 'Unauthorized') showToast(\`❌ 第 \${i+1} 张失败: \${e.message}\`);
        }
      }
      
      if(successCount > 0) {
        renderResultList();
        showToast(\`✅ 成功上传 \${successCount} 张图片\`);
      }
      
      btn.innerText = '上传'; 
      btn.disabled = false;
      btn.style.display = 'none';
      selectedFiles = [];
      document.getElementById('previewContainer').innerHTML = '';
      document.getElementById('dropIcon').style.display = 'block';
      document.getElementById('dropText').style.display = 'block';
      document.getElementById('dropSubText').style.display = 'block';
    }
  </script>
</body>
</html>`;
}