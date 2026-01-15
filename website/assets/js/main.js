// AIMake Landing Page JavaScript
// Refactored version - 2026-01-15

// ==================== Constants ====================
const CONSTANTS = {
  CHAR_LIMIT: 1000,
  CHAR_WARNING_THRESHOLD: 900,
  HERO_SCROLL_THRESHOLD: 800,
  STATS_ANIMATION_DURATION: 2000,
  PROGRESS_INTERVAL: 50,
  FAQ_TRANSITION_DELAY: 300,
};

// ==================== DOM Cache ====================
const DOM = {};

function cacheDOMElements() {
  // Mobile menu
  DOM.mobileMenu = document.getElementById('mobile-menu');
  DOM.menuIcon = document.getElementById('menu-icon');
  DOM.closeIcon = document.getElementById('close-icon');
  DOM.mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');

  // Demo section
  DOM.demoTextarea = document.getElementById('demo-textarea');
  DOM.charCounter = document.getElementById('char-counter');
  DOM.generateBtn = document.getElementById('generate-btn');
  DOM.demoAudioPlayer = document.getElementById('demo-audio-player');
  DOM.demoAudio = document.getElementById('demo-audio');

  // Sticky CTA
  DOM.stickyCTA = document.querySelector('.sticky-cta');

  // Stats section
  DOM.statsSection = document.querySelector('.stats-section');
}

// ==================== Unified Initialization ====================
function init() {
  cacheDOMElements();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initStatsCounter();
  initAudioPlayers();
  initCharacterCounter();
  initFAQAccordion();
  initStickyCTA();
  initEventDelegation();

  // Console welcome message
  console.log(
    '%c🎙️ AIMake - AI 语音内容生成',
    'font-size: 20px; font-weight: bold; color: #3B82F6;'
  );
  console.log('%c感谢使用 AIMake！如有问题请联系我们。', 'font-size: 14px; color: #6B7280;');
}

// ==================== Event Delegation ====================
function initEventDelegation() {
  // Handle all clicks with data attributes
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
      case 'toggle-mobile-menu':
        toggleMobileMenu();
        break;
      case 'simulate-generation':
        simulateGeneration();
        break;
      case 'preview-voice':
        previewVoice(target.dataset.voiceId);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  });

  // Handle voice selector changes
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-voice-selector]')) {
      const voiceId = e.target.value;
      if (voiceId) {
        previewVoice(voiceId);
      }
    }
  });
}

// ==================== Mobile Menu ====================
function initMobileMenu() {
  if (!DOM.mobileMenu) return;

  // Close menu when clicking on links
  const links = DOM.mobileMenu.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMobileMenu();
    });
  });
}

function toggleMobileMenu() {
  if (!DOM.mobileMenu) return;

  DOM.mobileMenu.classList.toggle('open');

  // Toggle icons
  if (DOM.menuIcon && DOM.closeIcon) {
    DOM.menuIcon.classList.toggle('hidden');
    DOM.closeIcon.classList.toggle('hidden');
  }
}

// ==================== Smooth Scroll ====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

// ==================== Scroll Animations ====================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    '.feature-card, .use-case-card, .testimonial-card, .pricing-card'
  );
  animatedElements.forEach((el) => observer.observe(el));
}

// ==================== Stats Counter Animation ====================
function initStatsCounter() {
  if (!DOM.statsSection) return;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const numbers = entry.target.querySelectorAll('.stat-number');
          numbers.forEach((num) => {
            const target = parseInt(num.dataset.target);
            animateNumber(num, target);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statsObserver.observe(DOM.statsSection);
}

function animateNumber(element, target, duration = CONSTANTS.STATS_ANIMATION_DURATION) {
  const increment = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString() + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// ==================== Audio Player ====================
class AudioPlayer {
  constructor(audioElement, controls) {
    this.audio = audioElement;
    this.playBtn = controls.playBtn;
    this.progressBar = controls.progressBar;
    this.progressFill = controls.progressFill;
    this.timeDisplay = controls.timeDisplay;

    this.init();
  }

  init() {
    if (!this.audio) return;

    // Play/Pause
    this.playBtn?.addEventListener('click', () => this.togglePlay());

    // Update progress
    this.audio.addEventListener('timeupdate', () => this.updateProgress());

    // Seek
    this.progressBar?.addEventListener('click', (e) => this.seek(e));

    // Update time display
    this.audio.addEventListener('loadedmetadata', () => this.updateTimeDisplay());
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
      this.updatePlayButton(true);
    } else {
      this.audio.pause();
      this.updatePlayButton(false);
    }
  }

  updatePlayButton(isPlaying) {
    const playIcon = this.playBtn?.querySelector('.play-icon');
    const pauseIcon = this.playBtn?.querySelector('.pause-icon');

    if (playIcon && pauseIcon) {
      if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
      } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
      }
    }
  }

  updateProgress() {
    if (!this.audio.duration) return;

    const percent = (this.audio.currentTime / this.audio.duration) * 100;
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }

    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    if (!this.timeDisplay) return;

    const current = this.formatTime(this.audio.currentTime);
    const duration = this.formatTime(this.audio.duration || 0);
    this.timeDisplay.textContent = `${current} / ${duration}`;
  }

  seek(e) {
    if (!this.audio.duration) return;

    const rect = this.progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.audio.currentTime = percent * this.audio.duration;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

function initAudioPlayers() {
  // Initialize main demo audio
  if (DOM.demoAudio) {
    new AudioPlayer(DOM.demoAudio, {
      playBtn: document.getElementById('demo-play-btn'),
      progressBar: document.querySelector('.demo-progress-bar'),
      progressFill: document.querySelector('.demo-progress-fill'),
      timeDisplay: document.querySelector('.demo-time-display'),
    });
  }

  // Initialize all demo audio items
  document.querySelectorAll('.demo-audio-item').forEach((item) => {
    const audio = item.querySelector('audio');
    if (audio) {
      new AudioPlayer(audio, {
        playBtn: item.querySelector('.play-btn'),
        progressBar: item.querySelector('.progress-bar'),
        progressFill: item.querySelector('.progress-fill'),
        timeDisplay: item.querySelector('.time-display'),
      });
    }
  });
}

// ==================== Demo Generation ====================
function simulateGeneration() {
  if (!DOM.generateBtn) return;

  // 1. Change button to loading state
  const originalText = DOM.generateBtn.textContent;
  DOM.generateBtn.textContent = '生成中...';
  DOM.generateBtn.disabled = true;
  DOM.generateBtn.classList.add('opacity-75', 'cursor-not-allowed');

  // 2. Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 2;
    if (progress >= 100) {
      clearInterval(progressInterval);

      // 3. Show success and audio player
      DOM.generateBtn.textContent = '✅ 生成成功';
      DOM.generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');

      if (DOM.demoAudioPlayer) {
        DOM.demoAudioPlayer.classList.remove('hidden');
      }

      // Reset button after 2 seconds
      setTimeout(() => {
        DOM.generateBtn.textContent = originalText;
        DOM.generateBtn.disabled = false;
      }, 2000);
    }
  }, CONSTANTS.PROGRESS_INTERVAL);
}

// ==================== Character Counter ====================
function initCharacterCounter() {
  if (!DOM.demoTextarea || !DOM.charCounter) return;

  DOM.demoTextarea.addEventListener('input', (e) => {
    const count = e.target.value.length;
    DOM.charCounter.textContent = `${count}/${CONSTANTS.CHAR_LIMIT}`;

    // Warning color when approaching limit
    if (count > CONSTANTS.CHAR_WARNING_THRESHOLD) {
      DOM.charCounter.classList.add('text-orange-500');
    } else {
      DOM.charCounter.classList.remove('text-orange-500');
    }
  });
}

// ==================== Voice Preview ====================
function previewVoice(voiceId) {
  if (!voiceId) return;

  const audio = new Audio(`/assets/audio/preview-${voiceId}.mp3`);
  audio.volume = 0.5;
  audio.play().catch((err) => {
    console.log('Audio preview not available:', err);
  });
}

// ==================== FAQ Accordion ====================
function initFAQAccordion() {
  const details = document.querySelectorAll('details');

  details.forEach((detail) => {
    const summary = detail.querySelector('summary');
    const content = detail.querySelector('.faq-content');

    if (!summary || !content) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (detail.open) {
        // Closing
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(() => {
          content.style.maxHeight = '0';
        }, 10);
        setTimeout(() => {
          detail.open = false;
        }, CONSTANTS.FAQ_TRANSITION_DELAY);
      } else {
        // Opening
        detail.open = true;
        content.style.maxHeight = '0';
        setTimeout(() => {
          content.style.maxHeight = content.scrollHeight + 'px';
        }, 10);
      }
    });
  });
}

// ==================== Sticky CTA ====================
function initStickyCTA() {
  if (!DOM.stickyCTA) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Show when scrolling down past hero section
    if (currentScroll > CONSTANTS.HERO_SCROLL_THRESHOLD && currentScroll > lastScroll) {
      DOM.stickyCTA.classList.add('visible');
    } else if (currentScroll < lastScroll) {
      DOM.stickyCTA.classList.remove('visible');
    }

    lastScroll = currentScroll;
  });
}

// ==================== Initialize on DOM Ready ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
