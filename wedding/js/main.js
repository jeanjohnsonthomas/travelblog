/* global $, bootstrap */

// ---- Edit these values to customize your site ----
const WEDDING = {
  couple: "Jean Johnson & Lincy Merin Joy",
  dateISO: "2026-05-23T16:00:00", // Local time on viewer device
  city: "City, Country",
  ceremony: {
    name: "Ceremony Venue Name",
    address: "Bishop Pereira Hall",
    time: "4:00 PM",
  },
  reception: {
    name: "Reception Venue Name",
    address: "Dilash Wedding & Events Centre Attingal Alamcode",
    time: "6:30 PM",
  },
};

function setText(selector, value) {
  $(selector).each(function () {
    $(this).text(value);
  });
}

function mapsEmbedUrl(address) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function mapsDirectionsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const target = new Date(WEDDING.dateISO);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (Number.isNaN(target.getTime())) {
    $("#cdDays,#cdHours,#cdMins,#cdSecs").text("—");
    return;
  }

  if (diff <= 0) {
    $("#cdDays").text("0");
    $("#cdHours").text("0");
    $("#cdMins").text("0");
    $("#cdSecs").text("0");
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  $("#cdDays").text(String(days));
  $("#cdHours").text(pad2(hours));
  $("#cdMins").text(pad2(mins));
  $("#cdSecs").text(pad2(secs));
}

function formatDateForDisplay(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function buildIcs() {
  const start = new Date(WEDDING.dateISO);
  if (Number.isNaN(start.getTime())) return null;

  // Default 6 hours event
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const dt = (d) =>
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(
      d.getUTCMinutes()
    )}${pad2(d.getUTCSeconds())}Z`;

  const title = `${WEDDING.couple} Wedding`;
  const location = `${WEDDING.ceremony.name} - ${WEDDING.ceremony.address}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@wedding-invite`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    "DESCRIPTION:Wedding celebration. See the invite page for details.",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function toast(message) {
  const $host = $("#toastHost");
  if ($host.length === 0) {
    $("body").append(
      `<div id="toastHost" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1080;"></div>`
    );
  }

  const id = `t${Date.now()}`;
  $("#toastHost").append(`
    <div id="${id}" class="toast text-bg-dark border-0" role="status" aria-live="polite" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${$("<div>").text(message).html()}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `);

  const el = document.getElementById(id);
  const t = bootstrap.Toast.getOrCreateInstance(el, { delay: 2600 });
  t.show();
  el.addEventListener(
    "hidden.bs.toast",
    () => {
      el.remove();
    },
    { once: true }
  );
}

function smoothScrollInit() {
  $('a[href^="#"]').on("click", function (e) {
    const href = $(this).attr("href");
    if (!href || href === "#") return;

    const $target = $(href);
    if ($target.length === 0) return;

    e.preventDefault();
    const y = $target.offset().top - 78; // account for fixed nav
    window.scrollTo({ top: y, behavior: "smooth" });

    // Close mobile nav when selecting a link
    const navEl = document.getElementById("nav");
    if (navEl && navEl.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(navEl).hide();
    }
  });
}

function navActiveSectionInit() {
  const ids = ["gallery", "schedule", "locations"];
  const links = ids.map((id) => ({ id, $a: $(`a.nav-link[href="#${id}"]`) }));

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((l) => l.$a.removeClass("active"));
      const hit = links.find((l) => l.id === visible.target.id);
      if (hit) hit.$a.addClass("active");
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: [0.1, 0.2, 0.35] }
  );

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}

function applyConfigToDom() {
  document.title = `${WEDDING.couple} — Wedding Invitation`;
  setText("[data-couple]", WEDDING.couple);

  setText("[data-city]", WEDDING.city);
  setText("[data-ceremony-name]", WEDDING.ceremony.name);
  setText("[data-ceremony-address]", WEDDING.ceremony.address);
  setText("[data-ceremony-time]", WEDDING.ceremony.time);

  setText("[data-reception-name]", WEDDING.reception.name);
  setText("[data-reception-address]", WEDDING.reception.address);
  setText("[data-reception-time]", WEDDING.reception.time);

  const weddingDate = formatDateForDisplay(WEDDING.dateISO);
  if (weddingDate) setText("[data-wedding-date]", weddingDate);

  $("#ceremonyMap").attr("src", mapsEmbedUrl(WEDDING.ceremony.address));
  $("#receptionMap").attr("src", mapsEmbedUrl(WEDDING.reception.address));
  $("#ceremonyDirections").attr("href", mapsDirectionsUrl(WEDDING.ceremony.address));
  $("#receptionDirections").attr("href", mapsDirectionsUrl(WEDDING.reception.address));
}

function initPhotoModal() {
  const modalEl = document.getElementById("photoModal");
  if (!modalEl) return;

  modalEl.addEventListener("show.bs.modal", function (event) {
    const trigger = event.relatedTarget;
    if (!trigger) return;

    const src = trigger.getAttribute("data-photo");
    if (!src) return;

    const img = document.getElementById("photoModalImg");
    if (!img) return;
    img.setAttribute("src", src);
  });

  modalEl.addEventListener("hidden.bs.modal", function () {
    const img = document.getElementById("photoModalImg");
    if (img) img.removeAttribute("src");
  });
}

function initGalleryRail() {
  const track = document.getElementById("galleryTrack");
  if (!track) return;

  const scrollByCard = (dir) => {
    const first = track.querySelector(".polaroid");
    const cardW = first ? first.getBoundingClientRect().width : 280;
    track.scrollBy({ left: dir * (cardW + 14), behavior: "smooth" });
  };

  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  if (prev) prev.addEventListener("click", () => scrollByCard(-1));
  if (next) next.addEventListener("click", () => scrollByCard(1));
}

function initCopyButtons() {
  $("#copyCeremonyAddress").on("click", async function () {
    const ok = await copyText(WEDDING.ceremony.address);
    toast(ok ? "Ceremony address copied." : "Couldn't copy address.");
  });
  $("#copyReceptionAddress").on("click", async function () {
    const ok = await copyText(WEDDING.reception.address);
    toast(ok ? "Reception address copied." : "Couldn't copy address.");
  });
}

function initCalendarButton() {
  $("#addToCalendarBtn").on("click", function () {
    const ics = buildIcs();
    if (!ics) {
      toast("Set a valid date in WEDDING.dateISO first.");
      return;
    }
    downloadTextFile("wedding.ics", ics, "text/calendar;charset=utf-8");
    toast("Calendar file downloaded.");
  });
}

$(function () {
  applyConfigToDom();

  smoothScrollInit();
  navActiveSectionInit();

  initPhotoModal();
  initGalleryRail();
  initCopyButtons();
  initCalendarButton();

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
});

