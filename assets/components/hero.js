/**
 * XENTIA INDUSTRIES - HERO SECTION & FACTORY VIDEO CONTROLLER
 * Version: 1.0.0 (Milestone 5 Execution)
 * Authority: /docs/HOMEPAGE-UX-ARCHITECTURE.md
 * 
 * Manages dynamic typewriter tagline rotation, YouTube background video fade-in,
 * accessible video play/pause toggle controls, and prefers-reduced-motion compliance.
 */

export class HeroController {
  constructor() {
    this.phrases = [
      'BUILT ON PRECISION.',
      'DRIVEN BY INNOVATION.',
      'DEFINED BY EXCELLENCE.'
    ];
    this.currentPhraseIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = 65;
    this.deleteSpeed = 35;
    this.pauseEnd = 2400;
    this.pauseStart = 400;
    this.typeTimer = null;

    this.typewriterEl = null;
    this.videoIframe = null;
    this.videoPoster = null;
    this.videoToggleBtn = null;
    this.isVideoPlaying = true;
    this.prefersReducedMotion = false;
  }

  /**
   * Initialize hero interactions and animations
   */
  init() {
    console.log('[HeroController] Initializing Hero Section & Video Controller...');

    this.typewriterEl = document.getElementById('hero-typewriter-text');
    this.videoIframe = document.getElementById('hero-video-iframe');
    this.videoPoster = document.getElementById('hero-poster-fallback');
    this.videoToggleBtn = document.getElementById('hero-video-toggle');

    // Check system accessibility preferences
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Setup Typewriter Tagline
    this._setupTypewriter();

    // 2. Setup Video Streaming & Controls
    this._setupVideoPlayer();
  }

  /**
   * Setup dynamic typewriter effect or static fallback for reduced-motion
   * @private
   */
  _setupTypewriter() {
    if (!this.typewriterEl) return;

    if (this.prefersReducedMotion) {
      // Respect accessibility preference: display authoritative tagline immediately
      this.typewriterEl.textContent = this.phrases[0];
      const cursor = document.getElementById('hero-typewriter-cursor');
      if (cursor) cursor.style.display = 'none';
      return;
    }

    // Start typing loop
    this.currentPhraseIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this._typeCycle();
  }

  /**
   * Continuous typing and deletion cycle
   * @private
   */
  _typeCycle() {
    if (!this.typewriterEl) return;

    const currentPhrase = this.phrases[this.currentPhraseIndex];

    if (this.isDeleting) {
      // Deleting text
      this.currentCharIndex--;
      this.typewriterEl.textContent = currentPhrase.substring(0, this.currentCharIndex);

      if (this.currentCharIndex === 0) {
        this.isDeleting = false;
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        this.typeTimer = setTimeout(() => this._typeCycle(), this.pauseStart);
        return;
      }

      this.typeTimer = setTimeout(() => this._typeCycle(), this.deleteSpeed);
    } else {
      // Typing text
      this.currentCharIndex++;
      this.typewriterEl.textContent = currentPhrase.substring(0, this.currentCharIndex);

      if (this.currentCharIndex === currentPhrase.length) {
        this.isDeleting = true;
        this.typeTimer = setTimeout(() => this._typeCycle(), this.pauseEnd);
        return;
      }

      this.typeTimer = setTimeout(() => this._typeCycle(), this.typeSpeed);
    }
  }

  /**
   * Setup YouTube video playback and user controls
   * @private
   */
  _setupVideoPlayer() {
    if (!this.videoIframe) return;

    // Fade in video once iframe finishes network load
    this.videoIframe.addEventListener('load', () => {
      this.videoIframe.classList.add('is-loaded');
    });

    // If reduced motion is requested, pause the background video immediately
    if (this.prefersReducedMotion) {
      this.pauseVideo();
    }

    // Setup Video Control Toggle Button (Play / Pause)
    if (this.videoToggleBtn) {
      this.videoToggleBtn.addEventListener('click', () => {
        this.toggleVideo();
      });
    }
  }

  /**
   * Toggle background video state between Play and Pause
   */
  toggleVideo() {
    if (this.isVideoPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  /**
   * Pause YouTube background stream via postMessage API
   */
  pauseVideo() {
    if (this.videoIframe && this.videoIframe.contentWindow) {
      this.videoIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
        '*'
      );
    }
    this.isVideoPlaying = false;
    this._updateToggleBtnUI();
  }

  /**
   * Play YouTube background stream via postMessage API
   */
  playVideo() {
    if (this.videoIframe && this.videoIframe.contentWindow) {
      this.videoIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
    }
    this.isVideoPlaying = true;
    this._updateToggleBtnUI();
  }

  /**
   * Update video toggle button icon, label, and ARIA state
   * @private
   */
  _updateToggleBtnUI() {
    if (!this.videoToggleBtn) return;

    const playIcon = this.videoToggleBtn.querySelector('.video-icon-play');
    const pauseIcon = this.videoToggleBtn.querySelector('.video-icon-pause');
    const statusLabel = this.videoToggleBtn.querySelector('.video-toggle-label');

    if (this.isVideoPlaying) {
      this.videoToggleBtn.setAttribute('aria-label', 'Pause background factory video');
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline-block';
      if (statusLabel) statusLabel.textContent = 'PAUSE VIDEO';
    } else {
      this.videoToggleBtn.setAttribute('aria-label', 'Play background factory video');
      if (playIcon) playIcon.style.display = 'inline-block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (statusLabel) statusLabel.textContent = 'PLAY VIDEO';
    }
  }
}

export const heroController = new HeroController();

// Global handle
window.heroController = heroController;
