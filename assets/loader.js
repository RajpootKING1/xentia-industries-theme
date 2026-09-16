/**
 * XENTIA INDUSTRIES - BRANDED INDUSTRIAL PRELOADER
 * Version: 1.0.0 (Milestone 3 Execution)
 * Authority: /docs/HOMEPAGE-UX-ARCHITECTURE.md & /docs/PROJECT-AUDIT.md
 * 
 * Provides an engineered brand entry experience with precision calibration progress,
 * rotating manufacturing quality notices, session-aware fast-path, and safe auto-dismissal.
 */

const STORAGE_KEY_SEEN = 'xentia_loader_seen';

export class LoaderController {
  constructor({ maxTimeoutMs = 2200, minDurationMs = 700 } = {}) {
    this.maxTimeoutMs = maxTimeoutMs;
    this.minDurationMs = minDurationMs;
    this.loaderEl = document.getElementById('xentia-loader');
    this.progressEl = document.getElementById('loader-progress');
    this.statusEl = document.getElementById('loader-status-text');
    this.percentEl = document.getElementById('loader-percentage');
    this.tipEl = document.getElementById('loader-tip');
    this.startTime = Date.now();
    this.progress = 0;
    this.animationFrame = null;
    this.isDismissed = false;

    this.qualityTips = [
      'ASTM F899 • German Grade Stainless Steel (AISI 410 / 420)',
      '134°C Autoclave Steam Sterilization Endurance Validated',
      'Optical Laser Passivation & Microscopic Blade Honing in Sialkot',
      'Direct Factory OEM Production & International Export Compliance'
    ];
  }

  /**
   * Boot the loader sequence
   */
  init() {
    if (!this.loaderEl) return;

    // 1. Accessibility Check: prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.dismissImmediately();
      return;
    }

    // 2. Session Check: Fast-path for returning internal page navigation
    const hasSeenThisSession = sessionStorage.getItem(STORAGE_KEY_SEEN);
    if (hasSeenThisSession) {
      // Rapid 200ms micro-fade for returning pages in same tab
      setTimeout(() => this.dismiss(), 200);
      return;
    }

    // 3. First Visit in Session: Full Engineered Reveal
    sessionStorage.setItem(STORAGE_KEY_SEEN, 'true');
    this._startProgressAnimation();

    // 4. Safe Auto-Dismissal Listeners
    if (document.readyState === 'complete') {
      this._scheduleDismissal();
    } else {
      window.addEventListener('load', () => this._scheduleDismissal(), { once: true });
    }

    // 5. HARD SAFETY TIMEOUT: Never trap user, dismiss within maxTimeoutMs under any circumstance
    setTimeout(() => {
      if (!this.isDismissed) {
        this.progress = 100;
        this._updateUI(100, 'PRECISION SURGICAL READY');
        this.dismiss();
      }
    }, this.maxTimeoutMs);
  }

  /**
   * Smoothly interpolate calibration progress bar
   * @private
   */
  _startProgressAnimation() {
    let currentPercent = 0;
    let tipIndex = 0;

    const tick = () => {
      if (this.isDismissed) return;

      const elapsed = Date.now() - this.startTime;
      const targetPercent = Math.min(Math.floor((elapsed / this.minDurationMs) * 90), 92);

      if (currentPercent < targetPercent) {
        currentPercent += Math.ceil((targetPercent - currentPercent) * 0.2) || 1;
      }

      let status = 'CALIBRATING MICRON TOLERANCES...';
      if (currentPercent > 30 && currentPercent <= 60) {
        status = 'VERIFYING AISI 420 & GERMAN STEEL...';
        if (tipIndex !== 1) { tipIndex = 1; this._updateTip(tipIndex); }
      } else if (currentPercent > 60 && currentPercent <= 85) {
        status = 'CONNECTING STOREFRONT COMMERCE...';
        if (tipIndex !== 2) { tipIndex = 2; this._updateTip(tipIndex); }
      } else if (currentPercent > 85) {
        status = 'FINALIZING OPTICAL INSPECTION...';
        if (tipIndex !== 3) { tipIndex = 3; this._updateTip(tipIndex); }
      }

      this._updateUI(currentPercent, status);

      if (currentPercent < 92) {
        this.animationFrame = requestAnimationFrame(tick);
      }
    };

    this.animationFrame = requestAnimationFrame(tick);
  }

  /**
   * Schedule dismissal after minimum visual presentation
   * @private
   */
  _scheduleDismissal() {
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(this.minDurationMs - elapsed, 50);

    setTimeout(() => {
      // Quickly accelerate to 100%
      this._finishAndDismiss();
    }, remainingTime);
  }

  /**
   * Finish progress to 100% and trigger dismissal
   * @private
   */
  _finishAndDismiss() {
    if (this.isDismissed) return;

    this._updateUI(100, 'PRECISION SURGICAL READY');
    if (this.progressEl) {
      this.progressEl.style.width = '100%';
    }

    setTimeout(() => {
      this.dismiss();
    }, 180);
  }

  /**
   * Dismiss the loader with smooth CSS transition
   */
  dismiss() {
    if (this.isDismissed || !this.loaderEl) return;
    this.isDismissed = true;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.loaderEl.classList.add('loader-dismissed');
    document.body.classList.remove('is-loading');

    // Notify application
    window.dispatchEvent(new CustomEvent('xentia:loader:dismissed'));

    // Remove from DOM accessibility tree after CSS fade completes
    setTimeout(() => {
      if (this.loaderEl) {
        this.loaderEl.style.display = 'none';
      }
    }, 500);
  }

  /**
   * Immediate bypass without animation (for reduced-motion or tests)
   */
  dismissImmediately() {
    this.isDismissed = true;
    if (this.loaderEl) {
      this.loaderEl.style.display = 'none';
    }
    document.body.classList.remove('is-loading');
    window.dispatchEvent(new CustomEvent('xentia:loader:dismissed'));
  }

  /**
   * Update progress numbers and status labels
   * @private
   */
  _updateUI(percent, status) {
    if (this.progressEl) {
      this.progressEl.style.width = `${percent}%`;
    }
    if (this.percentEl) {
      this.percentEl.textContent = `${percent}%`;
    }
    if (this.statusEl && status) {
      this.statusEl.textContent = status;
    }
  }

  /**
   * Rotate quality tip text
   * @private
   */
  _updateTip(index) {
    if (this.tipEl && this.qualityTips[index]) {
      this.tipEl.style.opacity = '0';
      setTimeout(() => {
        if (this.tipEl) {
          this.tipEl.textContent = this.qualityTips[index];
          this.tipEl.style.opacity = '1';
        }
      }, 150);
    }
  }
}

export const loaderController = new LoaderController();

// Global handle for test or inline triggers
window.xentiaLoader = loaderController;
