/* ============================================
   A FAIRYTALE — Premium Cinematic Script
   Netflix-Quality OTT Experience
   ============================================ */

(function () {
  'use strict';

  /* ---------- DOM References ---------- */
  const startScreen    = document.getElementById('start-screen');
  const introOverlay   = document.getElementById('intro-overlay');
  const introVideo     = document.getElementById('intro-video');
  const introAudio     = document.getElementById('intro-audio');
  const pageContent    = document.getElementById('page-content');
  const heroBg         = document.getElementById('hero-bg');
  const btnPlay        = document.getElementById('btn-play');
  const btnInfo        = document.getElementById('btn-info');
  const modalOverlay   = document.getElementById('modal-overlay');
  const modalClose     = document.getElementById('modal-close');
  const audioToggle    = document.getElementById('audio-toggle');
  const bgMusic        = document.getElementById('bg-music');
  const navToggle      = document.getElementById('nav-toggle');
  const navLinks       = document.getElementById('nav-links');
  const memoriesTitle  = document.getElementById('memories-title');
  const memoryCards    = document.querySelectorAll('.memory-card');
  const particlesCanvas = document.getElementById('particles-canvas');

  let musicPlaying = false;
  let introEnded = false;

  /* ============================================
     1. CLICK-TO-START SCREEN
     ============================================ */
  startScreen.addEventListener('click', startExperience);

  function startExperience() {
    startScreen.classList.add('fade-out');

    setTimeout(() => {
      startScreen.style.display = 'none';
      introOverlay.style.display = 'flex';

      // Play intro audio (the Netflix "ta-dum" sound)
      introAudio.volume = 1.0;
      introAudio.play().catch(() => {});

      // Play intro video
      introVideo.muted = true;
      introVideo.play().then(() => {}).catch(() => {
        endIntro();
      });
    }, 800);

    introVideo.addEventListener('ended', endIntro);

    // Fallback skip after 15 seconds
    setTimeout(() => {
      if (!introEnded) endIntro();
    }, 15000);
  }

  // Allow skip via keyboard
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      if (startScreen.style.display !== 'none') {
        startExperience();
      } else if (!introEnded) {
        skipIntro();
      }
      document.removeEventListener('keydown', onKey);
    }
  });

  introOverlay.addEventListener('click', () => {
    if (!introEnded) skipIntro();
  });

  function skipIntro() {
    introVideo.pause();
    introAudio.pause();
    endIntro();
  }

  function endIntro() {
    if (introEnded) return;
    introEnded = true;

    introAudio.pause();
    introOverlay.classList.add('fade-out');

    setTimeout(() => {
      introOverlay.style.display = 'none';
      introVideo.pause();
      introVideo.removeAttribute('src');
      introVideo.load();
      revealPage();
    }, 1200);
  }

  function revealPage() {
    pageContent.classList.add('visible');
    document.body.style.overflow = 'auto';
    initParticles();
    initScrollObserver();
    startMusicFadeIn();
  }

  function startMusicFadeIn() {
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
      musicPlaying = true;
      audioToggle.classList.add('playing');
      
      // Fade in smoothly over 2s
      let vol = 0;
      const targetVol = 0.4;
      const fadeInInterval = setInterval(() => {
        vol += 0.02;
        if (vol >= targetVol) {
          bgMusic.volume = targetVol;
          clearInterval(fadeInInterval);
        } else {
          bgMusic.volume = vol;
        }
      }, 100);
    }).catch((e) => {
      console.log("Autoplay blocked or user gesture required:", e);
    });
  }

  /* ============================================
     2. MOUSE PARALLAX ON HERO
     ============================================ */
  function initParallax() {
    const hero = document.getElementById('hero');
    if (!hero || !heroBg) return;

    // Only on non-touch (hover-capable) devices
    if (window.matchMedia('(hover: hover)').matches) {
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let rafId = null;

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * -18;
        targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -18;

        if (!rafId) {
          rafId = requestAnimationFrame(smoothParallax);
        }
      });

      function smoothParallax() {
        // Lerp for butter-smooth movement
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        heroBg.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.02)`;

        if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
          rafId = requestAnimationFrame(smoothParallax);
        } else {
          rafId = null;
        }
      }

      hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!rafId) {
          rafId = requestAnimationFrame(smoothParallax);
        }
      });
    }
  }

  /* ============================================
     3. FLOATING PARTICLES (GOLDEN DUST)
     Premium cinematic ambient effect
     ============================================ */
  function initParticles() {
    const canvas = particlesCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000, mouseY = -1000;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse for particle interaction
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.2 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = Math.random() * -0.35 - 0.08;
        this.opacity = Math.random() * 0.45 + 0.05;
        this.fadeDir = Math.random() > 0.5 ? 1 : -1;
        // Warm golden / amber colour palette
        this.hue = 28 + Math.random() * 30;
        this.sat = 55 + Math.random() * 35;
        this.light = 55 + Math.random() * 30;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += this.fadeDir * 0.002;
        if (this.opacity <= 0.03 || this.opacity >= 0.5) this.fadeDir *= -1;

        // Subtle mouse repulsion
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.5;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
          this.y = canvas.height + 10;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.opacity})`;
        ctx.shadowColor = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.opacity * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // More particles for richer atmosphere
    const count = window.innerWidth < 768 ? 40 : 85;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ============================================
     4. SCROLL OBSERVER — Reveal memories
     ============================================ */
  function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    if (memoriesTitle) observer.observe(memoriesTitle);

    memoryCards.forEach((card) => {
      const delay = parseInt(card.dataset.delay) || 0;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      obs.observe(card);
    });
  }

  /* ============================================
     5. PLAY BUTTON — Navigate to birthday.html
     ============================================ */
  btnPlay.addEventListener('click', () => {
    // Cinematic fade out
    document.body.style.transition = 'opacity 1.5s ease';
    document.body.style.opacity = '0';
    
    // Smooth music fade out over 1.5 seconds
    let vol = bgMusic.volume;
    const fadeInterval = setInterval(() => {
      vol -= 0.02;
      if (vol <= 0) {
        clearInterval(fadeInterval);
        bgMusic.volume = 0;
        bgMusic.pause();
      } else {
        bgMusic.volume = vol;
      }
    }, 75);

    setTimeout(() => {
      window.location.href = 'birthday.html';
    }, 1500);
  });

  /* ============================================
     6. MORE INFO MODAL
     ============================================ */
  btnInfo.addEventListener('click', () => {
    modalOverlay.classList.add('active');
  });

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modalOverlay.classList.remove('active');
  });

  /* ============================================
     7. AUDIO TOGGLE
     ============================================ */
  audioToggle.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      audioToggle.classList.remove('playing');
    } else {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(() => {});
      audioToggle.classList.add('playing');
    }
    musicPlaying = !musicPlaying;
  });

  /* ============================================
     8. MOBILE NAV TOGGLE
     ============================================ */
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  /* ============================================
     9. NAVBAR SCROLL BEHAVIOUR — Netflix-style
     ============================================ */
  let lastScroll = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  /* ============================================
     10. RIPPLE EFFECT ON BUTTONS
     ============================================ */
  function addRipple(button) {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  addRipple(btnPlay);
  addRipple(btnInfo);

  /* ============================================
     INIT
     ============================================ */
  document.body.style.overflow = 'hidden'; // lock scroll during intro
  initParallax();

})();
