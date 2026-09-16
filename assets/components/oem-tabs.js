/**
 * OEMTabsController - Interactive OEM/ODM Capabilities Showcase Controller
 * Accessible WAI-ARIA tab pattern with keyboard navigation (arrows, home, end)
 */

export class OEMTabsController {
  constructor(options = {}) {
    this.containerId = options.containerId || 'oem-showcase';
    this.tabs = [];
    this.panels = [];
    this.activeTabId = null;
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.tabs = Array.from(container.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    if (this.tabs.length === 0 || this.panels.length === 0) return;

    // Attach click and keydown listeners
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectTab(tab.id);
      });

      tab.addEventListener('keydown', (e) => {
        this.handleKeyDown(e, index);
      });
    });

    // Default to first tab or whichever is marked aria-selected="true"
    const defaultTab = this.tabs.find(t => t.getAttribute('aria-selected') === 'true') || this.tabs[0];
    if (defaultTab) {
      this.selectTab(defaultTab.id, false);
    }
  }

  selectTab(tabId, setFocus = true) {
    const targetTab = this.tabs.find(t => t.id === tabId);
    if (!targetTab) return;

    const panelId = targetTab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(panelId);

    // Update Tabs
    this.tabs.forEach(tab => {
      const isSelected = tab.id === tabId;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      tab.classList.toggle('is-active', isSelected);
    });

    // Update Panels
    this.panels.forEach(panel => {
      const isMatch = panel.id === panelId;
      panel.hidden = !isMatch;
      panel.classList.toggle('is-active', isMatch);
    });

    this.activeTabId = tabId;

    if (setFocus) {
      targetTab.focus();
    }
  }

  handleKeyDown(e, currentIndex) {
    let targetIndex = null;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = (currentIndex + 1) % this.tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }

    if (targetIndex !== null) {
      const nextTab = this.tabs[targetIndex];
      if (nextTab) {
        this.selectTab(nextTab.id, true);
      }
    }
  }
}
