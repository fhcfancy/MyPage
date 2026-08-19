/**
 * 海宝助手 API 配置
 *
 * 手机端最稳定：用 Vercel 链接打开主页（同源 /api/chat，无跨域问题）
 * https://my-page-eight-alpha.vercel.app/
 *
 * GitHub Pages 链接在部分手机上可能因跨域失败，会自动降级为本地搜索。
 */
window.CHATBOT_CONFIG = {
  enabled: true,
  vercelHost: "my-page-eight-alpha.vercel.app",
  apiUrl: "/api/chat",
  remoteApiUrl: "https://my-page-eight-alpha.vercel.app/api/chat",
  stream: true
};
