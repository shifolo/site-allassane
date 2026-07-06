(function () {
  "use strict";

  var STORAGE_KEY = "site-lang";
  var htmlEl = document.documentElement;
  var langToggleBtn = document.getElementById("lang-toggle");
  var navToggleBtn = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  var header = document.getElementById("site-header");
  var yearEl = document.getElementById("year");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");

  /* ---------- i18n ---------- */
  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || "fr";
  }

  function applyTranslations(lang) {
    var dict = translations[lang] || translations.fr;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });

    htmlEl.setAttribute("lang", lang);
    if (dict["meta.title"]) document.title = dict["meta.title"];

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["meta.description"]) metaDesc.setAttribute("content", dict["meta.description"]);

    ["og-title", "twitter-title"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && dict["meta.title"]) el.setAttribute("content", dict["meta.title"]);
    });
    ["og-description", "twitter-description"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && dict["meta.description"]) el.setAttribute("content", dict["meta.description"]);
    });

    if (langToggleBtn) {
      var nextLangLabel = lang === "fr" ? "EN" : "FR";
      langToggleBtn.querySelector("span").textContent = nextLangLabel;
      langToggleBtn.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer en français");
    }

    var whatsappBtn = document.getElementById("whatsapp-cta");
    if (whatsappBtn && dict["training.whatsapp_message"]) {
      var whatsappPhone = "2250767490189";
      whatsappBtn.href = "https://wa.me/" + whatsappPhone + "?text=" + encodeURIComponent(dict["training.whatsapp_message"]);
    }
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", function () {
      setLang(getLang() === "fr" ? "en" : "fr");
    });
  }

  applyTranslations(getLang());

  /* ---------- Mobile nav ---------- */
  if (navToggleBtn && mainNav) {
    navToggleBtn.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggleBtn.classList.toggle("open", isOpen);
      navToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mainNav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggleBtn.classList.remove("open");
        navToggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky header shadow ---------- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Footer year ---------- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Cyber Watch news feed ---------- */
  var newsList = document.getElementById("cyberwatch-news-list");
  if (newsList) {
    var newsFeedUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://feeds.feedburner.com/TheHackersNews");

    fetch(newsFeedUrl)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.status !== "ok" || !data.items || !data.items.length) throw new Error("Feed unavailable");

        var lang = getLang();
        var locale = lang === "fr" ? "fr-FR" : "en-US";
        newsList.innerHTML = "";

        data.items.slice(0, 6).forEach(function (item) {
          var li = document.createElement("li");
          li.className = "cyberwatch-news-item";

          var link = document.createElement("a");
          link.href = item.link;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = item.title;

          var date = document.createElement("span");
          date.className = "cyberwatch-news-date";
          var parsedDate = new Date(item.pubDate);
          date.textContent = isNaN(parsedDate) ? "" : parsedDate.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

          li.appendChild(link);
          li.appendChild(date);
          newsList.appendChild(li);
        });
      })
      .catch(function () {
        var dict = translations[getLang()] || translations.fr;
        newsList.innerHTML = "";
        var li = document.createElement("li");
        li.className = "cyberwatch-news-status";
        li.textContent = dict["cyberwatch.news_error"];
        newsList.appendChild(li);
      });
  }

  /* ---------- Contact form (Formspree) ---------- */
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var lang = getLang();
      var dict = translations[lang] || translations.fr;
      var submitBtn = form.querySelector(".form-submit");
      var originalLabel = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = dict["contact.form_sending"];
      formStatus.textContent = "";
      formStatus.className = "form-status";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            formStatus.textContent = dict["contact.form_success"];
            formStatus.classList.add("success");
            form.reset();
          } else {
            throw new Error("Form submission failed");
          }
        })
        .catch(function () {
          formStatus.textContent = dict["contact.form_error"];
          formStatus.classList.add("error");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }
})();
