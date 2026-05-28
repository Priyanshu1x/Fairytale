/* ============================================
   A FAIRYTALE — Cinematic Script
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
    // Fade out the start screen
    startScreen.classList.add('fade-out');

    setTimeout(() => {
      startScreen.style.display = 'none';

      // Show intro overlay and play video + audio together
      introOverlay.style.display = 'flex';

      // Play intro audio (the Netflix "ta-dum" sound)
      introAudio.volume = 1.0;
      introAudio.play().catch(() => {});

      // Play intro video with full quality
      introVideo.muted = true; // keep video muted since we play separate HD audio
      introVideo.play().then(() => {
        // Video playing successfully
      }).catch(() => {
        // If video fails, just end the intro
        endIntro();
      });
    }, 800);

    // When video ends, transition to main page
    introVideo.addEventListener('ended', endIntro);

    // Fallback: skip after video seems stuck (15 seconds max)
    setTimeout(() => {
      if (!introEnded) endIntro();
    }, 15000);
  }

  // Allow skip via click or key during intro
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
      introVideo.load(); // free memory
      revealPage();
    }, 1200);
  }

  function revealPage() {
    pageContent.classList.add('visible');
    document.body.style.overflow = 'auto';
    initParticles();
    initScrollObserver();
  }

  /* ============================================
     2. MOUSE PARALLAX ON HERO
     ============================================ */
  function initParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Only enable on non-touch devices
    if (window.matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        requestAnimationFrame(() => {
          heroBg.style.transform = `translate(${x * -12}px, ${y * -12}px)`;
        });
      });

      hero.addEventListener('mouseleave', () => {
        heroBg.style.transition = 'transform 0.6s ease';
        heroBg.style.transform = 'translate(0, 0)';
        setTimeout(() => { heroBg.style.transition = ''; }, 600);
      });
    }
  }

  /* ============================================
     3. FLOATING PARTICLES (GOLDEN DUST)
     ============================================ */
  function initParticles() {
    const canvas = particlesCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = Math.random() * -0.4 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.fadeDir = Math.random() > 0.5 ? 1 : -1;
        // warm golden / amber colour
        this.hue = 30 + Math.random() * 25;
        this.sat = 60 + Math.random() * 30;
        this.light = 60 + Math.random() * 25;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += this.fadeDir * 0.003;
        if (this.opacity <= 0.05 || this.opacity >= 0.6) this.fadeDir *= -1;
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
          this.y = canvas.height + 10;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.opacity})`;
        ctx.shadowColor = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.opacity * 0.5})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Create particles — fewer on mobile
    const count = window.innerWidth < 768 ? 35 : 70;
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
    // Fade out page then navigate
    pageContent.style.transition = 'opacity 0.8s ease';
    pageContent.style.opacity = '0';
    if (musicPlaying) {
      bgMusic.pause();
    }
    setTimeout(() => {
      window.location.href = 'birthday.html';
    }, 850);
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
      bgMusic.volume = 0.35;
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
     9. NAVBAR SCROLL BEHAVIOUR
     ============================================ */
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(0,0,0,0.92)';
      navbar.style.backdropFilter = 'blur(12px)';
    } else {
      navbar.style.background = '';
      navbar.style.backdropFilter = '';
    }
  });

  /* ============================================
     INIT
     ============================================ */
  document.body.style.overflow = 'hidden'; // lock scroll during intro
  initParallax();

})();
