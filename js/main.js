// Navigation state and configuration
const NAVIGATION_CONFIG = {
  SECTION_NAMES: ["home", "about", "projects", "blog", "resume"],
  DRAG_THRESHOLD: 0.2,
  WHEEL_THRESHOLD: 25,
  RESIZE_DEBOUNCE: 150,
  ORIENTATION_DELAY: 500,
  TRANSITION_LOCK_MS: 650, // matches --t-section (600ms) + small buffer
};

class PortfolioNavigator {
  constructor() {
    this.state = {
      currentSection: 0,
      isDragging: false,
      startX: 0,
      currentX: 0,
      initialTransform: 0,
    };

    this.isTransitioning = false;

    this.elements = this.cacheElements();
    this.totalSections = this.elements.sections.length;

    this.init();
  }

  cacheElements() {
    return {
      sectionsContainer: document.querySelector(".sections-container"),
      sections: Array.from(document.querySelectorAll(".section")),
      navItems: Array.from(document.querySelectorAll(".nav-item")),
      navIndicator: document.querySelector(".nav-indicator"),
      mobileSections: Array.from(document.querySelectorAll(".mobile-section")),
      scrollDots: Array.from(document.querySelectorAll(".scroll-dot")),
      mobileContainer: document.getElementById("mobilePortraitContainer"),
      scrollIndicator: document.getElementById("scrollIndicator"),
      scrollMenu: document.getElementById("scrollMenu"),
      scrollMenuBackdrop: document.getElementById("scrollMenuBackdrop"),
      scrollMenuItems: Array.from(
        document.querySelectorAll(".scroll-menu-item"),
      ),
    };
  }

  // Utility methods
  isMobilePortrait() {
    return window.innerWidth <= 767 && window.innerHeight > window.innerWidth;
  }

  getTransformX() {
    if (!this.elements.sectionsContainer) return 0;
    const style = window.getComputedStyle(this.elements.sectionsContainer);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return matrix.m41;
  }

  constrainTransform(transform) {
    const maxTransform = 0;
    const minTransform = -(this.totalSections - 1) * window.innerWidth;

    if (transform > maxTransform) {
      const excess = transform - maxTransform;
      return maxTransform + excess * 0.3;
    } else if (transform < minTransform) {
      const excess = minTransform - transform;
      return minTransform - excess * 0.3;
    }
    return transform;
  }

  // Navigation methods
  startTransition() {
    this.isTransitioning = true;
    clearTimeout(this.transitionTimeout);
    this.transitionTimeout = setTimeout(() => {
      this.isTransitioning = false;
    }, NAVIGATION_CONFIG.TRANSITION_LOCK_MS);
  }

  goToSection(index, smoothTransition = true) {
    if (index < 0 || index >= this.totalSections) return;

    this.state.currentSection = index;

    if (this.isMobilePortrait()) {
      this.goToMobileSection(index);
    } else {
      this.goToDesktopSection(index, smoothTransition);
    }
  }

  goToDesktopSection(index, smoothTransition = true) {
    if (!this.elements.sectionsContainer) return;

    this.elements.sectionsContainer.classList.toggle(
      "no-transition",
      !smoothTransition,
    );
    this.elements.sectionsContainer.style.transform = `translateX(-${
      index * 100
    }vw)`;
    this.updateDesktopUI();

    if (!smoothTransition) {
      setTimeout(() => {
        this.elements.sectionsContainer.classList.remove("no-transition");
      }, 50);
    }
  }

  goToMobileSection(index) {
    if (!this.elements.mobileContainer || !this.isMobilePortrait()) return;
    if (index < 0 || index >= this.elements.mobileSections.length) return;

    const targetScroll = index * this.elements.mobileContainer.clientHeight;
    this.elements.mobileContainer.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    this.updateMobileUI();
  }

  nextSection() {
    if (this.state.currentSection < this.totalSections - 1) {
      const nextIndex = this.state.currentSection + 1;
      this.goToSection(nextIndex);
    } else if (this.isMobilePortrait()) {
      // Only bounce if already at the last section and trying to go further
      this.addBounceEffect("end");
    }
  }

  previousSection() {
    if (this.state.currentSection > 0) {
      const prevIndex = this.state.currentSection - 1;
      this.goToSection(prevIndex);
    } else if (this.isMobilePortrait()) {
      // Only bounce if already at the first section and trying to go further
      this.addBounceEffect("start");
    }
  }

  addBounceEffect(direction) {
    if (!this.elements.mobileContainer) return;

    const container = this.elements.mobileContainer;
    container.classList.add(`bounce-${direction}`);

    setTimeout(() => {
      container.classList.remove(`bounce-${direction}`);
    }, 300);
  }

  // UI update methods
  updateDesktopUI() {
    this.elements.navItems.forEach((item, idx) => {
      item.classList.toggle("active", idx === this.state.currentSection);
    });

    const activeItem = this.elements.navItems[this.state.currentSection];
    if (activeItem && this.elements.navIndicator) {
      const indicator = this.elements.navIndicator;
      const isFirstPlacement = !indicator.style.left;
      if (isFirstPlacement) indicator.style.transition = "none";
      indicator.style.left = `${activeItem.offsetLeft}px`;
      indicator.style.width = `${activeItem.offsetWidth}px`;
      if (isFirstPlacement)
        requestAnimationFrame(() => {
          indicator.style.transition = "";
        });
    }

    this.elements.sections.forEach((sec, i) => {
      sec.classList.toggle("active", i === this.state.currentSection);
    });

    if (this.elements.sectionsContainer) {
      this.elements.sectionsContainer.classList.toggle(
        "at-start",
        this.state.currentSection === 0,
      );
      this.elements.sectionsContainer.classList.toggle(
        "at-end",
        this.state.currentSection === this.totalSections - 1,
      );
    }
  }

  updateMobileUI() {
    this.elements.scrollDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.state.currentSection);
    });

    if (this.elements.scrollMenu?.classList.contains("active")) {
      this.updateScrollMenuItems();
    }
  }

  updateScrollMenuItems() {
    this.elements.scrollMenuItems.forEach((item, index) => {
      item.classList.toggle("active", index === this.state.currentSection);
    });
  }

  updateMobileScrollIndicator() {
    if (!this.isMobilePortrait() || !this.elements.mobileContainer) return;

    const { clientHeight: viewportHeight, scrollTop } =
      this.elements.mobileContainer;
    const exactIndex = (scrollTop + viewportHeight * 0.5) / viewportHeight;
    const newIndex = Math.max(
      0,
      Math.min(Math.floor(exactIndex), this.elements.mobileSections.length - 1),
    );

    this.elements.scrollDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === newIndex);
    });

    if (newIndex !== this.state.currentSection) {
      this.state.currentSection = newIndex;
      this.updateMobileUI();
    }
  }

  snapToNearestSection() {
    if (!this.isMobilePortrait() || !this.elements.mobileContainer) return;

    const { clientHeight: viewportHeight, scrollTop } =
      this.elements.mobileContainer;
    const currentIndex = Math.round(scrollTop / viewportHeight);
    const targetIndex = Math.max(
      0,
      Math.min(currentIndex, this.elements.mobileSections.length - 1),
    );

    if (targetIndex !== this.state.currentSection) {
      this.goToSection(targetIndex);
    }
  }

  // Mobile menu methods
  toggleScrollMenu() {
    if (!this.isMobilePortrait()) return;

    const isOpen = this.elements.scrollMenu.classList.contains("active");
    isOpen ? this.closeScrollMenu() : this.openScrollMenu();
  }

  openScrollMenu() {
    this.elements.scrollMenu.classList.add("active");
    this.elements.scrollMenuBackdrop.classList.add("active");
    this.updateScrollMenuItems();
  }

  closeScrollMenu() {
    this.elements.scrollMenu.classList.remove("active");
    this.elements.scrollMenuBackdrop.classList.remove("active");
  }

  // Drag handling methods
  startDrag(clientX) {
    if (this.isMobilePortrait()) return;

    this.state.isDragging = true;
    this.state.startX = clientX;
    this.state.currentX = clientX;
    this.state.initialTransform = this.getTransformX();

    if (this.elements.sectionsContainer) {
      this.elements.sectionsContainer.classList.add("no-transition");
    }

    document.querySelector(".cursor")?.classList.add("is-dragging");
  }

  updateDrag(clientX) {
    if (!this.state.isDragging || this.isMobilePortrait()) return;

    this.state.currentX = clientX;
    const deltaX = this.state.currentX - this.state.startX;
    const newTransform = this.state.initialTransform + deltaX;
    const constrainedTransform = this.constrainTransform(newTransform);

    if (this.elements.sectionsContainer) {
      this.elements.sectionsContainer.style.transform = `translateX(${constrainedTransform}px)`;
    }
  }

  endDrag() {
    if (!this.state.isDragging || this.isMobilePortrait()) return;

    this.state.isDragging = false;

    if (this.elements.sectionsContainer) {
      this.elements.sectionsContainer.classList.remove("no-transition");
    }

    document.querySelector(".cursor")?.classList.remove("is-dragging");

    const deltaX = this.state.currentX - this.state.startX;
    const threshold = window.innerWidth * NAVIGATION_CONFIG.DRAG_THRESHOLD;

    let newSection = this.state.currentSection;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && this.state.currentSection > 0) {
        newSection = this.state.currentSection - 1;
      } else if (
        deltaX < 0 &&
        this.state.currentSection < this.totalSections - 1
      ) {
        newSection = this.state.currentSection + 1;
      }
    }

    this.goToSection(newSection);
  }

  // Event handling methods
  handleWheelEvent(e) {
    if (this.isMobilePortrait()) return;
    e.preventDefault();

    if (this.isTransitioning) return;

    const delta = e.deltaX || e.deltaY;

    if (Math.abs(delta) > NAVIGATION_CONFIG.WHEEL_THRESHOLD) {
      this.startTransition();
      delta > 0 ? this.nextSection() : this.previousSection();
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (!this.isTransitioning) {
          this.startTransition();
          this.previousSection();
        }
        break;
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (!this.isTransitioning) {
          this.startTransition();
          this.nextSection();
        }
        break;
      default:
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5) {
          e.preventDefault();
          this.goToSection(num - 1);
        }
    }
  }

  handleMobileScroll() {
    if (!this.isMobilePortrait()) return;

    if (this.elements.scrollMenu?.classList.contains("active")) {
      this.closeScrollMenu();
    }

    // Clear existing timeout
    clearTimeout(this.scrollTimeout);

    // Update indicators immediately for smooth feedback
    this.updateMobileScrollIndicator();

    // Snap to nearest section after scroll ends
    this.scrollTimeout = setTimeout(() => {
      this.snapToNearestSection();
    }, 150);
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.goToSection(this.state.currentSection, false);
    }, NAVIGATION_CONFIG.RESIZE_DEBOUNCE);
  }

  handleOrientationChange() {
    setTimeout(() => {
      this.goToSection(this.state.currentSection, false);
    }, NAVIGATION_CONFIG.ORIENTATION_DELAY);
  }

  // Event listener setup
  setupEventListeners() {
    // Desktop drag events
    if (this.elements.sectionsContainer) {
      this.elements.sectionsContainer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.startDrag(e.clientX);
      });

      this.elements.sectionsContainer.addEventListener(
        "touchstart",
        (e) => {
          this.startDrag(e.touches[0].clientX);
        },
        { passive: true },
      );

      this.elements.sectionsContainer.addEventListener("contextmenu", (e) => {
        if (this.state.isDragging) e.preventDefault();
      });

      this.elements.sectionsContainer.addEventListener(
        "wheel",
        (e) => {
          this.handleWheelEvent(e);
        },
        { passive: false },
      );
    }

    // Global mouse/touch events
    document.addEventListener("mousemove", (e) => this.updateDrag(e.clientX));
    document.addEventListener("mouseup", () => this.endDrag());
    document.addEventListener(
      "touchmove",
      (e) => {
        this.updateDrag(e.touches[0].clientX);
      },
      { passive: true },
    );
    document.addEventListener("touchend", () => this.endDrag(), {
      passive: true,
    });

    // Navigation clicks
    this.elements.navItems.forEach((item, index) => {
      item.addEventListener("click", () => this.goToSection(index));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.goToSection(index);
        }
      });
    });

    // Mobile events
    if (this.elements.mobileContainer) {
      this.elements.mobileContainer.addEventListener(
        "scroll",
        () => {
          this.handleMobileScroll();
        },
        { passive: true },
      );

      // Add touch event handling for better mobile experience
      let touchStartY = 0;
      let touchEndY = 0;

      this.elements.mobileContainer.addEventListener(
        "touchstart",
        (e) => {
          touchStartY = e.touches[0].clientY;
        },
        { passive: true },
      );

      this.elements.mobileContainer.addEventListener(
        "touchend",
        (e) => {
          touchEndY = e.changedTouches[0].clientY;
          const deltaY = touchStartY - touchEndY;
          const threshold = 50; // Minimum swipe distance

          if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0) {
              // Swipe up - next section
              if (this.state.currentSection < this.totalSections - 1) {
                this.nextSection();
              } else {
                this.addBounceEffect("end");
              }
            } else {
              // Swipe down - previous section
              if (this.state.currentSection > 0) {
                this.previousSection();
              } else {
                this.addBounceEffect("start");
              }
            }
          }
        },
        { passive: true },
      );
    }

    if (this.elements.scrollIndicator) {
      this.elements.scrollIndicator.addEventListener("click", () =>
        this.toggleScrollMenu(),
      );
    }

    if (this.elements.scrollMenuBackdrop) {
      this.elements.scrollMenuBackdrop.addEventListener("click", () =>
        this.closeScrollMenu(),
      );
    }

    // Scroll dots and menu items
    this.elements.scrollDots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSection(index));
    });

    this.elements.scrollMenuItems.forEach((item, index) => {
      const clickHandler = () => {
        this.goToSection(index);
        this.closeScrollMenu();
      };

      item.addEventListener("click", clickHandler);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickHandler();
        }
      });
    });

    // Mobile section tapping
    this.elements.mobileSections.forEach((section, index) => {
      section.addEventListener("click", (e) => {
        if (
          e.target === section ||
          e.target.classList.contains("mobile-card")
        ) {
          if (index !== this.state.currentSection) {
            this.goToSection(index);
          }
        }
      });
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Window events
    window.addEventListener("resize", () => this.handleResize());
    window.addEventListener("orientationchange", () =>
      this.handleOrientationChange(),
    );
  }

  // Theme toggle: cross-fade via View Transitions API.
  // The browser snapshots before/after and crossfades between them.
  // Fallback for browsers without View Transitions: instant swap.
  initTheme() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const root = document.documentElement;
      const current = root.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";

      const applyTheme = () => {
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      };

      // Fallback: no View Transitions support or user prefers reduced motion
      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        applyTheme();
        return;
      }

      document.startViewTransition(applyTheme);
    });
  }

  // Custom cursor tracking (fine-pointer / mouse only)
  initCursor() {
    const cursor = document.querySelector(".cursor");
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

    let rafPending = false;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          cursor.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
          rafPending = false;
        });
      }
    });

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });


    const hoverTargets = document.querySelectorAll(
      "a, button, [role='button'], .nav-item, .scroll-dot, .scroll-menu-item",
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () =>
        cursor.classList.add("is-hovering"),
      );
      el.addEventListener("mouseleave", () =>
        cursor.classList.remove("is-hovering"),
      );
    });
  }

  // Initialization
  init() {
    const hash = location.hash.slice(1);
    const idx = NAVIGATION_CONFIG.SECTION_NAMES.indexOf(hash);

    this.state.currentSection = idx !== -1 ? idx : 0;
    this.setupEventListeners();
    this.initTheme();
    this.initCursor();

    // Initialize after a brief delay to ensure DOM readiness
    setTimeout(() => {
      this.goToSection(this.state.currentSection, false);
    }, 100);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PortfolioNavigator();
});
