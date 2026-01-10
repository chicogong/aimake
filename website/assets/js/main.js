// AIMake Landing Page JavaScript

// ==================== Mobile Menu Toggle ====================
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menu) {
    menu.classList.toggle('open');

    // Toggle icons
    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    }
  }
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    const links = mobileMenu.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        toggleMobileMenu();
      });
    });
  }
});

// ==================== Smooth Scroll ====================
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

// ==================== Scroll Animations ====================
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

// Observe all feature cards, use cases, testimonials
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.feature-card, .use-case-card, .testimonial-card, .pricing-card'
  );
  animatedElements.forEach((el) => observer.observe(el));
});

// ==================== Number Counter Animation ====================
function animateNumber(element, target, duration = 2000) {
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

// Trigger number animation when scrolling to stats section
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

document.addEventListener('DOMContentLoaded', () => {
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

// ==================== Audio Player Control ====================
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

// Initialize audio players
document.addEventListener('DOMContentLoaded', () => {
  const demoAudio = document.getElementById('demo-audio');
  if (demoAudio) {
    new AudioPlayer(demoAudio, {
      playBtn: document.getElementById('demo-play-btn'),
      progressBar: document.querySelector('.demo-progress-bar'),
      progressFill: document.querySelector('.demo-progress-fill'),
      timeDisplay: document.querySelector('.demo-time-display'),
    });
  }

  // Initialize all demo audio elements
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
});

// ==================== Simulate Generation ====================
// Exported to window for HTML onclick usage
function simulateGeneration() {
  const button = document.getElementById('generate-btn');
  const audioPlayer = document.getElementById('demo-audio-player');

  if (!button) return;

  // 1. Change button to loading state
  const originalText = button.textContent;
  button.textContent = '生成中...';
  button.disabled = true;
  button.classList.add('opacity-75', 'cursor-not-allowed');

  // 2. Simulate progress (3 seconds)
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 2;
    if (progress >= 100) {
      clearInterval(progressInterval);

      // 3. Show success and audio player
      button.textContent = '✅ 生成成功';
      button.classList.remove('opacity-75', 'cursor-not-allowed');

      if (audioPlayer) {
        audioPlayer.classList.remove('hidden');
      }

      // Reset button after 2 seconds
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }, 50);
}

// Export to global scope for HTML inline event handlers
window.simulateGeneration = simulateGeneration;

// ==================== FAQ Smooth Toggle ====================
document.addEventListener('DOMContentLoaded', () => {
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
        }, 300);
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
});

// ==================== Sticky CTA (Mobile) ====================
let lastScroll = 0;
const stickyCTA = document.querySelector('.sticky-cta');

if (stickyCTA) {
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Show when scrolling down past hero section
    if (currentScroll > 800 && currentScroll > lastScroll) {
      stickyCTA.classList.add('visible');
    } else if (currentScroll < lastScroll) {
      stickyCTA.classList.remove('visible');
    }

    lastScroll = currentScroll;
  });
}

// ==================== Character Counter ====================
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('demo-textarea');
  const counter = document.getElementById('char-counter');

  if (textarea && counter) {
    textarea.addEventListener('input', (e) => {
      const count = e.target.value.length;
      counter.textContent = `${count}/1000`;

      // Warning color when approaching limit
      if (count > 900) {
        counter.classList.add('text-orange-500');
      } else {
        counter.classList.remove('text-orange-500');
      }
    });
  }
});

// ==================== Voice Preview ====================
// Exported to window for HTML onchange usage
function previewVoice(voiceId) {
  const audio = new Audio(`/assets/audio/preview-${voiceId}.mp3`);
  audio.volume = 0.5;
  audio.play().catch((err) => {
    console.log('Audio preview not available:', err);
  });
}

// Export to global scope for HTML inline event handlers
window.previewVoice = previewVoice;

// ==================== Console Welcome Message ====================
console.log('%c🎙️ AIMake - AI 语音内容生成', 'font-size: 20px; font-weight: bold; color: #3B82F6;');
console.log('%c感谢使用 AIMake！如有问题请联系我们。', 'font-size: 14px; color: #6B7280;');
