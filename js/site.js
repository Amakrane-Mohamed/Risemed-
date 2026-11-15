(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  var topbar = document.querySelector(".top");
  if (!btn || !nav || !topbar) return;

  function paint() {
    var open = nav.classList.contains("open");
    topbar.classList.toggle("solid", open || window.scrollY > 12);
  }

  function setOpen(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    paint();
  }

  btn.addEventListener("click", function () {
    setOpen(!nav.classList.contains("open"));
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });
  window.addEventListener("scroll", paint, { passive: true });
  paint();

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".cover-copy > *", {
    y: 22,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out",
    delay: 0.1
  });
  gsap.fromTo(".cover img", { scale: 1 }, { scale: 1.08, duration: 20, ease: "none" });

  ScrollTrigger.batch(".dock article, .tile, .ticket, .lang-col li, .funder-cards article, .founder", {
    start: "top 90%",
    once: true,
    onEnter: function (batch) {
      gsap.from(batch, {
        y: 18,
        duration: 0.55,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "transform"
      });
    }
  });

  gsap.utils.toArray(".section-head, .questions h2, .split h2, .close-inner").forEach(function (el) {
    gsap.from(el, {
      y: 16,
      duration: 0.55,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 90%" }
    });
  });
})();
