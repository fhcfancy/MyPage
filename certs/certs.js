// 证书清单。支持两种类型，可以混用：
//
// 1) 图片型：把证书图片放进 certs/ 文件夹，填 img 字段（图片可点击放大）
// 2) 链接型：填 link 字段（卡片会显示「查看证书」按钮，点击打开官方验证页）
//
// img 和 link 也可以同时填：既展示图片，又有官方链接按钮。
// zh / en 分别是中文和英文的名称与介绍。大图建议先压缩（长边 1600px 左右）。
window.CERTS = [
  {
    img: "红十字救护员证-web.jpg",
    zh: { name: "红十字初级救护员", desc: "持有红十字会初级救护员证书。" },
    en: { name: "Red Cross First Aider", desc: "Certified Red Cross first aider." }
  },
  {
    img: "高中英语教师资格证-web.jpg",
    zh: { name: "高中英语教师资格证", desc: "取得高级中学英语教师资格。" },
    en: { name: "Senior High School English Teacher Certificate", desc: "Qualified to teach English at the senior high school level." }
  },
  {
    img: "FRM-web.jpg",
    link: "https://my.garp.org/DigitalBadgeFRMII?id=0035d00006XWsM1AAL",
    zh: {
      name: "FRM 金融风险管理师",
      desc: "通过 FRM 一级与二级考试。点击下方按钮可预览 GARP 官方数字徽章。"
    },
    en: {
      name: "FRM (Financial Risk Manager)",
      desc: "Passed FRM Levels I & II. Click the button below to preview the official GARP digital badge."
    }
  },
  {
    img: "IELTS-web.jpg",
    zh: {
      name: "雅思 IELTS 8.0",
      desc: "Overall band score 8.0 · Listening 8.0 · Reading 8.0 · Writing 7.5 · Speaking 7.5 · CEFR Level C1"
    },
    en: {
      name: "IELTS 8.0",
      desc: "Overall band score 8.0 · Listening 8.0 · Reading 8.0 · Writing 7.5 · Speaking 7.5 · CEFR Level C1"
    }
  },
  {
    link: "https://www.coursera.org/account/accomplishments/verify/5UTNYIBBJUJP",
    zh: {
      name: "Databases and SQL for Data Science with Python",
      desc: "Coursera / IBM 结业证书。学习用 Python 与 SQL 分析数据库数据、构建关系表与进阶查询。"
    },
    en: {
      name: "Databases and SQL for Data Science with Python",
      desc: "Coursera / IBM certificate. Learned to analyze data with SQL and Python, work with relational tables, and write advanced queries."
    }
  },
  {
    link: "https://www.coursera.org/account/accomplishments/verify/4DOPI31EMOOD",
    zh: {
      name: "Vibe Coding with Cursor AI",
      desc: "Coursera / Scrimba 结业证书。学习使用 Cursor AI 进行写意编程、生成与调试代码。"
    },
    en: {
      name: "Vibe Coding with Cursor AI",
      desc: "Coursera / Scrimba certificate. Learned to build and debug with Cursor AI for vibe coding workflows."
    }
  }
];
