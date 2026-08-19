/**
 * 海宝助手 API 配置
 *
 * 暂停 DeepSeek（不花钱）：把 enabled 改成 false，push 即可。
 * 海宝仍可用，会自动改用主页内容的本地搜索回答。
 */
window.CHATBOT_CONFIG = {
  enabled: true,
  apiUrl: "https://my-page-eight-alpha.vercel.app/api/chat",
  stream: true
};
