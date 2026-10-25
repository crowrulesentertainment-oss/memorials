
"use strict";

const memorials = [
  {
    id: "sample-01",
    name: "Evelyn Rose Carter",
    born: "1948",
    died: "2024",
    category: "Community",
    location: "Pacific Northwest",
    description: "Remembering a life shaped by kindness, family, and generosity.",
    story: "Evelyn's story is a demonstration profile for CrowRules Memorials. Replace this text with a verified biography shared by an authorized family member or representative.",
    featured: true,
    approved: true,
    initials: "EC"
  },
  {
    id: "sample-02",
    name: "James Michael Bennett",
    born: "1956",
    died: "2023",
    category: "Family",
    location: "Pacific Northwest",
    description: "A tribute to a devoted friend, storyteller, and family man.",
    story: "This sample tribute demonstrates how a memorial can preserve personal stories, meaningful traditions, and the memories people cherish.",
    featured: true,
    approved: true,
    initials: "JB"
  },
  {
    id: "sample-03",
    name: "Margaret Louise Hayes",
    born: "1939",
    died: "2025",
    category: "Arts",
    location: "Pacific Northwest",
    description: "Celebrating a creative spirit and a lifetime of inspiration.",
    story: "This fictional example shows how contributors could celebrate a person's creativity, achievements, relationships, and lasting influence.",
    featured: true,
    approved: true,
    initials: "MH"
  },
  {
    id: "sample-04",
    name: "Robert Daniel Wilson",
    born: "1962",
    died: "2024",
    category: "Service",
    location: "Washington",
    description: "A sample remembrance centered on service and compassion.",
    story: "A real memorial should use information shared with permission and reviewed before public publication.",
    featured: false,
    approved: true,
    initials: "RW"
  },
  {
    id: "sample-05",
    name: "Patricia Anne Morgan",
    born: "1950",
    died: "2022",
    category: "Family",
    location: "Washington",
    description: "A sample tribute to a person whose warmth touched many lives.",
    story: "Family memories, photographs, favorite sayings, and life milestones can help tell a fuller story.",
    featured: false,
    approved: true,
    initials: "PM"
  },
  {
    id: "sample-06",
    name: "Thomas Edward Brooks",
    born: "1944",
    died: "2021",
    category: "Community",
    location: "Pacific Northwest",
    description: "A demonstration memorial about connection and community.",
    story: "This placeholder profile is not intended to represent a real deceased person.",
    featured: false,
    approved: true,
    initials: "TB"
  }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getMemorial(id) {
  return memorials.find(item => item.id === id && item.approved);
}

function memorialCard(item) {
  return `
    <article class="memorial-card">
      <a href="memorial.html?id=${encodeURIComponent(item.id)}"
         aria-label="View memorial for ${escapeHTML(item.name)}">
        <div class="memorial-image" aria-hidden="true">
          ${escapeHTML(item.initials)}
        </div>
      </a>
      <div class="memorial-info">
        <p class="eyebrow">${escapeHTML(item.category)}</p>
        <h3>${escapeHTML(item.name)}</h3>
        <p class="memorial-dates">${escapeHTML(item.born)} — ${escapeHTML(item.died)}</p>
        <p class="memorial-description">${escapeHTML(item.description)}</p>
        <a class="text-link"
           href="memorial.html?id=${encodeURIComponent(item.id)}">
          View memorial →
        </a>
      </div>
    </article>`;
}

function renderFeatured() {
  const target = $("#featured-memorials");
  if (!target) return;

  const items = memorials.filter(item => item.featured && item.approved);
  target.innerHTML = items.length
    ? items.map(memorialCard).join("")
    : "<p>No featured memorials are available yet.</p>";
}

function renderArchive() {
  const target = $("#archive-results");
  if (!target) return;

  const search = ($("#archive-search")?.value || "").trim().toLowerCase();
  const category = $("#archive-category")?.value || "all";
  const sort = $("#archive-sort")?.value || "name";

  let items = memorials.filter(item => item.approved);

  if (search) {
    items = items.filter(item =>
      [item.name, item.description, item.location, item.category]
        .some(value => value.toLowerCase().includes(search))
    );
  }

  if (category !== "all") {
    items = items.filter(item => item.category === category);
  }

  items.sort((a, b) => {
    if (sort === "newest") return Number(b.died) - Number(a.died);
    return a.name.localeCompare(b.name);
  });

  target.innerHTML = items.length
    ? items.map(memorialCard).join("")
    : "<p>No memorials match your search. Try a different term.</p>";

  const count = $("#archive-count");
  if (count) count.textContent = `${items.length} memorial${items.length === 1 ? "" : "s"}`;
}

function renderMemorialDetail() {
  const target = $("#memorial-detail");
  if (!target) return;

  const id = new URLSearchParams(location.search).get("id");
  const item = getMemorial(id);

  if (!item) {
    target.innerHTML = `
      <h1>Memorial not found</h1>
      <p>This memorial may not exist or may not be publicly available.</p>
      <a class="button button-gold" href="archive.html">Return to archive</a>`;
    return;
  }

  document.title = `${item.name} | CrowRules Memorials`;

  target.innerHTML = `
    <div class="detail-banner" aria-hidden="true">${escapeHTML(item.initials)}</div>
    <p class="eyebrow">${escapeHTML(item.category)} · ${escapeHTML(item.location)}</p>
    <h1>${escapeHTML(item.name)}</h1>
    <p class="memorial-dates">${escapeHTML(item.born)} — ${escapeHTML(item.died)}</p>
    <p class="section-copy">${escapeHTML(item.description)}</p>
    <div class="detail-body"><p>${escapeHTML(item.story)}</p></div>
    <div class="hero-actions">
      <a class="button button-gold" href="candlelight.html">Light a Candle</a>
      <a class="button button-outline" href="archive.html">Back to Archive</a>
    </div>
    <p class="form-help">Demonstration content only. Real profiles require verification and appropriate authorization.</p>`;
}

function readLocalList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function renderCandles() {
  const wall = $("#candle-wall");
  if (!wall) return;

  const candles = readLocalList("cr-memorial-candles");
  wall.innerHTML = candles.length
    ? candles.slice().reverse().map(candle => `
      <article class="candle-card">
        <div class="candle-flame" aria-hidden="true">🕯️</div>
        <strong>${escapeHTML(candle.name || "In loving memory")}</strong>
        <p>${escapeHTML(candle.message || "Remembered with love.")}</p>
        <small class="muted">${escapeHTML(candle.date || "")}</small>
      </article>`).join("")
    : "<p class='muted'>Be the first to light a demonstration candle on this device.</p>";
}

function setupCandleForm() {
  const form = $("#candle-form");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !message) return;

    const candles = readLocalList("cr-memorial-candles");
    candles.push({
      name: name.slice(0, 100),
      message: message.slice(0, 500),
      date: new Date().toLocaleDateString()
    });

    try {
      localStorage.setItem("cr-memorial-candles", JSON.stringify(candles));
      form.reset();
      renderCandles();
      $("#candle-status").textContent =
        "Your demonstration candle has been added on this device only.";
    } catch {
      $("#candle-status").textContent =
        "Your browser could not save this candle. Try another browser or device.";
    }
  });
}

function setupSubmissionForm() {
  const form = $("#memorial-form");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const status = $("#submission-status");

    if (!form.reportValidity()) return;

    status.textContent =
      "Demo only: this form is not connected to a server and nothing was submitted. " +
      "A secure backend must be configured before accepting real memorial submissions.";
  });
}

function setupNavigation() {
  const toggle = $(".menu-toggle");
  const nav = $(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  });
}

function renderStories() {
  const target = $("#stories-list");
  if (!target) return;

  const items = memorials.filter(item => item.approved);
  target.innerHTML = items.map(item => `
    <article class="story-card">
      <p class="story-meta">LIFE STORY · ${escapeHTML(item.category.toUpperCase())}</p>
      <h2>${escapeHTML(item.name)}</h2>
      <p class="memorial-dates">${escapeHTML(item.born)} — ${escapeHTML(item.died)}</p>
      <p>${escapeHTML(item.description)}</p>
      <a class="text-link" href="memorial.html?id=${encodeURIComponent(item.id)}">
        Read tribute →
      </a>
    </article>`).join("");
}

function renderCalendar() {
  const target = $("#calendar-list");
  if (!target) return;

  target.innerHTML = `
    <article class="calendar-item">
      <div class="calendar-date">01<br><small>JAN</small></div>
      <div><h3>New Year of Remembrance</h3>
        <p class="muted">A gentle moment to carry memories forward.</p></div>
    </article>
    <article class="calendar-item">
      <div class="calendar-date">May<br><small>ANNUAL</small></div>
      <div><h3>Memorial Day</h3>
        <p class="muted">Remembering those who died in military service.</p></div>
    </article>
    <article class="calendar-item">
      <div class="calendar-date">Dec<br><small>ANNUAL</small></div>
      <div><h3>Season of Remembrance</h3>
        <p class="muted">Making room for reflection, stories, and connection.</p></div>
    </article>
    <p class="form-help">This is a starter calendar, not a live calendar of verified individual anniversaries.</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  $$("[data-year]").forEach(element => {
    element.textContent = String(new Date().getFullYear());
  });

  setupNavigation();
  renderFeatured();
  renderArchive();
  renderMemorialDetail();
  renderStories();
  renderCalendar();
  renderCandles();
  setupCandleForm();
  setupSubmissionForm();

  ["#archive-search", "#archive-category", "#archive-sort"].forEach(selector => {
    $(selector)?.addEventListener("input", renderArchive);
    $(selector)?.addEventListener("change", renderArchive);
  });
});
