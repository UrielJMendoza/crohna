/* ═══════════════════════════════════════════════════════
   CHRONO — Script
   ═══════════════════════════════════════════════════════ */

// ── Demo Data ──
const demoEvents = [
  {
    id: "1", title: "Started College", date: "2022-08-20",
    location: "Boulder, CO", lat: 40.015, lng: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    description: "Began my journey at the University of Colorado Boulder, studying Computer Science.",
    category: "education"
  },
  {
    id: "2", title: "First Hackathon", date: "2022-10-15",
    location: "Boulder, CO", lat: 40.015, lng: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    description: "Participated in HackCU and built a real-time collaboration tool. Won 'Most Creative' award.",
    category: "achievement"
  },
  {
    id: "3", title: "Winter Break in New York", date: "2022-12-18",
    location: "New York, NY", lat: 40.7128, lng: -74.006,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    description: "Spent the holidays exploring NYC for the first time. Times Square on New Year's Eve was unforgettable.",
    category: "travel"
  },
  {
    id: "6", title: "Started First Internship", date: "2023-06-01",
    location: "San Francisco, CA", lat: 37.7749, lng: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80",
    description: "Software engineering internship at a startup in SOMA. Built features used by thousands.",
    category: "career"
  },
  {
    id: "9", title: "Published First Research Paper", date: "2023-11-20",
    location: "Boulder, CO", lat: 40.015, lng: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    description: "Co-authored a paper on natural language processing accepted to a workshop at NeurIPS.",
    category: "achievement"
  },
  {
    id: "12", title: "Summer Internship at Tech Giant", date: "2024-05-20",
    location: "Seattle, WA", lat: 47.6062, lng: -122.3321,
    imageUrl: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800&q=80",
    description: "Interned at a major tech company working on cloud infrastructure. Shipped a feature in week three.",
    category: "career"
  },
  {
    id: "13", title: "Hiked Mount Rainier", date: "2024-07-20",
    location: "Mount Rainier, WA", lat: 46.8523, lng: -121.7603,
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    description: "Summited Camp Muir at 10,000 feet. The sunrise above the clouds was breathtaking.",
    category: "travel"
  },
  {
    id: "15", title: "Launched Side Project", date: "2024-11-01",
    location: "Boulder, CO", lat: 40.015, lng: -105.2705,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    description: "Shipped Chrono v1 — a life timeline app. Hit 500 users in the first week.",
    category: "achievement"
  },
  {
    id: "16", title: "Accepted Full-Time Offer", date: "2024-12-10",
    location: "San Francisco, CA", lat: 37.7749, lng: -122.4194,
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    description: "Accepted a software engineer role starting after graduation. Dreams becoming reality.",
    category: "career"
  }
];

const mapLocations = [
  { name: "Boulder, CO", lat: 40.015, lng: -105.2705, count: 7 },
  { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, count: 3 },
  { name: "New York, NY", lat: 40.7128, lng: -74.006, count: 1 },
  { name: "Seattle, WA", lat: 47.6062, lng: -122.3321, count: 2 },
  { name: "Denver, CO", lat: 39.7392, lng: -104.9903, count: 1 },
  { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, count: 1 },
  { name: "Vail, CO", lat: 39.6403, lng: -106.3742, count: 1 }
];

const storyData = {
  period: "2024",
  title: "Your 2024",
  summary: "2024 was a year of breakthroughs. You completed your second internship at a major tech company in Seattle, summited Mount Rainier, launched your first product, and secured a full-time job offer. You traveled to four cities and captured over 600 photos. This was the year your ambitions became achievements.",
  highlights: [
    "Completed internship at a major tech company",
    "Launched Chrono and reached 500 users",
    "Accepted full-time software engineer offer",
    "Summited Camp Muir on Mount Rainier",
    "Gave first conference lightning talk"
  ],
  stats: { Events: 7, Cities: 4, Photos: 623, "Top Month": "July" }
};

const yearlyEvents = [
  { year: 2022, count: 3 },
  { year: 2023, count: 6 },
  { year: 2024, count: 7 }
];

// ── Helpers ──
function getSeason(dateStr) {
  const month = new Date(dateStr).getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", year: "numeric"
  });
}

// ═══════════════════════════════════════════════════════
// 1. Loading Screen
// ═══════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loading-screen");
  setTimeout(() => {
    loader.classList.add("exit");
    setTimeout(() => loader.remove(), 800);
  }, 2000);

  initStarField();
  initMarquee();
  initScrollProgress();
  initNavScroll();
  initHamburger();
  initFadeUpObserver();
  initParallax();
  renderTimelineCards();
  renderStoryCard();
  renderChart();
  initCountUp();

  // Delay map init slightly for Leaflet to be ready
  setTimeout(initMap, 300);
});

// ═══════════════════════════════════════════════════════
// 2. Star Field — 60 procedural breathing dots
// ═══════════════════════════════════════════════════════
function initStarField() {
  const container = document.getElementById("star-field");
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.setProperty("--dur", (3 + Math.random() * 4) + "s");
    star.style.setProperty("--delay", (Math.random() * 5) + "s");

    // Vary size slightly
    const size = 1 + Math.random() * 1.5;
    star.style.width = size + "px";
    star.style.height = size + "px";

    container.appendChild(star);
  }
}

// ═══════════════════════════════════════════════════════
// 3. Marquee
// ═══════════════════════════════════════════════════════
function initMarquee() {
  const text = "MEMORIES \u00B7 MILESTONES \u00B7 PLACES \u00B7 2022 \u00B7 2023 \u00B7 2024 \u00B7 YOUR STORY \u00B7 ";
  const repeated = text.repeat(12);

  // Primary track
  const primary = document.getElementById("marquee-track");
  primary.innerHTML = `<span class="marquee-text">${repeated}</span><span class="marquee-text">${repeated}</span>`;

  // Clone tracks
  document.querySelectorAll(".marquee-track-clone").forEach(el => {
    el.innerHTML = `<span class="marquee-text">${repeated}</span><span class="marquee-text">${repeated}</span>`;
    el.style.animation = "marqueeScroll 40s linear infinite";
  });
}

// ═══════════════════════════════════════════════════════
// 4. Scroll Progress Bar
// ═══════════════════════════════════════════════════════
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════
// 5. Navigation — scroll detection
// ═══════════════════════════════════════════════════════
function initNavScroll() {
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════
// 6. Hamburger Menu
// ═══════════════════════════════════════════════════════
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");

  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    menu.classList.toggle("open");
    document.body.style.overflow = menu.classList.contains("open") ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      btn.classList.remove("open");
      menu.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
}

// ═══════════════════════════════════════════════════════
// 7. Fade-Up Scroll Reveals (IntersectionObserver)
// ═══════════════════════════════════════════════════════
function initFadeUpObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "-50px" });

  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════
// 8. Ghost Year Parallax (0.3x scroll speed)
// ═══════════════════════════════════════════════════════
function initParallax() {
  const ghosts = document.querySelectorAll("[data-parallax]");
  if (!ghosts.length) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    ghosts.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.parentElement.getBoundingClientRect();
      const offset = (scrollY + rect.top) * speed * -0.3;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════
// 9. Timeline Cards
// ═══════════════════════════════════════════════════════
function renderTimelineCards() {
  const container = document.getElementById("timeline-cards");
  const previewEvents = demoEvents.slice(0, 3);

  container.innerHTML = previewEvents.map((event, i) => `
    <div class="timeline-card fade-up" data-delay="${i + 1}">
      <img
        class="timeline-card-img"
        src="${event.imageUrl}"
        alt="${event.title}"
        loading="lazy"
      />
      <div class="timeline-card-body">
        <div class="timeline-card-meta">
          <span class="timeline-card-season">${getSeason(event.date)}</span>
          <span class="timeline-card-location">${event.location || ""}</span>
        </div>
        <h3 class="timeline-card-title">${event.title}</h3>
        <p class="timeline-card-desc">${event.description}</p>
      </div>
    </div>
  `).join("");

  // Re-observe new fade-up elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "-50px" });

  container.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════
// 10. Story Card
// ═══════════════════════════════════════════════════════
function renderStoryCard() {
  const container = document.getElementById("story-card");
  const s = storyData;

  const statsHTML = Object.entries(s.stats).map(([label, value]) =>
    `<div class="story-stat">
      <div class="story-stat-value">${value}</div>
      <div class="story-stat-label">${label}</div>
    </div>`
  ).join("");

  const highlightsHTML = s.highlights.map(h =>
    `<li>${h}</li>`
  ).join("");

  container.innerHTML = `
    <div class="story-period">${s.period}</div>
    <h3 class="story-title">${s.title}</h3>
    <p class="story-summary">${s.summary}</p>
    <ul class="story-highlights">${highlightsHTML}</ul>
    <div class="story-stats">${statsHTML}</div>
  `;
}

// ═══════════════════════════════════════════════════════
// 11. Insights Chart
// ═══════════════════════════════════════════════════════
function renderChart() {
  const container = document.getElementById("chart-bars");
  const maxCount = Math.max(...yearlyEvents.map(y => y.count));

  container.innerHTML = yearlyEvents.map(y => {
    const heightPct = (y.count / maxCount) * 100;
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height: 0%;" data-height="${heightPct}"></div>
        <div class="chart-bar-label">${y.year}</div>
      </div>
    `;
  }).join("");

  // Animate bars on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".chart-bar").forEach(bar => {
          setTimeout(() => {
            bar.style.height = bar.dataset.height + "%";
          }, 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}

// ═══════════════════════════════════════════════════════
// 12. Count-Up Animation
// ═══════════════════════════════════════════════════════
function initCountUp() {
  const counters = document.querySelectorAll("[data-count]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1500;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════
// 13. Leaflet.js Map
// ═══════════════════════════════════════════════════════
function initMap() {
  if (typeof L === "undefined") return;

  const map = L.map("leaflet-map", {
    center: [39.5, -98.35],
    zoom: 4,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false
  });

  // CartoDB Dark Matter tiles
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19
  }).addTo(map);

  // Add zoom control to bottom-right
  L.control.zoom({ position: "bottomright" }).addTo(map);

  // Custom gold markers
  const markerIcon = L.divIcon({
    className: "",
    html: '<div class="gold-marker"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10]
  });

  // Place markers
  const coords = [];
  mapLocations.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon }).addTo(map);
    marker.bindPopup(`
      <div class="popup-title">${loc.name}</div>
      <div class="popup-location">${loc.count} ${loc.count === 1 ? "memory" : "memories"}</div>
    `);
    coords.push([loc.lat, loc.lng]);
  });

  // Dashed gold polyline connecting locations
  if (coords.length > 1) {
    L.polyline(coords, {
      color: "rgba(201,169,110,0.15)",
      weight: 1,
      dashArray: "6 8"
    }).addTo(map);
  }

  // Fit bounds with padding
  if (coords.length > 0) {
    map.fitBounds(coords, { padding: [40, 40] });
  }
}
