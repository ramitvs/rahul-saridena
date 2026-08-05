/* ============================================
   DR. RAHUL SARIDENA - MAIN JAVASCRIPT
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ── 1. NAVBAR SCROLL ─────────────────────── */
  const navbar = document.querySelector(".navbar");
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 60) {
          navbar?.classList.add("scrolled");
        } else {
          navbar?.classList.remove("scrolled");
        }
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ── 2. MOBILE MENU ───────────────────────── */
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");
  const closeBtn = document.querySelector(".mobile-nav .close-btn");

  hamburger?.addEventListener("click", () => {
    mobileNav?.classList.add("open");
    document.body.style.overflow = "hidden";
  });
  closeBtn?.addEventListener("click", () => {
    mobileNav?.classList.remove("open");
    document.body.style.overflow = "";
  });
  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  /* ── 3. ACTIVE NAV LINK ───────────────────── */
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  /* ── 4. HERO BG TRANSITION ────────────────── */
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg) {
    heroBg.classList.add("loaded");
  }

  /* ── 5. SCROLL REVEAL ─────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ── 6. COUNTER ANIMATION ─────────────────── */
  function animateCounter(el, target, suffix) {
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            const target = parseInt(el.dataset.counter);
            const suffix = el.dataset.suffix || "";
            animateCounter(el, target, suffix);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ── 7. GALLERY FILTER ────────────────────── */
  const filterBtns = document.querySelectorAll("[data-filter]");
  const galleryItems = document.querySelectorAll("[data-category]");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      galleryItems.forEach((item) => {
        const cat = item.dataset.category;
        if (filter === "all" || cat === filter) {
          item.classList.remove("hidden");
          item.style.opacity = "0";
          item.style.transform = "scale(0.95)";
          setTimeout(() => {
            item.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 50);
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  /* ── 8. LIGHTBOX ──────────────────────────── */
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox-img");
  const lightboxCap = document.querySelector(".lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");
  const lbPrev = document.querySelector(".lightbox-prev");
  const lbNext = document.querySelector(".lightbox-next");

  let currentLightboxIndex = 0;
  let galleryImgs = [];

  if (lightbox) {
    galleryImgs = [...document.querySelectorAll(".gallery-item img")];

    document.querySelectorAll(".gallery-item").forEach((item, i) => {
      item.addEventListener("click", () => {
        openLightbox(i);
      });
    });

    function openLightbox(index) {
      currentLightboxIndex = index;
      const src = galleryImgs[index]?.src;
      const title = galleryImgs[index]?.alt || "";
      if (lightboxImg) lightboxImg.src = src;
      if (lightboxCap)
        lightboxCap.textContent = `${index + 1} / ${galleryImgs.length} - ${title}`;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    lbClose?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    lbPrev?.addEventListener("click", () => {
      currentLightboxIndex =
        (currentLightboxIndex - 1 + galleryImgs.length) % galleryImgs.length;
      openLightbox(currentLightboxIndex);
    });

    lbNext?.addEventListener("click", () => {
      currentLightboxIndex = (currentLightboxIndex + 1) % galleryImgs.length;
      openLightbox(currentLightboxIndex);
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbPrev?.click();
      if (e.key === "ArrowRight") lbNext?.click();
    });
  }

  /* ── 9. CONTACT FORM ──────────────────────── */
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    const inputs = contactForm.querySelectorAll(
      "input[required], textarea[required], select[required]",
    );

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) =>
      phone === "" ||
      /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{7,15}$/.test(phone);

    // Clear error style
    const clearError = (input) => {
      const group = input.closest(".form-group");
      if (group) {
        group.classList.remove("has-error");
        const existingError = group.querySelector(".form-error-msg");
        if (existingError) existingError.remove();
      }
    };

    // Show error style
    const showError = (input, message) => {
      clearError(input);
      const group = input.closest(".form-group");
      if (group) {
        group.classList.add("has-error");
        const errorMsg = document.createElement("div");
        errorMsg.className = "form-error-msg";
        errorMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
        group.appendChild(errorMsg);
      }
    };

    const validateField = (input) => {
      const val = input.value.trim();
      if (input.hasAttribute("required") && val === "") {
        showError(input, "This field is required");
        return false;
      }
      if (val !== "" && input.type === "email" && !validateEmail(val)) {
        showError(input, "Please enter a valid email address");
        return false;
      }
      if (val !== "" && input.type === "tel" && !validatePhone(val)) {
        showError(input, "Please enter a valid phone number");
        return false;
      }
      if (val !== "" && input.id === "contact-name" && val.length < 2) {
        showError(input, "Name must be at least 2 characters");
        return false;
      }
      if (val !== "" && input.id === "contact-message" && val.length < 5) {
        showError(input, "Message must be at least 5 characters");
        return false;
      }
      clearError(input);
      return true;
    };

    // Real-time validation
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (input.value.trim() !== "") clearError(input);
      });
      input.addEventListener("blur", () => {
        validateField(input);
      });
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Anti-spam honeypot check
      const honey = contactForm.querySelector('input[name="_honey"]');
      if (honey && honey.value) {
        showToast("Submission ignored (spam detected).", "warning");
        return;
      }

      let isValid = true;
      const allInputs = contactForm.querySelectorAll("input, textarea, select");
      allInputs.forEach((input) => {
        if (!validateField(input)) isValid = false;
      });

      if (!isValid) {
        const firstError = contactForm.querySelector(".has-error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...`;
      btn.disabled = true;

      const nameVal =
        contactForm.querySelector("#contact-name")?.value.trim() || "";
      const phoneVal =
        contactForm.querySelector("#contact-phone")?.value.trim() ||
        "Not provided";
      const emailVal =
        contactForm.querySelector("#contact-email")?.value.trim() || "";
      const subjectVal =
        contactForm.querySelector("#contact-subject")?.value ||
        "General Inquiry";
      const messageVal =
        contactForm.querySelector("#contact-message")?.value.trim() || "";

      const formData = {
        name: nameVal,
        phone: phoneVal,
        email: emailVal,
        subject: subjectVal,
        message: messageVal,
        _subject: `New Contact Inquiry from ${nameVal} - Dr. Rahul Saridena Website`,
        _template: "table",
        _captcha: "false",
      };

      const recipientEmail = "saridenarahul@gmail.com";
      const isFileProtocol = window.location.protocol === "file:";

      try {
        if (isFileProtocol) throw new Error("FILE_PROTOCOL");

        const response = await fetch(
          `https://formsubmit.co/ajax/${recipientEmail}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(formData),
          },
        );

        const data = await response.json();

        if (response.ok && (data.success === "true" || data.success === true)) {
          btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Message Sent!`;
          btn.style.background = "#10b981";

          showToast(
            "Message sent successfully! We will get back to you soon.",
            "success",
          );

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
            contactForm.reset();
            contactForm
              .querySelectorAll(".focused")
              .forEach((el) => el.classList.remove("focused"));
          }, 3000);
        } else if (data.message && data.message.includes("Activation")) {
          btn.innerHTML = `<i class="fa-solid fa-envelope-circle-check"></i> Form Submitted!`;
          btn.style.background = "#f59e0b";

          showToast(
            "Submitted! Check saridenarahul@gmail.com to activate FormSubmit for instant inbox delivery.",
            "info",
          );

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
            contactForm.reset();
          }, 4000);
        } else {
          throw new Error(data.message || "FormSubmit submission failed");
        }
      } catch (err) {
        console.warn("AJAX submit error, using fallback option:", err);

        if (isFileProtocol) {
          const mailtoBody = encodeURIComponent(
            `Name: ${nameVal}\nPhone: ${phoneVal}\nEmail: ${emailVal}\nSubject: ${subjectVal}\n\nMessage:\n${messageVal}`,
          );
          window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent("Inquiry: " + subjectVal)}&body=${mailtoBody}`;

          btn.innerHTML = `<i class="fa-solid fa-envelope"></i> Email Client Opened`;
          btn.style.background = "#10b981";
          showToast(
            "Opened your email app with your message pre-filled.",
            "info",
          );

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
            contactForm.reset();
          }, 3000);
        } else {
          const fallbackForm = document.createElement("form");
          fallbackForm.method = "POST";
          fallbackForm.action = `https://formsubmit.co/${recipientEmail}`;
          fallbackForm.style.display = "none";

          Object.keys(formData).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = formData[key];
            fallbackForm.appendChild(input);
          });

          document.body.appendChild(fallbackForm);
          btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submitting...`;
          fallbackForm.submit();
        }
      }
    });
  }

  /* ── 9b. NEWSLETTER FORM ──────────────────── */
  const newsletterForms = document.querySelectorAll(".newsletter-form");
  newsletterForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Anti-spam check
      const honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');

      if (!input || !btn) return;

      const emailVal = input.value.trim();
      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!validateEmail(emailVal)) {
        showToast("Please enter a valid email address.", "error");
        input.focus();
        return;
      }

      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
      btn.disabled = true;

      const formData = {
        email: emailVal,
        _subject: "New Newsletter Subscription - Dr. Rahul Saridena Website",
        _template: "table",
        _captcha: "false",
      };

      const recipientEmail = "saridenarahul@gmail.com";
      const isFileProtocol = window.location.protocol === "file:";

      try {
        if (isFileProtocol) throw new Error("FILE_PROTOCOL");

        const response = await fetch(
          `https://formsubmit.co/ajax/${recipientEmail}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(formData),
          },
        );

        const data = await response.json();

        if (response.ok && (data.success === "true" || data.success === true)) {
          btn.innerHTML = `<i class="fa-solid fa-check"></i> Subscribed!`;
          btn.style.background = "#10b981";
          showToast("Subscribed successfully to our newsletter!", "success");

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
            input.value = "";
          }, 3000);
        } else if (data.message && data.message.includes("Activation")) {
          btn.innerHTML = `<i class="fa-solid fa-check"></i> Received!`;
          btn.style.background = "#f59e0b";
          showToast(
            "Subscription received! Activation link sent to saridenarahul@gmail.com.",
            "info",
          );

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
            input.value = "";
          }, 3000);
        } else {
          throw new Error(data.message || "FormSubmit failed");
        }
      } catch (err) {
        console.warn("Newsletter submission fallback:", err);

        if (isFileProtocol) {
          window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent("Newsletter Subscription")}&body=${encodeURIComponent("Please subscribe me to updates: " + emailVal)}`;
          showToast("Opened email app to confirm subscription.", "info");
        } else {
          const fallbackForm = document.createElement("form");
          fallbackForm.method = "POST";
          fallbackForm.action = `https://formsubmit.co/${recipientEmail}`;
          fallbackForm.style.display = "none";

          Object.keys(formData).forEach((key) => {
            const inp = document.createElement("input");
            inp.type = "hidden";
            inp.name = key;
            inp.value = formData[key];
            fallbackForm.appendChild(inp);
          });

          document.body.appendChild(fallbackForm);
          fallbackForm.submit();
        }

        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.background = "";
          btn.disabled = false;
          input.value = "";
        }, 3000);
      }
    });
  });

  // Toast Notification Utility (Supports 'success', 'error', 'info', 'warning')
  function showToast(message, type = "success") {
    let toast = document.querySelector(".form-success-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "form-success-toast";
      document.body.appendChild(toast);
    }

    let iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-exclamation";
    else if (type === "warning") iconClass = "fa-triangle-exclamation";
    else if (type === "info") iconClass = "fa-circle-info";

    toast.className = `form-success-toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  }

  /* ── 10. MARQUEE DUPLICATE ────────────────── */
  document.querySelectorAll(".marquee-track").forEach((track) => {
    const clone = track.innerHTML;
    track.innerHTML += clone;
  });

  /* ── 11. SMOOTH ANCHOR LINKS ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── 12. STICKY HEADER OFFSET ─────────────── */
  document
    .querySelectorAll(".form-group input, .form-group textarea")
    .forEach((input) => {
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });
      input.addEventListener("blur", () => {
        input.parentElement.classList.remove("focused");
      });
    });
});
