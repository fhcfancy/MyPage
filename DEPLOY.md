# 部署说明

个人主页托管在 **GitHub Pages**，海宝助手的 AI 后端在 **Vercel**。大多数改动只需 push 到 GitHub。

## 1. 保存文件

改完代码后先保存：

- Mac：`Cmd + S`（保存全部：`Cmd + Option + S`）
- 建议开启 **File → Auto Save**

确认已保存：

```bash
cd /Users/carina/MyPage
git status
```

能看到修改的文件列表，说明保存成功。

## 2. Push 到 GitHub Pages

```bash
cd /Users/carina/MyPage
git add .
git commit -m "这里写本次修改说明"
git push origin main
```

推送成功后等 **1–2 分钟**，浏览器 **强制刷新**（`Cmd + Shift + R`）。

## 3. 改了 JS/CSS 仍看到旧页面？

在 `index.html` 里把缓存版本号改一下，例如：

```text
?v=20260819e  →  ?v=20260819f
```

保存后再 commit、push。

## 4. 海宝助手

| 文件 | 作用 |
|------|------|
| `js/chatbot-config.js` | API 地址、`enabled` 开关 |
| `js/chatbot-personality.js` | 性格、补充知识 |
| `api/chat.js` | 后端逻辑（Vercel） |

### 暂停 DeepSeek（不产生 API 费用）

编辑 `js/chatbot-config.js`：

```js
enabled: false,
```

保存 → push。海宝仍可用，会改用主页本地搜索回答。

恢复：改回 `enabled: true` 再 push。

### 改性格 / 补充知识

只改 `js/chatbot-personality.js`，push 即可，**不用**重新部署 Vercel。

## 5. 什么时候要动 Vercel？

只有改了 `api/` 目录（如 `api/chat.js`）或环境变量时才需要：

- Vercel 已连 GitHub 时：push 后会自动 redeploy
- 环境变量在 Vercel → Project → Settings → Environment Variables

常用变量：

- `DEEPSEEK_API_KEY`
- `ALLOWED_ORIGINS`（你的 GitHub Pages 地址）

## 6. 本地预览

```bash
cd /Users/carina/MyPage
python3 -m http.server 8000
```

浏览器打开 http://localhost:8000

## 7. 常用命令

```bash
git status          # 看未提交的改动
git diff            # 看具体改了什么
git log -5 --oneline  # 看最近提交
```
