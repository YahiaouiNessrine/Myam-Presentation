/* ============================================
   MYAM — Interactive JavaScript
   Particles, 3D Effects, Calculators,
   Theme (Dark/Light) & Arabic (RTL) Switcher
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Current State
  let currentLang = localStorage.getItem('myam_lang') || 'fr';
  let currentTheme = localStorage.getItem('myam_theme') || 'dark';

  // Apply initial theme & lang
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.documentElement.setAttribute('data-lang', currentLang);
  document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', currentLang);

  // ==========================================
  // 1. THEME TOGGLE (DARK / LIGHT)
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('myam_theme', currentTheme);
      updateParticleColors();
    });
  }

  // ==========================================
  // 2. LANGUAGE TOGGLE (FRANÇAIS / ARABE)
  // ==========================================
  const langToggle = document.getElementById('langToggle');

  function updateLanguage(lang) {
    currentLang = lang;
    const isAr = lang === 'ar';
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('myam_lang', lang);

    // Update all elements with data-fr and data-ar
    document.querySelectorAll('[data-fr][data-ar]').forEach(el => {
      const text = isAr ? el.getAttribute('data-ar') : el.getAttribute('data-fr');
      if (text && !el.querySelector('svg') && !el.querySelector('img')) {
        el.textContent = text;
      }
    });

    // Update lang button label
    const langLabel = document.querySelector('.lang-label');
    if (langLabel) {
      langLabel.textContent = isAr ? 'FR' : 'عربية';
    }

    // Refresh dynamic calculators
    updatePricingCalc();
    updateCommissionCalc();
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const newLang = currentLang === 'fr' ? 'ar' : 'fr';
      updateLanguage(newLang);
    });
  }

  // ==========================================
  // 3. PARTICLE SYSTEM (Canvas Background)
  // ==========================================
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animationId;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      if (!canvas) return;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.15;
      this.setColor();
    }

    setColor() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (Math.random() > 0.7) {
        this.color = `rgba(255, 107, 53, ${this.opacity})`;
      } else {
        this.color = isLight
          ? `rgba(15, 23, 42, ${this.opacity * 0.3})`
          : `rgba(255, 255, 255, ${this.opacity * 0.6})`;
      }
    }

    update() {
      if (!canvas) return;
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function updateParticleColors() {
    particles.forEach(p => p.setColor());
  }

  function initParticles() {
    if (!canvas) return;
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 16000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    if (!ctx) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const opacity = (1 - dist / 140) * (isLight ? 0.05 : 0.08);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 107, 53, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    animationId = requestAnimationFrame(animateParticles);
  }

  if (canvas) {
    resizeCanvas();
    initParticles();
    animateParticles();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 200);
    });
  }

  // ==========================================
  // 4. NAVBAR SCROLL EFFECT
  // ==========================================
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ==========================================
  // 5. MOBILE NAVIGATION
  // ==========================================
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ==========================================
  // 6. ACTIVE NAV LINK ON SCROLL
  // ==========================================
  const sections = document.querySelectorAll('.section, .hero');
  const navLinksAll = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 200 && rect.bottom > 200) {
        current = section.id;
      }
    });

    navLinksAll.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ==========================================
  // 7. SCROLL ANIMATIONS (Intersection Observer)
  // ==========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => animateCounter(counter));
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // ==========================================
  // 8. COUNTER ANIMATION
  // ==========================================
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);

      el.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatNumber(target);
      }
    }

    requestAnimationFrame(update);
  }

  // ==========================================
  // 9. 3D TILT EFFECT ON CARDS
  // ==========================================
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s ease-out';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });
  });

  // ==========================================
  // 10. PRICING CALCULATOR
  // ==========================================
  const estabSlider = document.getElementById('estabSlider');
  const calcBreakdown = document.getElementById('calcBreakdown');
  const calcTotal = document.getElementById('calcTotal');

  function updatePricingCalc() {
    if (!estabSlider || !calcBreakdown || !calcTotal) return;

    const count = parseInt(estabSlider.value);
    const isAr = currentLang === 'ar';
    const currency = isAr ? 'دج' : 'DA';

    let total = 35000;
    let line1Label = isAr ? 'الفرع الأول' : '1er établissement';
    let html = `<div class="calc-line"><span>${line1Label}</span><span dir="ltr" class="calc-num">35 000 ${currency}</span></div>`;

    if (count > 1) {
      const extra = count - 1;
      const extraCost = extra * 5000;
      total += extraCost;
      let extraLabel = isAr
        ? `${extra} فرع إضافي (+5 000 دج/فرع)`
        : `${extra} établissement${extra > 1 ? 's' : ''} supplémentaire${extra > 1 ? 's' : ''}`;
      html += `<div class="calc-line"><span>${extraLabel}</span><span dir="ltr" class="calc-num">${formatNumber(extraCost)} ${currency}</span></div>`;
    }

    calcBreakdown.innerHTML = html;
    calcTotal.innerHTML = `<span dir="ltr">${formatNumber(total)} ${currency}</span>`;

    calcTotal.style.transform = 'scale(1.1)';
    setTimeout(() => {
      calcTotal.style.transform = 'scale(1)';
    }, 180);
  }

  if (estabSlider) {
    estabSlider.addEventListener('input', updatePricingCalc);
    updatePricingCalc();
  }

  // ==========================================
  // 11. COMMISSION CALCULATOR
  // ==========================================
  const commissionSlider = document.getElementById('commissionSlider');
  const commissionValue = document.getElementById('commissionValue');
  const commissionBreakdown = document.getElementById('commissionBreakdown');
  const commissionTotal = document.getElementById('commissionTotal');

  function updateCommissionCalc() {
    if (!commissionSlider || !commissionValue || !commissionBreakdown || !commissionTotal) return;

    const count = parseInt(commissionSlider.value);
    commissionValue.textContent = count;
    const isAr = currentLang === 'ar';
    const currency = isAr ? 'دج' : 'DA';

    let total = 0;
    let html = '';

    // Tier 1: 1-3 at 20%
    const tier1 = Math.min(count, 3);
    if (tier1 > 0) {
      const tier1Amount = tier1 * 7000;
      total += tier1Amount;
      const formula = isAr
        ? `<span dir="ltr">${tier1} × 7 000 دج</span> <small>(20%)</small>`
        : `<span dir="ltr">${tier1} × 7 000 DA</span> <small>(20%)</small>`;
      html += `<div class="commission-line">
        <span class="commission-line-label">${formula}</span>
        <span class="commission-line-amount" dir="ltr">${formatNumber(tier1Amount)} ${currency}</span>
      </div>`;
    }

    // Tier 2: 4-7 at 22%
    const tier2 = Math.min(Math.max(count - 3, 0), 4);
    if (tier2 > 0) {
      const tier2Amount = tier2 * 7700;
      total += tier2Amount;
      const formula = isAr
        ? `<span dir="ltr">${tier2} × 7 700 دج</span> <small>(22%)</small>`
        : `<span dir="ltr">${tier2} × 7 700 DA</span> <small>(22%)</small>`;
      html += `<div class="commission-line">
        <span class="commission-line-label">${formula}</span>
        <span class="commission-line-amount" dir="ltr">${formatNumber(tier2Amount)} ${currency}</span>
      </div>`;
    }

    // Tier 3: 8+ at 25%
    const tier3 = Math.max(count - 7, 0);
    if (tier3 > 0) {
      const tier3Amount = tier3 * 8750;
      total += tier3Amount;
      const formula = isAr
        ? `<span dir="ltr">${tier3} × 8 750 دج</span> <small>(25%)</small>`
        : `<span dir="ltr">${tier3} × 8 750 DA</span> <small>(25%)</small>`;
      html += `<div class="commission-line">
        <span class="commission-line-label">${formula}</span>
        <span class="commission-line-amount" dir="ltr">${formatNumber(tier3Amount)} ${currency}</span>
      </div>`;
    }

    commissionBreakdown.innerHTML = html;
    commissionTotal.innerHTML = `<span dir="ltr">${formatNumber(total)} ${currency}</span>`;

    commissionTotal.style.transform = 'scale(1.08)';
    setTimeout(() => {
      commissionTotal.style.transform = 'scale(1)';
    }, 180);
  }

  if (commissionSlider) {
    commissionSlider.addEventListener('input', updateCommissionCalc);
    updateCommissionCalc();
  }

  // ==========================================
  // 12. SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================
  // 13. PARALLAX ON MOUSE MOVE (Hero Section)
  // ==========================================
  const heroSection = document.querySelector('.hero');
  const floatElements = document.querySelectorAll('.float-element');
  const device3d = document.querySelector('.device-3d');

  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      floatElements.forEach((el, i) => {
        const speed = (i + 1) * 7;
        el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });

      if (device3d) {
        const rotY = -8 + x * 9;
        const rotX = 4 + y * -7;
        device3d.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      floatElements.forEach(el => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.5s ease-out';
      });
      if (device3d) {
        device3d.style.transform = 'rotateY(-8deg) rotateX(4deg)';
        device3d.style.transition = 'transform 0.5s ease-out';
      }
    });
  }

  // Initialize language on startup
  if (currentLang === 'ar') {
    updateLanguage('ar');
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  function formatNumber(num) {
    if (typeof num !== 'number') num = parseInt(num) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

});
