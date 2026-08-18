(function () {
  "use strict";

  var el = function (id) { return document.getElementById(id); };

  var toggleBtn = el("helperToggle");
  var chat = el("helperChat");
  var closeBtn = el("helperClose");
  var titleEl = el("helperTitle");
  var subtitleEl = el("helperSubtitle");
  var messagesEl = el("helperMessages");
  var chipsEl = el("helperChips");
  var formEl = el("helperForm");
  var inputEl = el("helperInput");
  var sendEl = el("helperSend");

  if (!toggleBtn || !chat || !messagesEl || !chipsEl || !formEl || !inputEl || !sendEl) return;

  var locale = {
    zh: {
      title: "海宝助手",
      subtitle: "我会根据主页公开内容回答你",
      placeholder: "问我任何关于这个主页的问题...",
      send: "发送",
      openAria: "打开海宝助手",
      closeAria: "关闭海宝助手",
      hello: "你好呀，我是海宝助手 🫧\n我只基于这个主页已公开的信息回答。你可以试试下面的问题：",
      unknown: "我暂时没有在主页内容里找到这条信息。你可以换个问法，或者问我教育、项目、证书、志愿经历这些内容～",
      intro: "我在主页里找到了这些相关信息：",
      chips: ["你的研究方向是什么？", "你最近在做什么项目？", "你有哪些证书？", "怎么联系你？"]
    },
    en: {
      title: "Haibao Assistant",
      subtitle: "I answer from this page's public info",
      placeholder: "Ask me anything about this page...",
      send: "Send",
      openAria: "Open Haibao assistant",
      closeAria: "Close Haibao assistant",
      hello: "Hi, I'm Haibao Assistant 🫧\nI answer only from the public information on this page. Try one of these:",
      unknown: "I couldn't find that in the page content yet. Try asking about education, projects, certificates, volunteering, or contact info.",
      intro: "Here is what I found on this page:",
      chips: ["What's your research focus?", "What projects are you building?", "What certificates do you have?", "How can I contact you?"]
    }
  };

  var openedOnce = false;

  function currentLang() {
    var saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "zh") return saved;
    return (document.documentElement.getAttribute("lang") || "zh").indexOf("en") === 0 ? "en" : "zh";
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[\s\r\n\t]+/g, "")
      .replace(/[，。！？,.!?:;；、“”"'`~@#$%^&*()_+\-=[\]{}<>\\/|]/g, "");
  }

  function queryTokens(query) {
    return String(query || "")
      .toLowerCase()
      .split(/[\s,.;!?，。！？、:：]+/)
      .map(function (t) { return t.trim(); })
      .filter(function (t) { return t.length >= 2; });
  }

  function pushFact(list, section, title, text, href, tags) {
    if (!text) return;
    list.push({
      section: section,
      title: title || section,
      text: String(text),
      href: href || "",
      tags: tags || []
    });
  }

  function buildFacts(lang) {
    var c = window.CONTENT && window.CONTENT[lang];
    var certs = window.CERTS || [];
    var facts = [];
    if (!c) return facts;

    pushFact(facts, "hero", c.hero.name, c.hero.introLines.join("；"), "#hero", ["name", "intro", "教育", "education"]);
    pushFact(facts, "recruit", c.recruit.title, c.recruit.lead, "#recruit", ["创业", "building", "project"]);
    (c.recruit.projects || []).forEach(function (p) {
      pushFact(facts, "recruit", p.name, (p.tagline || "") + " " + (p.points || []).join("；"), "#recruit", ["项目", "project"]);
    });

    (c.education.items || []).forEach(function (it) {
      pushFact(facts, "education", it.org, it.role + "；" + it.detail, "#education", ["education", "学历", "school"]);
    });
    (c.experience.items || []).forEach(function (it) {
      pushFact(facts, "experience", it.org, it.role + "；" + it.detail, "#experience", ["internship", "实习"]);
    });
    (c.projects.study || []).forEach(function (it) {
      pushFact(facts, "projects", it.name, it.role + "；" + (it.detail || ""), "#projects", ["研学", "study"]);
    });
    (c.projects.contest || []).forEach(function (it) {
      pushFact(facts, "projects", it.name, it.role + "；" + (it.detail || ""), "#projects", ["竞赛", "competition"]);
    });

    (c.research.papers || []).forEach(function (p) {
      pushFact(facts, "research", p.title, p.venue || "", p.link || "#research", ["paper", "research", "论文"]);
    });

    (c.campus.campus || []).forEach(function (it) {
      pushFact(facts, "campus", it.name, it.role + "；" + (it.detail || ""), "#campus", ["campus", "校园"]);
    });
    (c.campus.society || []).forEach(function (it) {
      pushFact(facts, "society", it.name, it.role + "；" + (it.detail || "") + "；" + (it.bullets || []).join("；"), "#campus", ["society", "社会", "volunteer"]);
    });

    (c.awards.groups || []).forEach(function (g) {
      pushFact(facts, "awards", g.group, (g.items || []).join("；"), "#awards", ["awards", "奖项"]);
    });

    (c.skills.items || []).forEach(function (it) {
      pushFact(facts, "skills", it.name, it.detail || "", "#skills", ["skills", "能力"]);
    });

    (c.contact.items || []).forEach(function (it) {
      pushFact(facts, "contact", it.label, it.value || "", "#contact", ["contact", "联系方式"]);
    });

    certs.forEach(function (cert) {
      var t = cert[lang] || cert.zh || cert.en;
      if (!t) return;
      pushFact(
        facts,
        "certificates",
        t.name,
        t.desc || "",
        cert.link || "#certificates",
        ["certificate", "cert", "证书"]
      );
    });

    return facts;
  }

  function scoreFact(query, fact) {
    var q = normalize(query);
    if (!q) return 0;
    var title = normalize(fact.title);
    var text = normalize(fact.text);
    var tags = normalize((fact.tags || []).join(" "));
    var score = 0;

    if (title.indexOf(q) >= 0) score += 16;
    if (text.indexOf(q) >= 0) score += 8;
    if (tags.indexOf(q) >= 0) score += 6;

    queryTokens(query).forEach(function (tok) {
      var n = normalize(tok);
      if (!n) return;
      if (title.indexOf(n) >= 0) score += 5;
      if (text.indexOf(n) >= 0) score += 3;
      if (tags.indexOf(n) >= 0) score += 2;
    });

    return score;
  }

  function uniqueSources(items) {
    var seen = {};
    var out = [];
    items.forEach(function (it) {
      var key = it.href || it.title;
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push({ label: it.title, href: it.href });
    });
    return out.slice(0, 3);
  }

  function buildAnswer(query, lang) {
    var l = locale[lang];
    var q = String(query || "").trim();
    var qNorm = normalize(q);
    if (!qNorm) return { text: l.unknown, sources: [] };

    if (/^(hi|hello|hey|你好|嗨|哈喽)/i.test(q)) {
      return { text: l.hello, sources: [] };
    }

    var facts = buildFacts(lang)
      .map(function (f) { return { fact: f, score: scoreFact(q, f) }; })
      .filter(function (it) { return it.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function (it) { return it.fact; });

    if (!facts.length) return { text: l.unknown, sources: [] };

    var body = facts.map(function (f, idx) {
      return (idx + 1) + ". " + f.title + "：\n" + f.text;
    }).join("\n\n");

    return {
      text: l.intro + "\n\n" + body,
      sources: uniqueSources(facts)
    };
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessage(role, text, sources) {
    var bubble = document.createElement("div");
    bubble.className = "helper-chat__msg " + (role === "user" ? "helper-chat__msg--user" : "helper-chat__msg--bot");
    bubble.textContent = text;
    messagesEl.appendChild(bubble);

    if (sources && sources.length) {
      var src = document.createElement("div");
      src.className = "helper-chat__src";
      sources.forEach(function (s) {
        if (!s.href) return;
        var a = document.createElement("a");
        a.href = s.href;
        a.textContent = s.label;
        if (s.href.indexOf("#") === 0) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            chat.classList.remove("open");
            chat.setAttribute("aria-hidden", "true");
            var target = document.querySelector(s.href);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        } else {
          a.target = "_blank";
          a.rel = "noopener";
        }
        src.appendChild(a);
      });
      if (src.children.length) messagesEl.appendChild(src);
    }

    scrollToBottom();
  }

  function renderChips(lang) {
    chipsEl.innerHTML = "";
    locale[lang].chips.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "helper-chat__chip";
      b.textContent = q;
      b.addEventListener("click", function () {
        inputEl.value = q;
        inputEl.focus();
      });
      chipsEl.appendChild(b);
    });
  }

  function syncLocale() {
    var lang = currentLang();
    var l = locale[lang];
    titleEl.textContent = l.title;
    subtitleEl.textContent = l.subtitle;
    inputEl.placeholder = l.placeholder;
    sendEl.textContent = l.send;
    toggleBtn.setAttribute("aria-label", l.openAria);
    closeBtn.setAttribute("aria-label", l.closeAria);
    renderChips(lang);
  }

  function openChat() {
    chat.classList.add("open");
    chat.setAttribute("aria-hidden", "false");
    if (!openedOnce) {
      appendMessage("bot", locale[currentLang()].hello, []);
      openedOnce = true;
    }
    inputEl.focus();
  }

  function closeChat() {
    chat.classList.remove("open");
    chat.setAttribute("aria-hidden", "true");
  }

  toggleBtn.addEventListener("click", function () {
    if (chat.classList.contains("open")) closeChat();
    else openChat();
  });
  closeBtn.addEventListener("click", closeChat);

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var query = inputEl.value.trim();
    if (!query) return;
    inputEl.value = "";
    appendMessage("user", query);
    var lang = currentLang();
    var res = buildAnswer(query, lang);
    appendMessage("bot", res.text, res.sources);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && chat.classList.contains("open")) closeChat();
  });

  var langBtn = el("langToggle");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      window.setTimeout(syncLocale, 0);
    });
  }

  syncLocale();
})();
