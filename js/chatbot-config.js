/**
 * 海宝助手 API 配置
 *
 * 注意：Vercel 在中国大陆往往无法访问，访客手机/电脑都可能连不上 API。
 * 若主要访客在国内，建议将 api/chat.js 部署到国内云函数，并填 remoteApiUrl。
 *
 * 暂停 API：enabled: false，并 push。
 */
window.CHATBOT_CONFIG = {
  enabled: true,
  vercelHost: "my-page-eight-alpha.vercel.app",
  apiUrl: "/api/chat",
  remoteApiUrl: "https://my-page-eight-alpha.vercel.app/api/chat",
  stream: true
};
