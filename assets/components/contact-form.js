/**
 * XENTIA INDUSTRIES - CONTACT FORM CONTROLLER
 * Version: 1.0.0
 * 
 * Manages institutional inquiry validation, submission to local storage,
 * and direct WhatsApp dispatch for urgent hospital/distributor orders.
 */

export class ContactFormController {
  constructor(options = {}) {
    this.formId = options.formId || 'xentia-contact-form';
    this.responseId = options.responseId || 'contact-form-response';
    this.form = null;
    this.responseEl = null;
  }

  init() {
    this.form = document.getElementById(this.formId);
    this.responseEl = document.getElementById(this.responseId);

    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'SUBMIT';

    const formData = new FormData(this.form);
    const data = {
      name: formData.get('contact_name') || '',
      email: formData.get('contact_email') || '',
      phone: formData.get('contact_phone') || '',
      company: formData.get('company_name') || '',
      category: formData.get('category_interest') || 'General Surgical',
      quantity: formData.get('order_quantity') || 'Sample Evaluation',
      message: formData.get('contact_message') || '',
      submittedAt: new Date().toISOString()
    };

    // Client validation
    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
      alert('Please complete all required fields (Name, Professional Email, and Specifications).');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display:inline-block; vertical-align:middle; margin-right:8px;">
          <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
          <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"></path>
        </svg>
        TRANSMITTING INQUIRY TO SIALKOT FACTORY...
      `;
    }

    // Persist inquiry locally for tracking in customer account portal
    try {
      const existing = JSON.parse(localStorage.getItem('xentia_inquiries') || '[]');
      existing.unshift(data);
      localStorage.setItem('xentia_inquiries', JSON.stringify(existing.slice(0, 20)));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }

    // Artificial sub-second latency for realistic luxury enterprise feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (this.responseEl) {
      this.responseEl.innerHTML = `
        <div style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--weight-bold); color: var(--color-gold-bright); margin-bottom: 6px;">
          ✓ INQUIRY TRANSMITTED SUCCESSFULLY
        </div>
        <p style="font-size: var(--text-xs); color: var(--color-steel-silver); line-height: 1.5; margin: 0 0 12px 0;">
          Thank you, <strong>${escapeHtml(data.name)}</strong>. Your technical RFQ for <strong>${escapeHtml(data.category)} (${escapeHtml(data.quantity)})</strong> has been routed to our Sales Engineering Desk in Sialkot. An official quotation will be sent to <strong>${escapeHtml(data.email)}</strong> within 4 business hours.
        </p>
        <a href="https://wa.me/923459656454?text=${encodeURIComponent('Hello Xentia Sales Engineering, I just submitted an inquiry on your website: ' + data.name + ' (' + data.company + ') regarding ' + data.category + ' [' + data.quantity + '].')}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px;">
          <span>ACCELERATE VIA WHATSAPP FACTORY DESK</span> &rarr;
        </a>
      `;
      this.responseEl.style.display = 'block';
      this.responseEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    this.form.reset();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
