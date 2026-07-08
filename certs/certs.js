// 证书清单。支持两种类型，可以混用：
//
// 1) 图片型：把证书图片放进 certs/ 文件夹，填 img 字段（图片可点击放大）
// 2) 链接型：填 link 字段（卡片会显示「查看证书」按钮，点击打开官方验证页）
//
// img 和 link 也可以同时填：既展示图片，又有官方链接按钮。
// zh / en 分别是中文和英文的名称与介绍。大图建议先压缩（长边 1600px 左右）。
window.CERTS = [
  {
    img: "sample-cert-1.svg",
    zh: { name: "FRM 金融风险管理师", desc: "通过 FRM 一级与二级考试。" },
    en: { name: "FRM (Financial Risk Manager)", desc: "Passed FRM Levels I & II." }
  },
  {
    img: "sample-cert-2.svg",
    zh: { name: "雅思 IELTS 8.0", desc: "英语流利，学术与生活场景沟通无障碍。" },
    en: { name: "IELTS 8.0", desc: "Fluent English for academic and everyday communication." }
  },
  {
    link: "https://www.example.com/your-official-certificate",
    zh: { name: "红十字初级救护员（链接型示例）", desc: "把 link 换成官方证书验证链接即可。" },
    en: { name: "Red Cross First Aider (link example)", desc: "Replace the link with the official verification URL." }
  }
];
