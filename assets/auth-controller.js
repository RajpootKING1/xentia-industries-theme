/**
 * XENTIA INDUSTRIES - CUSTOMER AUTH & ACCOUNT PORTAL CONTROLLER
 * Version: 1.0.0
 * 
 * Manages dual-mode authentication (Sign In / Register), forgot password dialogs,
 * session state, and customer portal dashboard displaying RFQ history and saved quotes.
 */

export class AuthController {
  constructor(options = {}) {
    this.containerId = options.containerId || 'auth-container';
    this.currentUser = this.loadSession();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  loadSession() {
    try {
      const saved = localStorage.getItem('xentia_customer_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      localStorage.setItem('xentia_customer_session', JSON.stringify(user));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('xentia:auth:changed', { detail: { user } }));
  }

  clearSession() {
    this.currentUser = null;
    try {
      localStorage.removeItem('xentia_customer_session');
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('xentia:auth:changed', { detail: { user: null } }));
    this.render();
    this.attachEvents();
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.currentUser) {
      this.renderDashboard(container);
    } else {
      this.renderAuthForms(container);
    }
  }

  renderAuthForms(container) {
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-tabs" role="tablist">
          <button type="button" class="auth-tab-btn is-active" id="tab-btn-signin" role="tab" aria-selected="true" aria-controls="panel-signin">
            SIGN IN
          </button>
          <button type="button" class="auth-tab-btn" id="tab-btn-signup" role="tab" aria-selected="false" aria-controls="panel-signup">
            CREATE ACCOUNT
          </button>
        </div>

        <!-- Sign In Panel -->
        <div id="panel-signin" class="auth-panel" role="tabpanel" aria-labelledby="tab-btn-signin">
          <form id="form-signin" class="space-y-4">
            <div class="contact-field-group">
              <label class="contact-label" for="signin-email">Professional Email *</label>
              <input type="email" id="signin-email" name="email" required placeholder="doctor@hospital.org" class="contact-input" autocomplete="email">
            </div>

            <div class="contact-field-group">
              <label class="contact-label" for="signin-password">Password *</label>
              <input type="password" id="signin-password" name="password" required placeholder="••••••••••••" class="contact-input" autocomplete="current-password">
            </div>

            <div class="auth-remember-row">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" name="remember" checked style="accent-color: var(--color-gold-base);">
                <span>Remember this terminal</span>
              </label>
              <button type="button" id="btn-forgot-pw" style="background:none; border:none; color:var(--color-gold-base); cursor:pointer; font-size:11px; text-decoration:underline;">
                Forgot Password?
              </button>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="width:100%; justify-content:center; padding: 14px 0;">
              SIGN IN TO PORTAL
            </button>
          </form>

          <div id="signin-feedback" style="display:none; margin-top:14px;" class="alert alert-error"></div>
        </div>

        <!-- Sign Up Panel -->
        <div id="panel-signup" class="auth-panel" role="tabpanel" aria-labelledby="tab-btn-signup" hidden>
          <form id="form-signup" class="space-y-4">
            <div class="contact-grid-2">
              <div class="contact-field-group">
                <label class="contact-label" for="signup-fname">First Name *</label>
                <input type="text" id="signup-fname" name="first_name" required placeholder="Dr. Julian" class="contact-input">
              </div>
              <div class="contact-field-group">
                <label class="contact-label" for="signup-lname">Last Name *</label>
                <input type="text" id="signup-lname" name="last_name" required placeholder="Vance" class="contact-input">
              </div>
            </div>

            <div class="contact-grid-2">
              <div class="contact-field-group">
                <label class="contact-label" for="signup-role">Professional Role</label>
                <select id="signup-role" name="role" class="contact-select">
                  <option value="Surgeon / Specialist">Surgeon / Clinical Specialist</option>
                  <option value="Hospital Procurement">Hospital Theater / Procurement Officer</option>
                  <option value="Medical Distributor">International Medical Distributor</option>
                  <option value="Clinic Director">Private Clinic Director</option>
                  <option value="Veterinary Surgeon">Veterinary Surgeon</option>
                </select>
              </div>
              <div class="contact-field-group">
                <label class="contact-label" for="signup-org">Institution / Hospital</label>
                <input type="text" id="signup-org" name="organization" placeholder="St. Jude Surgical Pavilion" class="contact-input">
              </div>
            </div>

            <div class="contact-field-group">
              <label class="contact-label" for="signup-email">Work Email *</label>
              <input type="email" id="signup-email" name="email" required placeholder="julian@surgery.com" class="contact-input" autocomplete="email">
            </div>

            <div class="contact-field-group">
              <label class="contact-label" for="signup-password">Create Secure Password *</label>
              <input type="password" id="signup-password" name="password" minlength="8" required placeholder="Min. 8 characters" class="contact-input" autocomplete="new-password">
            </div>

            <div style="font-size: 11px; color: var(--color-steel-muted); margin: var(--space-3) 0;">
              By registering, you gain verified medical pricing, direct Sialkot factory RFQ history, and instant DIN tray manifest downloads.
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="width:100%; justify-content:center; padding: 14px 0;">
              REGISTER VERIFIED ACCOUNT
            </button>
          </form>

          <div id="signup-feedback" style="display:none; margin-top:14px;" class="alert alert-success"></div>
        </div>
      </div>
    `;
  }

  renderDashboard(container) {
    const user = this.currentUser;
    const inquiries = JSON.parse(localStorage.getItem('xentia_inquiries') || '[]');

    container.innerHTML = `
      <div class="auth-dashboard-container">
        <div class="auth-dashboard-grid">
          
          <!-- Sidebar / Profile -->
          <div class="auth-profile-sidebar">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="auth-profile-avatar">
                ${(user.firstName || user.name || 'D')[0].toUpperCase()}
              </div>
              <div>
                <h3 style="font-family:var(--font-display); font-size:var(--text-lg); font-weight:var(--weight-bold); color:var(--color-steel-pure); margin:0;">
                  ${user.firstName ? user.firstName + ' ' + (user.lastName || '') : user.name || user.email}
                </h3>
                <span class="badge badge-gold" style="font-size:10px; margin-top:4px; display:inline-block;">
                  ${user.role || 'VERIFIED MEDICAL BUYER'}
                </span>
              </div>
            </div>

            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:14px; font-size:var(--text-xs); color:var(--color-steel-silver);">
              <div style="margin-bottom:8px;"><strong>Email:</strong> ${user.email}</div>
              <div style="margin-bottom:8px;"><strong>Institution:</strong> ${user.organization || 'Global Medical Client'}</div>
              <div><strong>Account ID:</strong> <span style="font-family:var(--font-mono); color:var(--color-gold-base);">XIA-${Math.abs(hashCode(user.email))}</span></div>
            </div>

            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:14px; display:flex; flex-direction:column; gap:8px;">
              <a href="wholesale-custom-orders.html" class="btn btn-primary btn-sm">
                + NEW B2B CUSTOM RFQ
              </a>
              <a href="shop.html" class="btn btn-secondary btn-sm">
                BROWSE 50+ INSTRUMENTS
              </a>
              <button id="btn-logout" class="btn btn-outline btn-sm" style="color:var(--color-error); border-color:rgba(239,68,68,0.3); margin-top:8px;">
                SIGN OUT
              </button>
            </div>
          </div>

          <!-- Main Content: RFQ / Quotes & Catalog History -->
          <div style="display:flex; flex-direction:column; gap:var(--space-6);">
            
            <div class="card card-metallic" style="padding:var(--space-6);">
              <div class="flex items-center justify-between" style="margin-bottom:var(--space-4);">
                <h3 style="font-family:var(--font-display); font-size:var(--text-lg); font-weight:var(--weight-bold); color:var(--color-steel-pure); margin:0;">
                  B2B Inquiries & Quotation Tracking
                </h3>
                <span class="badge badge-outline" style="font-size:10px;">${inquiries.length} Active Requests</span>
              </div>

              ${inquiries.length === 0 ? `
                <div style="text-align:center; padding:var(--space-8); color:var(--color-steel-muted); font-size:var(--text-sm);">
                  <p>No active quotations submitted yet.</p>
                  <a href="wholesale-custom-orders.html" class="btn btn-gold btn-sm" style="margin-top:12px;">Create Custom Order Request</a>
                </div>
              ` : `
                <div style="display:flex; flex-direction:column; gap:12px;">
                  ${inquiries.map((inq, idx) => `
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-md); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                      <div>
                        <div style="font-family:var(--font-display); font-size:var(--text-sm); font-weight:var(--weight-bold); color:var(--color-steel-pure);">
                          ${escapeHtml(inq.category)} • ${escapeHtml(inq.quantity)}
                        </div>
                        <div style="font-size:11px; color:var(--color-steel-muted); margin-top:2px;">
                          ${new Date(inq.submittedAt).toLocaleDateString()} • Ref: <span style="font-family:var(--font-mono); color:var(--color-gold-base);">RFQ-${1000 + idx}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="badge badge-gold" style="font-size:10px;">UNDER FACTORY REVIEW</span>
                        <a href="https://wa.me/923497400818?text=${encodeURIComponent('Inquiring about RFQ-' + (1000 + idx) + ': ' + inq.category)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px;">
                          WhatsApp Desk &rarr;
                        </a>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Turnkey Sets & Catalog Downloads -->
            <div class="card card-metallic" style="padding:var(--space-6);">
              <h3 style="font-family:var(--font-display); font-size:var(--text-lg); font-weight:var(--weight-bold); color:var(--color-steel-pure); margin:0 0 var(--space-3) 0;">
                Factory Resources & Compliance Downloads
              </h3>
              <p style="font-size:var(--text-xs); color:var(--color-steel-silver); line-height:1.6; margin-bottom:var(--space-4);">
                Authorized institutional clients receive direct access to official ASTM F899 metallurgy certificates, DIN 1/1 cassette layout blueprints, and the complete 19-set procedural catalog.
              </p>
              <div class="flex items-center gap-4 flex-wrap">
                <a href="wholesale-custom-orders.html" class="btn btn-secondary btn-sm">
                  Download Modular DIN Tray Specs (PDF)
                </a>
                <a href="contact.html" class="btn btn-secondary btn-sm">
                  Request Mill Test Metallurgical Certificate
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    const logoutBtn = container.querySelector('#btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.clearSession());
    }
  }

  attachEvents() {
    const tabSignIn = document.getElementById('tab-btn-signin');
    const tabSignUp = document.getElementById('tab-btn-signup');
    const panelSignIn = document.getElementById('panel-signin');
    const panelSignUp = document.getElementById('panel-signup');

    if (tabSignIn && tabSignUp && panelSignIn && panelSignUp) {
      tabSignIn.addEventListener('click', () => {
        tabSignIn.classList.add('is-active');
        tabSignUp.classList.remove('is-active');
        tabSignIn.setAttribute('aria-selected', 'true');
        tabSignUp.setAttribute('aria-selected', 'false');
        panelSignIn.hidden = false;
        panelSignUp.hidden = true;
      });

      tabSignUp.addEventListener('click', () => {
        tabSignUp.classList.add('is-active');
        tabSignIn.classList.remove('is-active');
        tabSignUp.setAttribute('aria-selected', 'true');
        tabSignIn.setAttribute('aria-selected', 'false');
        panelSignUp.hidden = false;
        panelSignIn.hidden = true;
      });
    }

    const formSignIn = document.getElementById('form-signin');
    if (formSignIn) {
      formSignIn.addEventListener('submit', (e) => this.handleSignIn(e));
    }

    const formSignUp = document.getElementById('form-signup');
    if (formSignUp) {
      formSignUp.addEventListener('submit', (e) => this.handleSignUp(e));
    }

    const forgotBtn = document.getElementById('btn-forgot-pw');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        const email = prompt('Enter your professional email to receive a password reset link:');
        if (email) {
          alert(`Password recovery instructions have been dispatched to ${email}. Please check your inbox.`);
        }
      });
    }
  }

  async handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!email || !password) return;

    // Simulate login & verify
    const user = {
      email,
      name: email.split('@')[0],
      role: 'Verified Medical Buyer',
      organization: 'International Surgical Client',
      signedInAt: new Date().toISOString()
    };

    this.saveSession(user);
    this.render();
  }

  async handleSignUp(e) {
    e.preventDefault();
    const fname = document.getElementById('signup-fname').value.trim();
    const lname = document.getElementById('signup-lname').value.trim();
    const role = document.getElementById('signup-role').value;
    const org = document.getElementById('signup-org').value.trim();
    const email = document.getElementById('signup-email').value.trim();

    if (!fname || !email) return;

    const user = {
      firstName: fname,
      lastName: lname,
      email,
      role,
      organization: org || 'Medical Institute',
      signedInAt: new Date().toISOString()
    };

    this.saveSession(user);
    this.render();
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
