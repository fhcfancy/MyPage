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

  var config = window.CHATBOT_CONFIG || { apiUrl: "", stream: true };
  var personalityConfig = window.CHATBOT_PERSONALITY || {};

  var locale = {
    zh: {
      title: "海宝助手",
      subtitle: "我会尽力解答你想了解主人的问题～",
      subtitleOffline: "当前离线模式，不调用 AI～",
      buttonLabel: "问问海宝吧😜！",
      placeholder: "问我任何关于这个主页的问题...",
      send: "发送",
      openAria: "打开海宝助手",
      closeAria: "关闭海宝助手",
      hello: "你好呀，我是海潮的助手海宝 🫧\n我超级喜欢我的主人，很高兴能为你解答关于她的问题🙋🏻‍♀️，一定知无不言，言无不尽～你可以试试下面的问题：",
      unknown: "我暂时没有在主页内容里找到这条信息。你可以换个问法，或者问我教育、项目、证书、志愿经历这些内容～",
      intro: "我在主页里找到了这些相关信息：",
      thinking: "思考中…",
      apiError: "海宝暂时连不上大脑了，我先根据主页内容帮你查一下～",
      apiErrorMobile: "网络有点慢，我先根据主页帮你查～",
      chips: ["你的研究方向是什么？", "你最近在做什么项目？", "你有哪些证书？", "怎么联系你？"]
    },
    en: {
      title: "HeyBaby Assistant",
      subtitle: "I will do my best to answer what you want to know about my owner~",
      subtitleOffline: "Offline mode — no AI calls~",
      buttonLabel: "Ask HeyBaby 🥰!",
      placeholder: "Ask me anything about this page...",
      send: "Send",
      openAria: "Open HeyBaby assistant",
      closeAria: "Close HeyBaby assistant",
      hello: "Hi, I'm Haichao's assistant, HeyBaby 🫧\nI absolutely adore my owner and I'm so happy to answer your questions about her 🙋🏻‍♀️. I'll share everything I know—try one of these:",
      unknown: "I couldn't find that in the page content yet. Try asking about education, projects, certificates, volunteering, or contact info.",
      intro: "Here is what I found on this page:",
      thinking: "Thinking…",
      apiError: "HeyBaby can't reach the AI backend right now — I'll search the page for you instead.",
      apiErrorMobile: "Network is a bit slow — I'll search the page for you~",
      chips: ["What's your research focus?", "What projects are you building?", "What certificates do you have?", "How can I contact you?"]
    }
  };

  var openedOnce = false;
  var busy = false;
  var conversation = [];

  function currentLang() {
    var saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "zh") return saved;
    return (document.documentElement.getAttribute("lang") || "zh").indexOf("en") === 0 ? "en" : "zh";
  }

  function isApiEnabled() {
    if (config.enabled === false || config.enabled === "false" || config.enabled === 0) return false;
    return true;
  }

  function getApiUrl() {
    if (!isApiEnabled()) return "";
    return String(config.apiUrl || "").trim();
  }

  function getPersonality(lang) {
    if (personalityConfig[lang]) return personalityConfig[lang];
    return personalityConfig.zh || "";
  }

  function useStreaming() {
    if (config.stream === false) return false;
    if (isMobileClient()) return false;
    try {
      return typeof ReadableStream !== "undefined" && !!Response.prototype.body;
    } catch (err) {
      return false;
    }
  }

  function isMobileClient() {
    var ua = navigator.userAgent || "";
    var isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
    return !!(window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
  }

  function getFetchTimeout() {
    return isMobileClient() ? 35000 : 45000;
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var finished = false;
      var timer = window.setTimeout(function () {
        if (finished) return;
        finished = true;
        reject(new Error("timeout"));
      }, timeoutMs || 45000);

      fetch(url, options).then(function (res) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        resolve(res);
      }).catch(function (err) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        reject(err);
      });
    });
  }

  function xhrPostChat(apiUrl, payload, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var finished = false;
      var xhr = new XMLHttpRequest();
      var timer = window.setTimeout(function () {
        if (finished) return;
        finished = true;
        xhr.abort();
        reject(new Error("timeout"));
      }, timeoutMs || 35000);

      xhr.open("POST", apiUrl, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || finished) return;
        finished = true;
        window.clearTimeout(timer);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText || "{}"));
          } catch (err) {
            reject(new Error("invalid json"));
          }
          return;
        }
        reject(new Error(xhr.responseText || ("HTTP " + xhr.status)));
      };
      xhr.onerror = function () {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        reject(new Error("network error"));
      };
      xhr.send(JSON.stringify(payload));
    });
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

  function joinParts() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join("；");
  }

  function cardLines(items, formatter) {
    return (items || []).map(formatter).filter(Boolean).join("\n");
  }

  function buildPageContext(lang) {
    var c = window.CONTENT && window.CONTENT[lang];
    var certs = window.CERTS || [];
    var blocks = [];
    if (!c) return "";

    blocks.push([
      "# Profile",
      c.hero.name,
      c.hero.slogan,
      c.hero.tagline,
      (c.hero.introLines || []).join("\n")
    ].join("\n"));

    blocks.push([
      "# Building / Recruiting",
      c.recruit.title,
      c.recruit.lead,
      cardLines(c.recruit.projects, function (p) {
        return p.name + "\n" + (p.tagline || "") + "\n" + (p.points || []).join("\n");
      })
    ].join("\n\n"));

    blocks.push([
      "# Education",
      cardLines(c.education.items, function (it) {
        return it.date + " · " + it.org + " · " + it.role + "\n" + (it.detail || "");
      })
    ].join("\n\n"));

    blocks.push([
      "# Internships",
      cardLines(c.experience.items, function (it) {
        return it.date + " · " + it.org + " · " + it.role + "\n" + (it.detail || "");
      })
    ].join("\n\n"));

    if (c.research) {
      blocks.push([
        "# Research",
        (c.research.papers || []).map(function (p) {
          return p.title + (p.venue ? " · " + p.venue : "") + (p.link ? " · " + p.link : "");
        }).join("\n"),
        cardLines(c.research.stack, function (it) {
          return it.name + "：" + (it.detail || "");
        })
      ].join("\n\n"));
    }

    if (c.projects) {
      blocks.push([
        "# Projects",
        "Study:\n" + cardLines(c.projects.study, function (it) {
          return it.name + " · " + it.role + "\n" + (it.detail || "");
        }),
        "Competitions:\n" + cardLines(c.projects.contest, function (it) {
          return it.name + " · " + it.role + "\n" + (it.detail || "");
        })
      ].join("\n\n"));
    }

    if (c.campus) {
      blocks.push([
        "# Campus & Society",
        cardLines(c.campus.campus, function (it) {
          return it.name + " · " + it.role + "\n" + joinParts(it.detail, (it.bullets || []).join("；"));
        }),
        cardLines(c.campus.society, function (it) {
          return it.name + " · " + it.role + "\n" + joinParts(it.detail, (it.bullets || []).join("；"));
        })
      ].join("\n\n"));
    }

    if (c.awards && c.awards.groups) {
      blocks.push([
        "# Awards",
        c.awards.groups.map(function (g) {
          return g.group + "：" + (g.items || []).join("；");
        }).join("\n")
      ].join("\n"));
    }

    if (c.skills) {
      blocks.push([
        "# Skills",
        cardLines(c.skills.items, function (it) {
          return it.name + "：" + (it.detail || "");
        })
      ].join("\n\n"));
    }

    if (c.contact) {
      blocks.push([
        "# Contact",
        c.contact.lead,
        cardLines(c.contact.items, function (it) {
          return it.label + "：" + it.value + (it.href ? " (" + it.href + ")" : "");
        })
      ].join("\n\n"));
    }

    if (c.hobbies) {
      blocks.push([
        "# Hobbies",
        c.hobbies.lead,
        (c.hobbies.items || []).map(function (it) {
          return (it.emoji || "") + " " + it.label;
        }).join(" · ")
      ].join("\n"));
    }

    certs.forEach(function (cert) {
      var t = cert[lang] || cert.zh || cert.en;
      if (!t) return;
      blocks.push("# Certificate: " + t.name + "\n" + (t.desc || "") + (cert.link ? "\nLink: " + cert.link : ""));
    });

    var extra = personalityConfig.extraKnowledge || [];
    if (extra.length) {
      blocks.push("# Extra knowledge\n" + extra.join("\n"));
    }

    return blocks.join("\n\n");
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
      pushFact(facts, "certificates", t.name, t.desc || "", cert.link || "#certificates", ["certificate", "cert", "证书"]);
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

  function buildApiContext(query, lang) {
    var c = window.CONTENT && window.CONTENT[lang];
    var parts = [];

    if (c && c.hero) {
      parts.push("# Profile\n" + c.hero.name + "\n" + (c.hero.introLines || []).join("\n"));
    }
    if (c && c.contact && c.contact.items) {
      parts.push("# Contact\n" + c.contact.items.map(function (it) {
        return it.label + "：" + it.value;
      }).join("\n"));
    }

    var facts = buildFacts(lang)
      .map(function (f) { return { fact: f, score: scoreFact(query, f) }; })
      .sort(function (a, b) { return b.score - a.score; });

    var limitFacts = isMobileClient() ? 4 : 8;
    var picked = facts.filter(function (it) { return it.score > 0; }).slice(0, limitFacts);
    if (!picked.length) picked = facts.slice(0, isMobileClient() ? 4 : 6);

    picked.forEach(function (it) {
      parts.push(it.fact.title + "：" + it.fact.text);
    });

    var extra = personalityConfig.extraKnowledge || [];
    if (extra.length) parts.push("# Extra\n" + extra.join("\n"));

    var text = parts.join("\n\n");
    var limit = isMobileClient() ? 3500 : 7000;
    if (text.length > limit) text = text.slice(0, limit) + "\n…";
    return text;
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

  function buildLocalAnswer(query, lang) {
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

  function appendSources(sources) {
    if (!sources || !sources.length) return;
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
          closeChat();
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

  function appendMessage(role, text, sources) {
    var bubble = document.createElement("div");
    bubble.className = "helper-chat__msg " + (role === "user" ? "helper-chat__msg--user" : "helper-chat__msg--bot");
    bubble.dataset.role = role;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    appendSources(sources);
    scrollToBottom();
    return bubble;
  }

  function createBotBubble(initialText) {
    var bubble = document.createElement("div");
    bubble.className = "helper-chat__msg helper-chat__msg--bot helper-chat__msg--typing";
    bubble.dataset.role = "bot";
    bubble.textContent = initialText || "";
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function setBusy(next) {
    busy = next;
    inputEl.disabled = next;
    sendEl.disabled = next;
  }

  function getConversationMessages() {
    return conversation
      .filter(function (m) { return m.role === "user" || m.role === "assistant"; })
      .slice(-12)
      .map(function (m) {
        return { role: m.role, content: m.content };
      });
  }

  function parseSseChunk(buffer, onDelta) {
    var lines = buffer.split("\n");
    var rest = lines.pop() || "";
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed || trimmed.indexOf("data:") !== 0) return;
      var data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") return;
      try {
        var json = JSON.parse(data);
        var delta = json.choices && json.choices[0] && json.choices[0].delta
          ? json.choices[0].delta.content
          : "";
        if (delta) onDelta(delta);
      } catch (err) {
        /* ignore partial json */
      }
    });
    return rest;
  }

  function askDeepSeekRequest(query, lang, thinkingBubble) {
    var apiUrl = getApiUrl();
    if (!apiUrl) return Promise.reject(new Error("API not configured"));

    var langPack = locale[lang];
    var stream = useStreaming();
    var bubble = thinkingBubble || createBotBubble(langPack.thinking);
    var payload = {
      lang: lang,
      stream: stream,
      client: isMobileClient() ? "mobile" : "web",
      personality: getPersonality(lang),
      context: buildApiContext(query, lang),
      messages: getConversationMessages()
    };

    function finishWithText(text) {
      var answer = text || langPack.unknown;
      bubble.textContent = answer;
      bubble.classList.remove("helper-chat__msg--typing");
      scrollToBottom();
      return { text: answer, sources: [] };
    }

    if (isMobileClient()) {
      return xhrPostChat(apiUrl, payload, getFetchTimeout()).then(function (data) {
        return finishWithText(data && data.content);
      });
    }

    return fetchWithTimeout(apiUrl, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, getFetchTimeout()).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error(text || ("HTTP " + res.status));
        });
      }

      if (!stream || !res.body || typeof res.body.getReader !== "function") {
        return res.json().then(function (data) {
          return finishWithText(data && data.content);
        });
      }

      var fullText = "";
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";

      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) {
            bubble.classList.remove("helper-chat__msg--typing");
            if (!fullText.trim()) fullText = langPack.unknown;
            bubble.textContent = fullText;
            scrollToBottom();
            return { text: fullText, sources: [] };
          }

          buffer += decoder.decode(chunk.value, { stream: true });
          buffer = parseSseChunk(buffer, function (delta) {
            fullText += delta;
            bubble.textContent = fullText;
            bubble.classList.remove("helper-chat__msg--typing");
            scrollToBottom();
          });
          return pump();
        });
      }

      return pump().catch(function () {
        throw new Error("stream failed");
      });
    });
  }

  function askDeepSeek(query, lang) {
    var bubble = createBotBubble(locale[lang].thinking);
    return askDeepSeekRequest(query, lang, bubble).catch(function () {
      bubble.textContent = locale[lang].thinking;
      bubble.classList.add("helper-chat__msg--typing");
      return askDeepSeekRequest(query, lang, bubble);
    }).catch(function () {
      if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
      throw new Error("API failed");
    });
  }

  function renderChips(lang) {
    chipsEl.innerHTML = "";
    locale[lang].chips.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "helper-chat__chip";
      b.textContent = q;
      b.addEventListener("click", function () {
        if (busy) return;
        inputEl.value = q;
        submitQuery();
      });
      chipsEl.appendChild(b);
    });
  }

  function isWelcomeMessage(text) {
    return text === locale.zh.hello || text === locale.en.hello;
  }

  function syncLocale(forcedLang) {
    var lang = forcedLang || currentLang();
    var l = locale[lang];
    titleEl.textContent = l.title;
    subtitleEl.textContent = isApiEnabled() ? l.subtitle : l.subtitleOffline;
    var helperText = toggleBtn.querySelector(".helper-btn__text");
    if (helperText) helperText.textContent = l.buttonLabel;
    toggleBtn.setAttribute("title", l.title);
    inputEl.placeholder = l.placeholder;
    sendEl.textContent = l.send;
    toggleBtn.setAttribute("aria-label", l.openAria);
    closeBtn.setAttribute("aria-label", l.closeAria);
    refreshGreeting(lang);
    renderChips(lang);
  }

  function refreshGreeting(lang) {
    var bubbles = messagesEl.querySelectorAll(".helper-chat__msg");
    if (!bubbles.length) return;
    var first = bubbles[0];
    if (first.dataset.role !== "bot") return;
    if (isWelcomeMessage(first.textContent)) {
      first.textContent = locale[lang].hello;
    }
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

  function handleSubmit(query) {
    var lang = currentLang();
    var l = locale[lang];
    appendMessage("user", query);
    conversation.push({ role: "user", content: query });
    setBusy(true);

    if (!getApiUrl()) {
      var offline = buildLocalAnswer(query, lang);
      appendMessage("bot", offline.text, offline.sources);
      conversation.push({ role: "assistant", content: offline.text });
      setBusy(false);
      inputEl.focus();
      return;
    }

    askDeepSeek(query, lang)
      .then(function (res) {
        conversation.push({ role: "assistant", content: res.text });
      })
      .catch(function () {
        var local = buildLocalAnswer(query, lang);
        var prefix = isMobileClient() ? l.apiErrorMobile : l.apiError;
        appendMessage("bot", prefix + "\n\n" + local.text, local.sources);
        conversation.push({ role: "assistant", content: local.text });
      })
      .finally(function () {
        setBusy(false);
        inputEl.focus();
      });
  }

  function submitQuery() {
    if (busy) return;
    var query = inputEl.value.trim();
    if (!query) return;
    inputEl.value = "";
    handleSubmit(query);
  }

  toggleBtn.addEventListener("click", function () {
    if (chat.classList.contains("open")) closeChat();
    else openChat();
  });
  closeBtn.addEventListener("click", closeChat);

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    submitQuery();
  });

  sendEl.addEventListener("click", function (e) {
    e.preventDefault();
    submitQuery();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && chat.classList.contains("open")) closeChat();
  });

  window.addEventListener("mypage:langchange", function (e) {
    syncLocale(e.detail && e.detail.lang);
  });

  syncLocale();
})();
