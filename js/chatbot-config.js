/**
 * 海宝助手 API 配置
 *
 * 暂停 DeepSeek（不花钱）需要两步：
 * 1. 这里 enabled: false 并 push（前端不请求 API）
 * 2. Vercel 环境变量 API_ENABLED=false（后端彻底停止，防止继续扣费）
 *
 * 离线时海宝仍可用，会用主页内容的本地搜索回答。
 */
window.CHATBOT_CONFIG = {
  enabled: false,
  apiUrl: "",
  stream: true
};
