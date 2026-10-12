(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const app = document.getElementById("app");

  const icons = {
    github:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.21c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49v-1.71c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.81c0 .27.18.6.69.49A10.27 10.27 0 0 0 22 12.21C22 6.58 17.52 2 12 2Z"/></svg>',
    scholar:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-7 7.8v3.32c0 2.07 3.13 3.75 7 3.75s7-1.68 7-3.75V10.8l-7 3.82-7-3.82Z"/></svg>',
    mail:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    bilibili:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 3.6 12 7.2 6.2 3.6 2 10.8l10 9.6 10-9.6-4.2-7.2ZM9 9.8h6v2H9v-2Zm0 3.4h6v2H9v-2Z"/></svg>',
    link:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93"/><path d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07L13 19.07"/></svg>',
    pdf:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></svg>'
  };

  const strokes = {
    github: 'fill="currentColor" stroke="none"',
    scholar: 'fill="currentColor" stroke="none"',
    bilibili: 'fill="currentColor" stroke="none"',
    mail: 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"',
    link: 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"',
    pdf: 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function richText(value) {
    return escapeHtml(value)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/_([^_\n]+)_/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function icon(name) {
    const svg = icons[name] || icons.link;
    return svg.replace("<svg", `<svg ${strokes[name] || strokes.link}`);
  }

  function socialLinks(items) {
    return (items || [])
      .map((item, index) => {
        const link = `
          <a class="social-link" href="${escapeHtml(item.href || "#")}" ${/^https?:/.test(item.href || "") ? 'target="_blank" rel="noopener noreferrer"' : ""}>
            ${icon(item.icon || "link")}
            <span>${escapeHtml(item.label || "")}</span>
          </a>
        `;
        return index === 0 ? link : `<span class="social-separator">/</span>${link}`;
      })
      .join("");
  }

  function renderProfile() {
    const profile = config.profile || {};
    const email = profile.email || "";
    const atIndex = email.indexOf("@");
    const emailName = atIndex >= 0 ? email.slice(0, atIndex) : email;
    const emailDomain = atIndex >= 0 ? email.slice(atIndex + 1) : "";
    return `
      <section class="anchor-section" id="home">
        <div class="profile">
          <img class="profile-photo" src="${escapeHtml(profile.avatar || "assets/avatar-placeholder.png")}" alt="${escapeHtml(profile.name || "")}">
          <div class="profile-main">
            <h1 class="profile-name">${escapeHtml(profile.name || "Your Name")}<span>${escapeHtml(profile.nameZh || "")}</span></h1>
            <p class="profile-intro">${richText(profile.intro || "")}</p>
            <div class="social-row">${socialLinks(profile.socials)}</div>
            <p class="profile-email">${escapeHtml(emailName)}<span class="at"> {_AT_} </span>${escapeHtml(emailDomain)}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderOverview() {
    const overview = config.overview || {};
    const images = Array.isArray(overview.images) && overview.images.length
      ? overview.images
      : overview.image
        ? [overview.image]
        : [];
    const slides = images
      .map(
        (image, index) => `
          <figure class="overview-slide${index === 0 ? " active" : ""}">
            <img src="${escapeHtml(image.src || "")}" alt="${escapeHtml(image.alt || "")}" loading="lazy">
            <figcaption>${richText(image.caption || "")}</figcaption>
          </figure>
        `
      )
      .join("");

    const dots = images
      .map(
        (image, index) => `
          <button class="gallery-dot${index === 0 ? " active" : ""}" type="button" data-index="${index}" aria-label="图片 ${index + 1}"></button>
        `
      )
      .join("");

    return `
      <section class="anchor-section" id="overview">
        <h1>${escapeHtml(overview.title || "Research Overview")}</h1>
        <p class="section-intro">${richText(overview.text || "")}</p>
        ${slides ? `
          <div class="overview-slider" id="overview-slider">
            <div class="overview-slides">${slides}</div>
            <div class="overview-controls">
              <button class="gallery-arrow gallery-prev" type="button" aria-label="上一张">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>
              </button>
              <div class="gallery-counter" aria-live="polite">
                <span class="gallery-current">1</span><span class="gallery-total"> / ${images.length}</span>
              </div>
              <button class="gallery-arrow gallery-next" type="button" aria-label="下一张">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg>
              </button>
            </div>
            <div class="gallery-dots">${dots}</div>
          </div>
        ` : ""}
      </section>
    `;
  }

  function renderHighlights() {
    const highlights = config.highlights || {};
    return `
      <section class="anchor-section" id="highlights">
        <h3>${escapeHtml(highlights.title || "Research highlights")}</h3>
        ${(highlights.projects || [])
          .map(
            (project) => `
              <article class="project-entry">
                <h4>${escapeHtml(project.title)}</h4>
                ${project.summary ? `<p>${escapeHtml(project.summary)}</p>` : ""}
                <div class="figure-row">
                  ${(project.images || [])
                    .map(
                      (image) => `
                        <figure>
                          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.caption || "")}" loading="lazy">
                          <figcaption>${escapeHtml(image.caption || "")}</figcaption>
                        </figure>
                      `
                    )
                    .join("")}
                </div>
                <p class="citation">${richText(project.citation || "")}</p>
              </article>
            `
          )
          .join("")}
      </section>
    `;
  }

  function renderPublications() {
    const publications = config.publications || {};
    return `
      <section class="anchor-section" id="publications">
        <h1>${escapeHtml(publications.title || "Preprints & Publications")}</h1>
        <p class="section-intro">${escapeHtml(publications.intro || "")}</p>
        ${(publications.items || [])
          .map(
            (paper) => `
              <article class="publication-card">
                <div class="publication-content">
                  <h3><a href="${escapeHtml(paper.link || "#")}" ${/^https?:/.test(paper.link || "") ? 'target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(paper.title)}</a></h3>
                  <p>${escapeHtml(paper.authors)}</p>
                  <div class="publication-meta">
                    <p class="publication-venue">${escapeHtml(paper.venue)}${paper.year ? `, ${escapeHtml(paper.year)}` : ""}${paper.status ? ` · ${escapeHtml(paper.status)}` : ""}</p>
                    <p class="publication-links">
                      ${paper.link ? `<a href="${escapeHtml(paper.link)}" target="_blank" rel="noopener noreferrer">DOI / Paper</a>` : ""}
                      ${paper.pdf ? `<a href="${escapeHtml(paper.pdf)}" target="_blank" rel="noopener noreferrer">PDF</a>` : ""}
                    </p>
                  </div>
                </div>
              </article>
              <hr>
            `
          )
          .join("")}
      </section>
    `;
  }

  function renderHonors() {
    const honors = config.honors || {};
    return `
      <section class="anchor-section" id="honors">
        <h1>${escapeHtml(honors.title || "Honors")}</h1>
        <ul class="honor-list">
          ${(honors.items || [])
            .map(
              (item) => `
                <li>
                  ${item.date ? `<span class="honor-date">[${escapeHtml(item.date)}]</span>` : ""}
                  <span class="honor-title"> ${escapeHtml(item.title)}</span>
                  <span class="honor-detail"> ${escapeHtml(item.detail || "")}</span>
                </li>
              `
            )
            .join("")}
        </ul>
      </section>
    `;
  }

  function renderSkills() {
    const skills = config.skills || {};
    if (!skills.title && !(skills.items || []).length) return "";
    return `
      <section class="anchor-section" id="skills">
        <h2>${escapeHtml(skills.title || "Core Skills")}</h2>
        <ul class="skill-list">
          ${(skills.items || [])
            .map(
              (item) => `
                <li>
                  <strong>${escapeHtml(item.title)}.</strong>
                  <span class="skill-detail"> ${escapeHtml(item.detail)}</span>
                </li>
              `
            )
            .join("")}
        </ul>
      </section>
    `;
  }

  function renderInterests() {
    const interests = config.interests || {};
    const videos = (interests.videos || []).filter((video) => video.bvid);
    return `
      <section class="anchor-section" id="interests">
        <h1>${escapeHtml(interests.title || "Interests")}</h1>
        <p>${escapeHtml(interests.text || "")}</p>
        ${videos.length ? `<div class="video-row">${videos.map((video) => `<iframe src="//player.bilibili.com/player.html?bvid=${escapeHtml(video.bvid)}&autoplay=0" title="${escapeHtml(video.title || "")}" loading="lazy" allowfullscreen></iframe>`).join("")}</div>` : ""}
      </section>
    `;
  }

  function renderGuestbook() {
    const guestbook = config.guestbook || {};
    const approved = guestbook.approved || [];
    const endpoint = guestbook.formEndpoint || "";
    const formHtml = endpoint
      ? `
        <form class="guestbook-form" id="guestbook-form" action="${escapeHtml(endpoint)}" method="POST" target="_blank">
          <input type="hidden" name="_subject" value="New homepage guestbook message">
          <label class="form-field">
            <span>Name</span>
            <input type="text" name="name" maxlength="80" required>
          </label>
          <label class="form-field">
            <span>Message</span>
            <textarea name="message" rows="5" maxlength="1200" required></textarea>
          </label>
          <button class="guestbook-submit" type="submit">Send</button>
        </form>
      `
      : "";

    return `
      <section class="anchor-section guestbook" id="guestbook">
        <h1>${escapeHtml(guestbook.title || "Guestbook")}</h1>
        <p class="section-intro">${escapeHtml(guestbook.intro || "")}</p>
        <div class="guestbook-layout">
          ${formHtml}
          <div class="approved-messages">
            <h2>Selected messages</h2>
            ${approved.length
              ? approved
                  .map(
                    (item) => `
                      <article class="guestbook-message">
                        <h3>${escapeHtml(item.name || "Anonymous")}</h3>
                        ${item.date ? `<time>${escapeHtml(item.date)}</time>` : ""}
                        <p>${escapeHtml(item.message || "")}</p>
                      </article>
                    `
                  )
                  .join("")
              : `<p class="empty-note">No published messages yet.</p>`}
          </div>
        </div>
      </section>
    `;
  }

  function renderFooter() {
    const footer = config.footer || {};
    return `<footer class="page-footer">${escapeHtml(footer.note || "")}</footer>`;
  }

  function render() {
    document.title = config.title || "个人学术主页";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = config.description || document.title;
    const brand = document.getElementById("brand-name");
    if (brand) brand.textContent = config.siteName || config.profile?.name || "个人学术主页";

    app.innerHTML = `
      <div class="page-content">
        ${renderProfile()}
        ${renderOverview()}
        ${renderHighlights()}
        ${renderPublications()}
        ${renderHonors()}
        ${renderSkills()}
        ${renderInterests()}
        ${renderGuestbook()}
        ${renderFooter()}
      </div>
    `;

    initOverviewCarousel();
    initNavigation();
  }

  function initOverviewCarousel() {
    const slider = document.getElementById("overview-slider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".overview-slide"));
    const dots = Array.from(slider.querySelectorAll(".gallery-dot"));
    const prev = slider.querySelector(".gallery-prev");
    const next = slider.querySelector(".gallery-next");
    const currentLabel = slider.querySelector(".gallery-current");
    let current = 0;

    function update() {
      slides.forEach((slide, index) => slide.classList.toggle("active", index === current));
      dots.forEach((dot, index) => dot.classList.toggle("active", index === current));
      if (currentLabel) currentLabel.textContent = String(current + 1);
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    }

    prev.addEventListener("click", () => {
      if (current > 0) {
        current -= 1;
        update();
      }
    });

    next.addEventListener("click", () => {
      if (current < slides.length - 1) {
        current += 1;
        update();
      }
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        current = Number(dot.dataset.index);
        update();
      });
    });

    update();
  }

  function initNavigation() {
    const nav = document.getElementById("primary-nav");
    const menuButton = document.getElementById("menu-button");
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(nav.querySelectorAll("a"));

    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "打开导航");
      });
    });

    function onScroll() {
      let currentId = "";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 100) currentId = section.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  render();
})();
