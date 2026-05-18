if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const navbar = document.querySelector(".navbar");
const navLinks = document.querySelector(".nav-links");
const navItems = typeof gsap !== "undefined" ? gsap.utils.toArray(".nav-links a") : [...document.querySelectorAll(".nav-links a")];
const heroTitle = document.querySelector(".hero h1");
const galleryImages = document.querySelectorAll(".gallery-grid img");
const galleryLightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
let activeGalleryIndex = 0;
const emailConfig = {
  publicKey: "on7zLzPv8bW8MG_vK",
  serviceId: "service_37i7cbs",
  templateId: "template_lzii4hx",
  fallbackEmail: "info@velankannigreencityrotary.org",
};

if (heroTitle) {
  const titleText = heroTitle.textContent.trim();
  heroTitle.setAttribute("aria-label", titleText);
  heroTitle.innerHTML = titleText
    .split(" ")
    .map((word) => {
      const letters = [...word].map((letter) => `<span class="title-letter" aria-hidden="true">${letter}</span>`).join("");
      return `<span class="title-word">${letters}</span>`;
    })
    .join(" ");
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

let lastScrollY = window.scrollY;
let scrollTicking = false;

function updateNavbarVisibility() {
  if (!navbar) return;

  const currentScrollY = Math.max(window.scrollY, 0);
  const scrollingDown = currentScrollY > lastScrollY;
  const isMenuOpen = document.body.classList.contains("nav-open");

  navbar.classList.toggle("is-hidden", currentScrollY > 80 && scrollingDown && !isMenuOpen);
  lastScrollY = currentScrollY;
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;

    scrollTicking = true;
    window.requestAnimationFrame(updateNavbarVisibility);
  },
  { passive: true }
);

function showGalleryImage(index) {
  if (!galleryLightbox || !lightboxImage) return;

  activeGalleryIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[activeGalleryIndex];

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || "Gallery image preview";
}

function openGalleryLightbox(index) {
  if (!galleryLightbox || !lightboxImage || galleryImages.length === 0) return;

  showGalleryImage(index);
  galleryLightbox.classList.add("is-open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !lightboxImage) return;

  galleryLightbox.classList.remove("is-open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
  lightboxImage.alt = "";
}

galleryImages.forEach((image, index) => {
  image.setAttribute("tabindex", "0");
  image.addEventListener("click", () => openGalleryLightbox(index));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGalleryLightbox(index);
    }
  });
});

lightboxClose?.addEventListener("click", closeGalleryLightbox);
lightboxPrev?.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));
lightboxNext?.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));

galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) {
    closeGalleryLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!galleryLightbox?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    closeGalleryLightbox();
  } else if (event.key === "ArrowLeft") {
    showGalleryImage(activeGalleryIndex - 1);
  } else if (event.key === "ArrowRight") {
    showGalleryImage(activeGalleryIndex + 1);
  }
});

// Initialize EmailJS
if (typeof emailjs !== "undefined" && typeof emailjs.init === "function") {
  emailjs.init({ publicKey: emailConfig.publicKey });
} else {
  console.error("EmailJS library is not loaded. Make sure the EmailJS SDK script is included before script.js.");
}

const joinForm = document.querySelector(".join-form");

function openMailFallback(form) {
  const formData = new FormData(form);
  const name = formData.get("name") || "";
  const email = formData.get("email") || "";
  const phone = formData.get("phone") || "";
  const message = formData.get("message") || "";
  const subject = encodeURIComponent("New Rotary Club enquiry");
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`);

  window.location.href = `mailto:${emailConfig.fallbackEmail}?subject=${subject}&body=${body}`;
}

joinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const originalButtonText = button?.textContent || "Send Interest";

  // Disable button and show loading state
  if (button) {
    button.disabled = true;
    button.textContent = "Sending...";
  }

  if (status) {
    status.textContent = "";
  }

  try {
    if (typeof emailjs === "undefined" || typeof emailjs.sendForm !== "function") {
      throw new Error("EmailJS is not available");
    }

    const response = await emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form);

    if (response.status === 200) {
      if (status) {
        status.textContent = "Thank you! Your interest has been sent. The club team will connect with you soon.";
        status.style.color = "#10b981";
      }
      form.reset();
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error("Email send failed:", error);
    if (status) {
      status.textContent = "Email app is opening with your message. Please press send there.";
      status.style.color = "#f59e0b";
    }
    openMailFallback(form);
  } finally {
    // Re-enable button
    if (button) {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  }
});

if (!prefersReducedMotion && typeof gsap !== "undefined") {
  gsap.set([".logo-mark", ".hero-kicker", ".hero h1", ".hero-tagline", ".hero-cta"], {
    autoAlpha: 0,
  });

  gsap.set(".title-letter", {
    display: "inline-block",
    autoAlpha: 0,
    y: () => gsap.utils.random(-90, 110),
    x: () => gsap.utils.random(-130, 130),
    rotate: () => gsap.utils.random(-28, 28),
    scale: () => gsap.utils.random(0.72, 1.18),
  });

  const heroTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });

  heroTimeline
    .fromTo(".logo-mark", { scale: 0, rotate: -10 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1 })
    .to(".logo-mark", { filter: "drop-shadow(0 0 36px rgba(212, 175, 55, 0.72))", duration: 0.9 }, "-=0.35")
    .fromTo(".hero-kicker", { y: 32 }, { y: 0, autoAlpha: 1, duration: 0.8 }, "-=0.45")
    .to(".hero h1", { autoAlpha: 1, duration: 0.1 }, "-=0.2")
    .to(
      ".title-letter",
      {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.95,
        stagger: 0.025,
        ease: "back.out(1.7)",
      },
      "-=0.05"
    )
    .fromTo(".hero-tagline", { y: 28 }, { y: 0, autoAlpha: 1, duration: 0.85 }, "-=0.25")
    .fromTo(".hero-cta", { y: 18, scale: 0.9 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "back.out(1.8)" }, "-=0.2")
    .to(".hero-cta", { y: -8, duration: 0.35, yoyo: true, repeat: 1, ease: "power2.out" });

  gsap.to(".hero-bg", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".hero-content", {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
    },
  });

  gsap.to(".boat-one", {
    yPercent: -28,
    xPercent: 8,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.8,
    },
  });

  gsap.to(".boat-two", {
    yPercent: -18,
    xPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.8,
    },
  });

  gsap.to(".boat-three", {
    yPercent: -38,
    xPercent: 14,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.8,
    },
  });

  gsap.from(".about-copy", {
    x: -70,
    autoAlpha: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".about",
      start: "top 72%",
    },
  });

  gsap.from(".about-visual", {
    x: 60,
    autoAlpha: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".about",
      start: "top 72%",
    },
  });

  gsap.to(".parallax-panel img", {
    yPercent: -9,
    ease: "none",
    scrollTrigger: {
      trigger: ".about",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.from(".project-card", {
    y: 46,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".project-grid",
      start: "top 78%",
    },
  });

  gsap.utils.toArray(".project-card img").forEach((image) => {
    gsap.fromTo(
      image,
      { yPercent: -8, scale: 1.08 },
      {
        yPercent: 8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      }
    );
  });

  gsap.from(".impact .section-copy", {
    x: -42,
    autoAlpha: 0,
    duration: 0.9,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".impact",
      start: "top 70%",
    },
  });

  gsap.to(".impact", {
    backgroundPosition: "center 28%",
    ease: "none",
    scrollTrigger: {
      trigger: ".impact",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.8,
    },
  });

  gsap.from(".impact-stat", {
    y: 42,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".impact-grid",
      start: "top 76%",
    },
  });

  gsap.utils.toArray(".counter").forEach((counter) => {
    const target = Number(counter.dataset.target);
    const count = { value: 0 };

    gsap.to(count, {
      value: target,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top 82%",
        once: true,
      },
      onUpdate: () => {
        counter.textContent = Math.round(count.value).toLocaleString("en-IN");
      },
    });
  });

  gsap.utils.toArray(".timeline-item").forEach((item, index) => {
    gsap.from(item, {
      x: index % 2 === 0 ? -70 : 70,
      autoAlpha: 0,
      duration: 0.95,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 82%",
      },
    });

    gsap.to(item, {
      yPercent: index % 2 === 0 ? -7 : 7,
      ease: "none",
      scrollTrigger: {
        trigger: item,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  });

  gsap.from(".gallery-grid img", {
    scale: 0.92,
    autoAlpha: 0,
    duration: 0.85,
    stagger: 0.09,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".gallery-grid",
      start: "top 78%",
    },
  });

  gsap.utils.toArray(".gallery-grid img").forEach((image, index) => {
    gsap.to(image, {
      yPercent: index % 2 === 0 ? -2 : 2,
      ease: "none",
      scrollTrigger: {
        trigger: image,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7,
      },
    });
  });

  gsap.from(".join .section-copy, .join-form", {
    y: 42,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.14,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".join",
      start: "top 72%",
    },
  });

  gsap.to(".pulse-button", {
    scale: 1.035,
    repeat: -1,
    yoyo: true,
    duration: 1,
    ease: "power2.inOut",
  });

  gsap.utils.toArray(".project-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -7,
        scale: 1.02,
        boxShadow: "0 28px 74px rgba(15, 61, 46, 0.22)",
        duration: 0.35,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 22px 70px rgba(15, 61, 46, 0.16)",
        duration: 0.35,
        ease: "power2.out",
      });
    });
  });

  gsap.from(".contact .section-copy, .map-placeholder", {
    y: 42,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.14,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".contact",
      start: "top 76%",
    },
  });
}

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  const sections = gsap.utils.toArray("main section[id]");

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;

        navItems.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`);
        });
      },
    });
  });
}
