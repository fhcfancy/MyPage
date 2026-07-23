(function () {
  "use strict";

  var root = document.documentElement;
  var LINKEDIN = window.LINKEDIN_URL;

  /* ---------- 主题 ---------- */
  function initTheme() {
    var saved = localStorage.getItem("theme");
    if (saved) {
      root.setAttribute("data-theme", saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.setAttribute("data-theme", "dark");
    }
  }
  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  /* ---------- 语言 ---------- */
  function currentLang() {
    return localStorage.getItem("lang") || (navigator.language && navigator.language.indexOf("zh") === 0 ? "zh" : "zh");
  }

  var el = function (id) { return document.getElementById(id); };

  function render(lang) {
    var c = window.CONTENT[lang];
    root.setAttribute("lang", c.meta.lang);
    document.title = c.meta.title;

    // 简单 data-i18n 文本
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var path = node.getAttribute("data-i18n").split(".");
      var val = c;
      for (var i = 0; i < path.length; i++) { val = val && val[path[i]]; }
      if (typeof val === "string") node.textContent = val;
    });

    // 语言按钮显示另一种语言
    el("langToggle").querySelector(".lang-text").textContent = lang === "zh" ? "EN" : "中";

    // Hero
    el("heroName").textContent = c.hero.name;
    el("heroSlogan").textContent = c.hero.slogan;
    el("heroTagline").textContent = c.hero.tagline;
    el("heroIntro").innerHTML = c.hero.introLines
      .map(function (line) { return "<span>" + line + "</span>"; })
      .join("<br />");
    el("heroLinkedin").setAttribute("href", LINKEDIN);
    el("heroEmail").setAttribute("href", "mailto:" + c.contact.items[0].value);

    // 招募
    el("recruitEyebrow").textContent = c.recruit.eyebrow;
    el("recruitTitle").textContent = c.recruit.title;
    el("recruitLead").textContent = c.recruit.lead;
    el("recruitGrid").innerHTML = c.recruit.projects.map(function (p) {
      return '<div class="recruit-card anim">' +
        '<span class="recruit-card__badge">' + c.recruit.badge + "</span>" +
        '<h3 class="recruit-card__name">' + p.name + "</h3>" +
        '<p class="recruit-card__tagline">' + p.tagline + "</p>" +
        '<ul class="recruit-card__points">' +
        p.points.map(function (pt) { return "<li>" + pt + "</li>"; }).join("") +
        "</ul>" +
        '<a class="btn btn--primary" href="#contact">' + c.recruit.contactBtn + "</a>" +
        "</div>";
    }).join("");

    // 照片墙
    el("photosEyebrow").textContent = c.photos.eyebrow;
    el("photosTitle").textContent = c.photos.title;
    el("photosLead").textContent = c.photos.lead;

    // 教育
    el("eduEyebrow").textContent = c.education.eyebrow;
    el("eduTitle").textContent = c.education.title;
    el("eduTimeline").innerHTML = timeline(c.education.items);

    // 实习
    el("expEyebrow").textContent = c.experience.eyebrow;
    el("expTitle").textContent = c.experience.title;
    el("expTimeline").innerHTML = timeline(c.experience.items);

    // 科研
    el("resEyebrow").textContent = c.research.eyebrow;
    el("resTitle").textContent = c.research.title;
    el("researchCards").innerHTML = c.research.papers.map(function (p) {
      var titleHtml = p.link
        ? '<a class="paper-list__title" href="' + p.link + '" target="_blank" rel="noopener">' + p.title + "</a>"
        : '<span class="paper-list__title">' + p.title + "</span>";
      return '<li class="paper-list__item anim">' + titleHtml +
        '<span class="paper-list__venue">' + p.venue + "</span></li>";
    }).join("");
    el("skillTags").innerHTML = c.research.tags.map(function (t) {
      return '<span class="tag anim">' + t + "</span>";
    }).join("");

    // 项目：研学 + 竞赛
    el("projEyebrow").textContent = c.projects.eyebrow;
    el("projTitle").textContent = c.projects.title;
    el("projStudyTitle").textContent = c.projects.studyTitle;
    el("projContestTitle").textContent = c.projects.contestTitle;
    el("projectStudyCards").innerHTML = richCards(c.projects.study);
    el("projectContestCards").innerHTML = richCards(c.projects.contest);

    // 奖项
    el("awardEyebrow").textContent = c.awards.eyebrow;
    el("awardTitle").textContent = c.awards.title;
    el("awardGrid").innerHTML = c.awards.groups.map(function (g) {
      return '<div class="award-group anim"><h3 class="award-group__title">' + g.group +
        "</h3><ul>" + g.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") +
        "</ul></div>";
    }).join("");

    // 证书
    el("certsEyebrow").textContent = c.certs.eyebrow;
    el("certsTitle").textContent = c.certs.title;
    el("certsLead").textContent = c.certs.lead;
    el("certsGrid").innerHTML = (window.CERTS || []).map(function (cert) {
      var t = cert[lang] || cert.zh;
      var media = cert.img
        ? '<img class="cert-card__img" src="certs/' + cert.img + '" alt="' + t.name + '" loading="lazy" />'
        : '<div class="cert-card__placeholder">' +
          '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.6 13.9 7 22l5-3 5 3-1.6-8.1"/></svg>' +
          "</div>";
      var linkBtn = cert.link
        ? '<a class="cert-card__link" href="' + cert.link + '" target="_blank" rel="noopener">' + c.certs.viewBtn +
          ' <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg></a>'
        : "";
      return '<div class="cert-card anim">' + media +
        '<div class="cert-card__body">' +
        '<p class="cert-card__name">' + t.name + "</p>" +
        '<p class="cert-card__desc">' + t.desc + "</p>" +
        linkBtn +
        "</div></div>";
    }).join("");
    el("certsGrid").querySelectorAll(".cert-card__img").forEach(bindLightbox);

    // 校园与社会：校园 + 社会
    el("campusEyebrow").textContent = c.campus.eyebrow;
    el("campusTitle").textContent = c.campus.title;
    el("campusCampusTitle").textContent = c.campus.campusTitle;
    el("campusSocietyTitle").textContent = c.campus.societyTitle;
    el("campusCampusCards").innerHTML = richCards(c.campus.campus);
    el("campusSocietyCards").innerHTML = richCards(c.campus.society);
    el("campusSocietyCards").querySelectorAll(".card__gallery img").forEach(bindLightbox);

    // 技能
    el("skillsEyebrow").textContent = c.skills.eyebrow;
    el("skillsTitle").textContent = c.skills.title;
    el("skillsCards").innerHTML = c.skills.items.map(function (s) {
      return '<div class="card anim"><p class="card__name">' + s.name +
        '</p><p class="card__detail">' + s.detail + "</p></div>";
    }).join("");

    // 联系
    el("contactEyebrow").textContent = c.contact.eyebrow;
    el("contactTitle").textContent = c.contact.title;
    el("contactGrid").innerHTML = c.contact.items.map(function (it) {
      return '<a class="contact-card anim" href="' + it.href + '"' +
        (it.label === "LinkedIn" || it.label === "领英" ? ' target="_blank" rel="noopener"' : "") + ">" +
        '<div class="contact-card__icon">' + contactIcon(it.label) + "</div>" +
        '<p class="contact-card__label">' + it.label + "</p>" +
        '<p class="contact-card__value">' + it.value + "</p></a>";
    }).join("");

    // 爱好
    el("hobbiesEyebrow").textContent = c.hobbies.eyebrow;
    el("hobbiesTitle").textContent = c.hobbies.title;
    el("hobbiesLead").textContent = c.hobbies.lead || "";
    el("hobbyTags").innerHTML = c.hobbies.items.map(function (h, i) {
      return '<span class="hobby-tag anim" style="--i:' + i + '">' +
        '<span class="hobby-tag__emoji" aria-hidden="true">' + h.emoji + "</span>" +
        '<span class="hobby-tag__label">' + h.label + "</span></span>";
    }).join("");

    // 页脚
    el("footerText").textContent = c.footer;

    observeReveals();
  }

  function timeline(items) {
    return items.map(function (it) {
      return '<div class="tl-item anim">' +
        '<p class="tl-date">' + it.date + "</p>" +
        '<h3 class="tl-org">' + it.org + "</h3>" +
        '<p class="tl-role">' + it.role + "</p>" +
        '<p class="tl-detail">' + it.detail + "</p></div>";
    }).join("");
  }

  function cards(items) {
    return items.map(function (it) {
      return '<div class="card anim"><p class="card__name">' + it.name +
        '</p><p class="card__role">' + it.role +
        '</p><p class="card__detail">' + it.detail + "</p></div>";
    }).join("");
  }

  function richCards(items) {
    return (items || []).map(function (it) {
      var bullets = (it.bullets && it.bullets.length)
        ? '<ul class="card__bullets">' + it.bullets.map(function (b) { return "<li>" + b + "</li>"; }).join("") + "</ul>"
        : "";
      var images = (it.images && it.images.length)
        ? '<div class="card__gallery">' + it.images.map(function (img) {
            return '<img src="' + img.src + '" alt="' + (img.alt || "") + '" loading="lazy" />';
          }).join("") + "</div>"
        : "";
      var links = (it.links && it.links.length)
        ? '<div class="card__links">' + it.links.map(function (link) {
            return '<a class="card__link" href="' + link.href + '" target="_blank" rel="noopener">' +
              (link.label || link.href) + "</a>";
          }).join("") + "</div>"
        : "";
      return '<div class="card anim' + (it.images ? " card--gallery" : "") + '"><p class="card__name">' + it.name +
        '</p><p class="card__role">' + it.role +
        '</p>' + (it.detail ? '<p class="card__detail">' + it.detail + "</p>" : "") +
        bullets + images + links + "</div>";
    }).join("");
  }

  function bindLightbox(img) {
    img.addEventListener("click", function () {
      el("lightboxImg").setAttribute("src", img.getAttribute("src"));
      el("lightbox").classList.add("open");
      el("lightbox").setAttribute("aria-hidden", "false");
    });
  }

  function contactIcon(label) {
    if (label === "LinkedIn") {
      return '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.9H5.67v8.44h2.67zM7 8.7a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.64v-4.63c0-2.47-1.32-3.62-3.08-3.62-1.42 0-2.06.78-2.41 1.33V9.9h-2.67c.04.75 0 8.44 0 8.44h2.67v-4.71c0-.24.02-.48.09-.65.19-.48.63-.98 1.36-.98.96 0 1.35.73 1.35 1.8v4.54h2.7z"/></svg>';
    }
    if (label === "电话" || label === "Phone") {
      return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>';
  }

  /* ---------- 照片墙 ---------- */
  function renderPhotos() {
    var list = window.PHOTOS || [];
    el("photosGrid").innerHTML = list.map(function (f, i) {
      return '<img src="photos/' + f + '" alt="photo ' + (i + 1) + '" loading="lazy" />';
    }).join("");
    el("photosGrid").querySelectorAll("img").forEach(function (img) {
      img.addEventListener("click", function () {
        el("lightboxImg").setAttribute("src", img.getAttribute("src"));
        el("lightbox").classList.add("open");
        el("lightbox").setAttribute("aria-hidden", "false");
      });
    });
  }
  function closeLightbox() {
    el("lightbox").classList.remove("open");
    el("lightbox").setAttribute("aria-hidden", "true");
  }

  /* ---------- 滚动淡入 ---------- */
  var observer;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal, .anim").forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); observer.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal, .anim").forEach(function (n) { observer.observe(n); });
  }

  /* ---------- 初始化 ---------- */
  initTheme();
  var lang = currentLang();
  render(lang);
  renderPhotos();
  observeReveals();

  el("themeToggle").addEventListener("click", toggleTheme);
  el("langToggle").addEventListener("click", function () {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem("lang", lang);
    render(lang);
  });

  // 移动端菜单
  var burger = el("burger");
  var navLinks = el("navLinks");
  burger.addEventListener("click", function () { navLinks.classList.toggle("open"); });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { navLinks.classList.remove("open"); });
  });

  // Lightbox
  el("lightboxClose").addEventListener("click", closeLightbox);
  el("lightbox").addEventListener("click", function (e) {
    if (e.target === el("lightbox")) closeLightbox();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
})();
