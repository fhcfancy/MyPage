/**
 * 海宝助手 API 配置
 *
 * 暂停 DeepSeek 需要两步（见 DEPLOY.md）：
 * 1. enabled: false，apiUrl: ""
 * 2. Vercel 环境变量 API_ENABLED=false
 */
window.CHATBOT_CONFIG = {
  enabled: true,
  apiUrl: "https://my-page-eight-alpha.vercel.app/api/chat",
  stream: true
};
