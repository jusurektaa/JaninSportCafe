(function () {
  "use strict";

  function closeAll() {
    document.querySelectorAll(".nav.nav--primary.is-open").forEach(function (nav) {
      nav.classList.remove("is-open");
    });
    document.querySelectorAll(".nav-toggle").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Avaa valikko");
    });
  }

  document.querySelectorAll(".nav-toggle").forEach(function (btn) {
    var navId = btn.getAttribute("aria-controls");
    var nav = navId ? document.getElementById(navId) : null;
    if (!nav) return;

    btn.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      closeAll();
      if (open) {
        nav.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-label", "Sulje valikko");
      }
    });
  });

  document.querySelectorAll(".nav.nav--primary a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 47.98rem)").matches) {
        closeAll();
      }
    });
  });

  var mq = window.matchMedia("(min-width: 48rem)");
  function onWide() {
    if (mq.matches) closeAll();
  }
  if (mq.addEventListener) {
    mq.addEventListener("change", onWide);
  } else {
    mq.addListener(onWide);
  }
  window.addEventListener("resize", onWide);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });
})();
