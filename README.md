# 方海潮 · Carina Fang 个人主页

苹果风格的中英双语个人主页，支持深色/浅色模式切换。纯 HTML/CSS/JavaScript，无需任何构建工具。

## 本地预览

双击 `index.html` 即可在浏览器打开。如果照片墙不显示（浏览器安全限制），用本地服务器打开：

```bash
cd /Users/carina/MyPage
python3 -m http.server 8000
```

然后浏览器访问 http://localhost:8000

## 常见修改

### 1. 换成自己的头像
把你的头像图片放进 `assets/` 文件夹，然后编辑 `index.html`，找到这一行：

```html
<img class="hero__avatar" id="heroAvatar" src="assets/profile.svg" alt="avatar" />
```

把 `assets/profile.svg` 改成你的图片文件名，例如 `assets/me.jpg`。

### 2. 添加 / 更换照片墙照片
两步即可：

1. 把照片放进 `photos/` 文件夹
2. 打开 `photos/photos.js`，在数组里加一行文件名（顺序即展示顺序）：

```js
window.PHOTOS = [
  "my-trip-paris.jpg",
  "graduation.jpg",
  "sample-1.svg"
];
```

删掉示例占位图对应的行即可移除占位图。支持 jpg / png / webp 等格式。

### 3. 添加 / 更换证书
证书支持两种类型，都在 `certs/certs.js` 里维护，可以混用：

**图片型**：把证书图片放进 `certs/` 文件夹，填 `img` 字段（页面上图片可点击放大）：

```js
{
  img: "my-cert.jpg",
  zh: { name: "证书名称", desc: "一句话介绍。" },
  en: { name: "Certificate Name", desc: "One-line description." }
}
```

**链接型**：填 `link` 字段，卡片会显示「查看证书」按钮，点击打开官方验证页：

```js
{
  link: "https://官方证书验证链接",
  zh: { name: "证书名称", desc: "一句话介绍。" },
  en: { name: "Certificate Name", desc: "One-line description." }
}
```

`img` 和 `link` 同时填也可以：既展示图片，又有官方链接按钮。删掉 sample 条目即可移除占位卡片。

### 4. 修改文字内容（简历、项目、联系方式等）
所有文字都在 `js/content.js` 里，分 `zh`（中文）和 `en`（英文）两部分，一一对应修改即可。

### 5. 修改配色
主色调在 `css/style.css` 顶部的 `:root`（浅色）和 `[data-theme="dark"]`（深色）变量里，改 `--grad` 渐变即可整体换色。

## 部署到 GitHub Pages（免费上线）

```bash
cd /Users/carina/MyPage
git add .
git commit -m "个人主页"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

然后到 GitHub 仓库 Settings → Pages，Source 选 `main` 分支根目录，保存后即可获得访问链接。

## 文件结构

```
MyPage/
├── index.html          页面结构
├── css/style.css       样式（含深浅两套主题）
├── js/content.js       全部中英文文案（改内容看这里）
├── js/main.js          交互逻辑
├── photos/photos.js    照片清单（加照片看这里）
├── photos/             照片文件
└── assets/             头像等资源
```
