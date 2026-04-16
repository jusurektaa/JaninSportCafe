(function () {
  "use strict";

  var nodes = document.querySelectorAll(".home-reveal");
  if (!nodes.length) return;

  function revealAll() {
    nodes.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  if (!("IntersectionObserver" in window)) {
    revealAll();
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealAll();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -6% 0px",
      threshold: 0.08
    }
  );

  nodes.forEach(function (el) {
    observer.observe(el);
  });
})();
