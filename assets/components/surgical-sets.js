/**
 * XENTIA INDUSTRIES — SURGICAL SETS & MODULAR TRAYS CONFIGURATOR
 * Milestone 10 | js/components/surgical-sets.js
 *
 * Features:
 *  - 19-set official procedural catalog from Surgical_Sets_Catalog.pdf
 *  - Category filtering with animated pill navigation
 *  - Manifest inspection modal (WAI-ARIA dialog, keyboard trap, ESC close)
 *  - Interactive Modular DIN Tray Configurator (4 steps → live summary → RFQ)
 *  - Integrated WhatsApp direct inquiry routing
 *  - Full WCAG 2.2 Level AA accessibility
 */

// ============================================================================
// SURGICAL SETS CATALOG DATA (grounded in Surgical_Sets_Catalog.pdf)
// ============================================================================

export const SURGICAL_SETS_CATALOG = [
  {
    id: 'ss-01',
    name: 'General Surgery Set',
    category: 'general',
    categoryLabel: 'General & Ward',
    pieces: 24,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Full-theater ward and emergency surgery assembly',
    description: 'A comprehensive 24-piece general operating room set covering soft tissue dissection, hemostasis, retraction, and wound closure. Ideal for hospital ORs, outpatient theaters, and clinic ward procedures.',
    keyInstruments: ['Scalpel Handle #3 & #4', 'Mayo Scissors Curved 17cm', 'Metzenbaum Scissors 18cm', 'Tissue Forceps 1×2 Teeth', 'Needle Holder Mayo-Hegar 20cm', 'Allis Tissue Forceps × 4', 'Kocher Clamp × 4', 'Langenbeck Retractor × 2', 'Senn-Miller Retractor × 2', 'Towel Clips × 4'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the General Surgery Set (24 pieces). Please provide volume pricing and lead times.',
  },
  {
    id: 'ss-02',
    name: 'Plastic Surgery Set',
    category: 'plastic',
    categoryLabel: 'Plastic & Aesthetic',
    pieces: 28,
    traySize: 'DIN 1/1',
    highlight: true,
    tagline: 'Precision soft-tissue and aesthetic reconstruction assembly',
    description: 'A 28-piece premium set for plastic and reconstructive procedures. Includes fine-tipped dissectors, delicate spring scissors, and micro-needle holders for aesthetic suturing — favored by cosmetic surgery centers and reconstructive departments globally.',
    keyInstruments: ['Iris Scissors Curved 11.5cm', 'Stevens Tenotomy Scissors 11cm', 'Bishop-Harmon Forceps 0.5mm tips', 'Adson-Brown Forceps 12cm', 'Webster Needle Holder 13cm', 'Joseph Skin Hook × 2', 'Senn Retractor × 2', 'Army-Navy Retractor × 2', 'Backhaus Towel Clip × 4', 'Scalpel Handle #3 Fine × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Plastic Surgery Set (28 pieces). Please provide pricing and customization options.',
  },
  {
    id: 'ss-03',
    name: 'Rhinoplasty Specialist Set',
    category: 'plastic',
    categoryLabel: 'Plastic & Aesthetic',
    pieces: 32,
    traySize: 'DIN 1/1',
    highlight: true,
    tagline: 'Complete open and closed rhinoplasty surgical assembly',
    description: 'A 32-piece specialist set covering both open and closed rhinoplasty techniques. Includes Aufricht nasal retractors, osteotomes for dorsal reduction, rasps for contouring, cartilage scissors, and alar base instruments for tip refinement.',
    keyInstruments: ['Aufricht Nasal Retractor', 'Joseph Nasal Scissors Curved', 'Joseph Button-End Elevator', 'Cottle Elevator 19cm', 'Foman Nasal Scissors', 'Nasal Osteotome 3mm & 6mm', 'Mallet 250g', 'Rongeur Punch 2mm', 'Rubin Osteotome', 'Nasal Rasp Double-Ended'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Rhinoplasty Specialist Set (32 pieces). Please share pricing and available OEM options.',
  },
  {
    id: 'ss-04',
    name: 'ENT Surgery Set',
    category: 'ent-dental',
    categoryLabel: 'ENT & Dental',
    pieces: 26,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Ear, nose, and throat diagnostic and minor surgery assembly',
    description: 'A 26-piece ENT set covering diagnostic examination, nasal polypectomy, tonsillectomy, and minor ear procedures. Compatible with hospital ENT departments and specialty otolaryngology practices.',
    keyInstruments: ['Nasal Speculum Killian 10cm', 'Thudicum Nasal Speculum', 'Ear Speculum × 4 sizes', 'Hartmann Ear Forceps', 'Politzer Auscultation Tube', 'Bayonet Forceps 18cm', 'Wilde Ear Forceps', 'Freer Periosteal Elevator', 'Antrum Punch Rongeur', 'Tongue Depressor × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the ENT Surgery Set (26 pieces). Please advise on volume options.',
  },
  {
    id: 'ss-05',
    name: 'Orthopedic Trauma Set',
    category: 'ortho-spine',
    categoryLabel: 'Orthopedic & Spine',
    pieces: 38,
    traySize: 'DIN 1/1',
    highlight: true,
    tagline: 'Fracture reduction, fixation, and soft-tissue repair assembly',
    description: 'A 38-piece orthopedic trauma set for fracture stabilization, bone reduction, and soft-tissue repair. Built from ASTM F899 martensitic stainless steel with HRC 52–56 cryo-hardening for sustained impact load performance.',
    keyInstruments: ['Reduction Forceps with Serrations × 2', 'Bone Holding Forceps × 2', 'Periosteal Elevator Cobb 23cm', 'Bone Rasp Double-Ended', 'Mallet 400g', 'Bone Rongeur Double-Action', 'Leksell Rongeur 20cm', 'Lewin Bone-Holding Forceps', 'Langenbeck Retractor × 4', 'Hohmann Retractor × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Orthopedic Trauma Set (38 pieces). Please share pricing and tray configurations.',
  },
  {
    id: 'ss-06',
    name: 'Neurosurgery Set',
    category: 'ortho-spine',
    categoryLabel: 'Orthopedic & Spine',
    pieces: 34,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Cranial and spinal access and neural-tissue surgery assembly',
    description: 'A 34-piece neurosurgical set for craniotomies, laminectomies, and neural tissue procedures. Each instrument is individually balanced for fine tactile feedback and features a satin anti-glare finish to reduce OR illumination scatter.',
    keyInstruments: ['Dandy Scalp Clip × 8', 'Brain Spatula × 3 widths', 'Penfield Dissector Set × 5', 'Dura Scissors Curved 14cm', 'Yasargil Clip Applier', 'Bone Curette Set × 5', 'Kerrison Punch 2mm & 3mm', 'Adson Rongeur 7mm', 'Gelpi Retractor', 'Weitlaner Retractor × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Neurosurgery Set (34 pieces). Please advise on available configurations.',
  },
  {
    id: 'ss-07',
    name: 'Ophthalmic Micro-Surgery Set',
    category: 'specialty',
    categoryLabel: 'Veterinary & Specialty',
    pieces: 20,
    traySize: 'DIN 1/2',
    highlight: false,
    tagline: 'Precision micro-incision cataract and eyelid surgery assembly',
    description: 'A 20-piece ophthalmic micro-surgery set for cataract extraction, eyelid procedures, and corneal surgeries. Built to ±0.01mm dimensional tolerance; instruments are individually inspected under 10x magnification.',
    keyInstruments: ['Vannas Capsulotomy Scissors', 'Castroviejo Corneal Scissors', 'Iris Forceps 0.12mm × 2', 'Thornton Fixation Ring', 'Lens Manipulator Hook', 'Jaffe Lid Speculum', 'Desmarres Lid Retractor × 2', 'Chalazion Forceps', 'Caliper Castroviejo', 'Cannula BSS Irrigation × 3'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Ophthalmic Micro-Surgery Set (20 pieces). Please provide pricing details.',
  },
  {
    id: 'ss-08',
    name: 'Dental Implantology Tray',
    category: 'ent-dental',
    categoryLabel: 'ENT & Dental',
    pieces: 22,
    traySize: 'Mini Cassette',
    highlight: true,
    tagline: 'Immediate-load and delayed implant placement assembly',
    description: 'A 22-piece dental implantology instrument tray for single-stage and two-stage implant placements. Compatible with all major implant system torque drivers. Packaged in Mini DIN laser-engraved cassette with silicone bit holders.',
    keyInstruments: ['Periosteal Elevator Molt #9', 'Straight Elevator #301', 'Tissue Punch 3mm & 4mm', 'Bone Spreader Set × 3', 'Surgical Mallet 200g', 'Irrigation Cannula 21G', 'Suture Scissors 11.5cm', 'Adson Forceps', 'Implant Torque Adapter', 'Flap Retractor × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Dental Implantology Tray (22 pieces). Please share customization and bulk pricing options.',
  },
  {
    id: 'ss-09',
    name: 'Veterinary Orthopedic Set',
    category: 'specialty',
    categoryLabel: 'Veterinary & Specialty',
    pieces: 30,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Small and large animal fracture fixation assembly',
    description: 'A 30-piece veterinary orthopedic instrument set for small and large animal surgeries including fracture fixation, bone plating, soft-tissue repair, and tendon reattachment across canine, feline, and equine patients.',
    keyInstruments: ['Bone-Holding Forceps Small & Large', 'Periosteal Elevator Freer', 'Mallet 300g', 'Bone Rongeur Small', 'Stille-Luer Rongeur', 'Reduction Forceps × 2', 'Kern Bone-Holding Forceps', 'Hohmann Retractor Small × 2', 'Gelpi Retractor', 'Curette Set × 4'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Veterinary Orthopedic Set (30 pieces). Please advise on bulk pricing.',
  },
  {
    id: 'ss-10',
    name: 'Gynecology & Obstetrics Set',
    category: 'general',
    categoryLabel: 'General & Ward',
    pieces: 28,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Diagnostic and minor gynecological procedure assembly',
    description: 'A 28-piece gynecology set covering diagnostic examination, minor surgical procedures, D&C, colposcopy, and hysteroscopy instrumentation. Polished to mirror finish for maximum sterilization efficacy.',
    keyInstruments: ['Cusco Vaginal Speculum × 3 sizes', 'Sims Vaginal Speculum', 'Uterine Sound', 'Hegar Cervical Dilators Set', 'Sponge Forceps × 2', 'Allis Forceps × 2', 'Tenaculum Forceps', 'Placenta Forceps', 'Endometrial Curette × 3', 'Needle Holder 20cm'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Gynecology & Obstetrics Set. Please provide pricing and available specifications.',
  },
  {
    id: 'ss-11',
    name: 'Urology Set',
    category: 'specialty',
    categoryLabel: 'Veterinary & Specialty',
    pieces: 22,
    traySize: 'DIN 1/2',
    highlight: false,
    tagline: 'Endoscopic and open urological procedure assembly',
    description: 'A 22-piece urology instrument set for open and endoscopic procedures including catheterization, cystoscopy, circumcision, and minor bladder interventions. All instruments feature satin anti-glare finish.',
    keyInstruments: ['Urethral Dilator Béniqué Set', 'Catheter Guide Curved', 'Bladder Syringe 100ml', 'Urethrotome Sachse', 'Van Buren Sound × 5', 'Kidney Stone Forceps', 'Lowsley Retractor', 'Alcock Catheter Clamp', 'Trocar & Cannula Set', 'Bladder Neck Retractor'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Urology Set (22 pieces). Please share specifications and pricing.',
  },
  {
    id: 'ss-12',
    name: 'Maxillofacial Set',
    category: 'ent-dental',
    categoryLabel: 'ENT & Dental',
    pieces: 30,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Jaw osteotomy and facial fracture fixation assembly',
    description: 'A 30-piece maxillofacial surgical set for mandibular fractures, Le Fort osteotomies, orthognathic surgery, and temporomandibular joint procedures.',
    keyInstruments: ['Dingman Mouth Gag', 'Obwegeser Periosteal Elevator × 3', 'Rowe Zygoma Forceps', 'Hayton-Williams Forceps', 'Kawamoto Osteotome Set × 4', 'Sagittal Saw Handpiece', 'Mallet 300g', 'Channel Retractor × 2', 'Tessier Orbital Retractor', 'Plate-Bending Pliers'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Maxillofacial Set (30 pieces). Please provide pricing details.',
  },
  {
    id: 'ss-13',
    name: 'Cardiovascular & Thoracic Set',
    category: 'specialty',
    categoryLabel: 'Veterinary & Specialty',
    pieces: 40,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Open-heart surgery and thoracic access assembly',
    description: 'A premium 40-piece cardiovascular and thoracic set for sternotomies, valve replacements, CABG procedures, and thoracotomies. Each instrument is individually tested for jaw alignment, handle balance, and tip precision.',
    keyInstruments: ['Sternal Saw Handle', 'Cooley Retractor', 'DeBakey Aortic Clamp', 'Satinsky Vascular Clamp × 2', 'Bulldog Clamp × 4', 'Potts-Smith Scissors', 'DeBakey Forceps 30cm', 'Finochietto Rib Spreader', 'Needle Holder Cooley × 2', 'Vascular Suction Cannula'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Cardiovascular & Thoracic Set (40 pieces). Please provide institutional pricing.',
  },
  {
    id: 'ss-14',
    name: 'Arthroscopy Set',
    category: 'ortho-spine',
    categoryLabel: 'Orthopedic & Spine',
    pieces: 18,
    traySize: 'DIN 1/2',
    highlight: false,
    tagline: 'Minimally invasive joint inspection and repair assembly',
    description: 'An 18-piece arthroscopic instrument set for knee, shoulder, hip, and wrist joint procedures. Compatible with standard 4mm arthroscope systems and ACUFEX/STORZ portal access systems.',
    keyInstruments: ['Trocar Sharp 5mm', 'Trocar Blunt 5mm × 2', 'Arthroscopic Probe Hook', 'Basket Punch 2.7mm Curved', 'Grasping Forceps 3.5mm', 'Scissor Punch Curved', 'Shaver Bur Interface Adapter', 'Suture Retriever × 2', 'Meniscal Rasp', 'Outflow Cannula × 3'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Arthroscopy Set (18 pieces). Please advise on availability and pricing.',
  },
  {
    id: 'ss-15',
    name: 'Spine Surgery Set',
    category: 'ortho-spine',
    categoryLabel: 'Orthopedic & Spine',
    pieces: 36,
    traySize: 'DIN 1/1',
    highlight: true,
    tagline: 'Decompression, fusion, and instrumentation assembly',
    description: 'A 36-piece spinal surgery instrument set for laminectomies, discectomies, pedicle screw placement, and TLIF/PLIF fusion procedures. Built to withstand repeated autoclave cycles across high-volume spine departments.',
    keyInstruments: ['Cobb Periosteal Elevator × 3', 'Kerrison Rongeur 2mm & 3mm × 2', 'Love Root Retractor × 2', 'Leksell Rongeur', 'Pituitary Rongeur Straight & Angled', 'Penfield Dissector × 3', 'Bone Curette Angled × 3', 'Taylor Retractor × 2', 'Caspar Distractor', 'Disc Rongeur 2mm & 4mm'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Spine Surgery Set (36 pieces). Please share pricing and tray configuration options.',
  },
  {
    id: 'ss-16',
    name: 'Laparoscopic Set',
    category: 'general',
    categoryLabel: 'General & Ward',
    pieces: 16,
    traySize: 'DIN 1/2',
    highlight: false,
    tagline: 'Minimally invasive abdominal surgery assembly',
    description: 'A 16-piece laparoscopic instrument set for cholecystectomies, appendectomies, hernia repairs, and diagnostic laparoscopy. All instruments feature ergonomic rotating handles and 5mm diameter working shafts.',
    keyInstruments: ['Veress Needle 12cm', 'Trocar 5mm × 3', 'Trocar 10mm × 2', 'Maryland Dissector 5mm', 'Grasper Atraumatic 5mm × 2', 'Hook Electrosurgery Cautery 5mm', 'Clip Applier 10mm', 'Scissors Curved 5mm', 'Suction-Irrigation Cannula 5mm', 'Fan Retractor 10mm'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Laparoscopic Set (16 pieces). Please provide specifications and pricing.',
  },
  {
    id: 'ss-17',
    name: 'BBL Body Contouring Set',
    category: 'plastic',
    categoryLabel: 'Plastic & Aesthetic',
    pieces: 24,
    traySize: 'DIN 1/1',
    highlight: true,
    tagline: 'Brazilian butt lift infiltration and fat transfer assembly',
    description: 'A 24-piece BBL and gluteal augmentation instrument set for tumescent infiltration, lipoaspirate harvesting, purification, and structured fat injection. Crafted for aesthetic surgery centers performing high-volume BBL procedures.',
    keyInstruments: ['Infiltration Cannula 3mm × 30cm × 3', 'Infiltration Cannula 4mm × 35cm × 2', 'Liposuction Cannula Coleman 3mm × 4', 'Liposuction Cannula Mercedes 4mm × 3', 'Aspiration Cannula Tulip 3mm × 2', 'Fat Injection Cannula 1.2mm × 2', 'Luer-Lock Syringe Adapter', 'Harvesting Hub Connector', 'Blunt Tip Cannula 18G × 4', 'Sterile Connector Kit'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the BBL Body Contouring Set (24 pieces). Please share pricing and available configurations.',
  },
  {
    id: 'ss-18',
    name: 'Liposuction Infiltration Set',
    category: 'plastic',
    categoryLabel: 'Plastic & Aesthetic',
    pieces: 20,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Tumescent infiltration and body sculpting cannula assembly',
    description: 'A 20-piece liposuction instrument set for traditional tumescent liposuction across the abdomen, flanks, thighs, and arms. Multiple cannula diameters support both rough harvest and final feathering passes.',
    keyInstruments: ['Infiltration Cannula 3mm × 25cm × 3', 'Infiltration Cannula 4mm × 30cm × 2', 'Mercedes Cannula 3mm × 30cm × 3', 'Mercedes Cannula 4mm × 35cm × 2', 'Cobra Cannula 4mm × 2', 'Spatula Cannula 4mm × 2', 'Tissue Guard Cannula', 'Fine Finishing Cannula 2mm × 2', 'Connector Hub Assembly', 'Drainage Tube × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Liposuction Infiltration Set (20 pieces). Please provide bulk pricing options.',
  },
  {
    id: 'ss-19',
    name: 'Mommy Makeover Combination Set',
    category: 'plastic',
    categoryLabel: 'Plastic & Aesthetic',
    pieces: 46,
    traySize: 'DIN 1/1',
    highlight: false,
    tagline: 'Post-partum breast, abdomen, and body restoration assembly',
    description: 'A comprehensive 46-piece combination set covering tummy tuck (abdominoplasty), mastopexy (breast lift), liposuction, and labiaplasty in a single DIN 1/1 cassette configuration — favored by high-volume aesthetic surgery centers.',
    keyInstruments: ['Mayo Scissors 18cm Curved × 2', 'Metzenbaum Scissors 20cm × 2', 'Adson Tissue Forceps × 2', 'Allis Forceps × 4', 'Kocher Clamp × 4', 'Army-Navy Retractor × 4', 'Joseph Skin Hook × 4', 'Needle Holder Mayo 20cm × 2', 'Langenbeck Retractor × 2', 'Infiltration Cannula 3mm × 2 + 4mm × 2'],
    autoclave: true,
    whatsappMsg: 'Hello Xentia Industries, I am inquiring about the Mommy Makeover Combination Set (46 pieces). Please advise on pricing and customization options.',
  },
];

// ============================================================================
// TRAY CONFIGURATOR DATA
// ============================================================================

export const TRAY_OPTIONS = {
  sizes: [
    { id: 'din-full',  label: 'DIN 1/1 Full', dims: '480 × 250 mm', desc: 'Full-size theater cassette — suitable for 20–50 piece general surgery or orthopedic sets.', icon: '▬' },
    { id: 'din-half',  label: 'DIN 1/2 Half', dims: '285 × 280 mm', desc: 'Half-size cassette — ideal for specialty sets of 12–25 pieces (arthroscopy, urology, ENT).', icon: '▪' },
    { id: 'din-3q',    label: 'DIN 3/4',       dims: '465 × 280 mm', desc: 'Three-quarter cassette — suits complex specialty sets of 18–36 pieces.', icon: '◩' },
    { id: 'din-mini',  label: 'Mini Cassette', dims: '180 × 140 mm', desc: 'Compact dental/ophthalmic cassette — for 8–18 precision micro-instruments.', icon: '▫' },
  ],
  colors: [
    { id: 'blue',   label: 'Hospital Blue',   hex: '#1E6FCF', desc: 'Rapid OR identification — general surgery departments.' },
    { id: 'gold',   label: 'Surgical Gold',   hex: '#C5A028', desc: 'Premium sterile indication — cardiothoracic and neuro.' },
    { id: 'slate',  label: 'Titanium Slate',  hex: '#5A6475', desc: 'Universal neutral — suitable for all specialties.' },
    { id: 'green',  label: 'Emerald Green',   hex: '#1B6B45', desc: 'Infection control — orthopedic and obstetric theaters.' },
  ],
  silicone: [
    { id: 'perforated',  label: 'Perforated Mat',       desc: 'Standard USP Class VI silicone mat. Ventilated for steam sterilization.' },
    { id: 'bracket',     label: 'Bracket Holders',      desc: 'Individual spring-loaded brackets — prevents instrument movement during transport.' },
    { id: 'dual-tier',   label: 'Double-Tier Rack',     desc: 'Two-level stacking rack — doubles instrument capacity per cassette footprint.' },
    { id: 'tip-guard',   label: 'Tip-Guard Inserts',    desc: 'Precision-cut silicone tip sleeves — protects needle holders, scissors, and micro-forceps.' },
  ],
  engraving: [
    { id: 'none',       label: 'No Marking',           desc: 'Standard tray, no engraving.' },
    { id: 'hospital',   label: 'Hospital Logo + Name', desc: 'Custom hospital crest and department name via 20µm MOPA fiber-laser.' },
    { id: 'udi',        label: 'GS1 UDI DataMatrix',   desc: 'FDA-compliant Unique Device Identification barcode for full traceability.' },
    { id: 'both',       label: 'Logo + UDI',           desc: 'Combined hospital branding with GS1 UDI compliance.' },
  ],
};

// ============================================================================
// CATEGORY FILTER OPTIONS
// ============================================================================

const CATEGORIES = [
  { id: 'all',          label: 'All Sets' },
  { id: 'plastic',      label: 'Plastic & Aesthetic' },
  { id: 'ortho-spine',  label: 'Orthopedic & Spine' },
  { id: 'general',      label: 'General & Ward' },
  { id: 'ent-dental',   label: 'ENT & Dental' },
  { id: 'specialty',    label: 'Veterinary & Specialty' },
];

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

export class SurgicalSetsController {
  constructor({ sectionId = 'surgical-sets' } = {}) {
    this.sectionId = sectionId;
    this.activeCategory = 'all';
    this.activeSet = null;
    this.manifesModal = null;

    // Tray configurator state
    this.trayConfig = {
      size: 'din-full',
      color: 'blue',
      silicone: 'perforated',
      engraving: 'none',
    };
  }

  init() {
    const section = document.getElementById(this.sectionId);
    if (!section) return;

    this._renderSetsGrid();
    this._renderTrayConfigurator();
    this._bindFilterNav();
    this._bindManifestModal();
    this._bindTrayConfigurator();
  }

  // --------------------------------------------------------------------------
  // RENDER SETS GRID
  // --------------------------------------------------------------------------

  _getFilteredSets() {
    if (this.activeCategory === 'all') return SURGICAL_SETS_CATALOG;
    return SURGICAL_SETS_CATALOG.filter(s => s.category === this.activeCategory);
  }

  _renderSetsGrid() {
    const grid = document.getElementById('surgical-sets-grid');
    if (!grid) return;
    const sets = this._getFilteredSets();
    grid.innerHTML = sets.map(set => this._renderSetCard(set)).join('');
  }

  _renderSetCard(set) {
    const waLink = `https://wa.me/923497400818?text=${encodeURIComponent(set.whatsappMsg)}`;
    const rfqUrl = `wholesale-custom-orders.html?set=${encodeURIComponent(set.id)}&name=${encodeURIComponent(set.name)}&pieces=${set.pieces}`;
    const highlightBadge = set.highlight ? `<span class="set-highlight-badge">FEATURED</span>` : '';
    const keyItems = set.keyInstruments.slice(0, 5).map(k => `<li>${k}</li>`).join('');
    const moreCount = set.keyInstruments.length > 5 ? `<li class="set-manifest-more">+ ${set.keyInstruments.length - 5} more instruments</li>` : '';

    return `
      <article class="set-card" data-set-id="${set.id}" aria-label="${set.name}">
        <div class="set-card-header">
          ${highlightBadge}
          <span class="set-piece-count-badge">${set.pieces} PIECES</span>
          <span class="set-tray-badge">${set.traySize}</span>
        </div>
        <div class="set-card-body">
          <p class="set-card-category">${set.categoryLabel}</p>
          <h3 class="set-card-title">${set.name}</h3>
          <p class="set-card-tagline">${set.tagline}</p>
          <ul class="set-manifest-preview" aria-label="Key instruments in ${set.name}">
            ${keyItems}${moreCount}
          </ul>
          <div class="set-card-meta">
            <span class="set-autoclave-badge" title="134°C Steam Autoclave Compatible">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              134°C AUTOCLAVE
            </span>
            <span class="set-origin-badge">SIALKOT DIRECT</span>
          </div>
        </div>
        <div class="set-card-actions">
          <button class="btn btn-primary btn-sm" onclick="window.surgicalSetsController.openManifest('${set.id}')" aria-haspopup="dialog">
            INSPECT MANIFEST
          </button>
          <a href="${rfqUrl}" class="btn btn-secondary btn-sm">
            REQUEST SET RFQ
          </a>
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-wa-set" aria-label="WhatsApp inquiry for ${set.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </article>
    `;
  }

  // --------------------------------------------------------------------------
  // FILTER NAVIGATION
  // --------------------------------------------------------------------------

  _bindFilterNav() {
    const nav = document.getElementById('sets-filter-nav');
    if (!nav) return;

    nav.addEventListener('click', e => {
      const pill = e.target.closest('.set-filter-pill');
      if (!pill) return;
      const cat = pill.getAttribute('data-category');
      if (!cat) return;

      this.activeCategory = cat;

      // Update pill states
      nav.querySelectorAll('.set-filter-pill').forEach(p => {
        const active = p.getAttribute('data-category') === cat;
        p.classList.toggle('is-active', active);
        p.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      // Re-render grid with animation
      const grid = document.getElementById('surgical-sets-grid');
      if (grid) {
        grid.style.opacity = '0';
        grid.style.transform = 'translateY(12px)';
        setTimeout(() => {
          this._renderSetsGrid();
          grid.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          grid.style.opacity = '1';
          grid.style.transform = 'translateY(0)';
        }, 180);
      }
    });

    // Keyboard navigation on filter pills
    nav.addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const pills = [...nav.querySelectorAll('.set-filter-pill')];
      const idx = pills.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (idx + 1) % pills.length : (idx - 1 + pills.length) % pills.length;
      pills[next].focus();
      pills[next].click();
    });
  }

  // --------------------------------------------------------------------------
  // MANIFEST MODAL
  // --------------------------------------------------------------------------

  openManifest(setId) {
    const set = SURGICAL_SETS_CATALOG.find(s => s.id === setId);
    if (!set) return;
    this.activeSet = set;

    const modal = document.getElementById('manifest-modal');
    const content = document.getElementById('manifest-modal-content');
    if (!modal || !content) return;

    const waLink = `https://wa.me/923497400818?text=${encodeURIComponent(set.whatsappMsg)}`;
    const rfqUrl = `wholesale-custom-orders.html?set=${encodeURIComponent(set.id)}&name=${encodeURIComponent(set.name)}&pieces=${set.pieces}`;

    content.innerHTML = `
      <div class="manifest-modal-header">
        <div class="manifest-modal-meta">
          <span class="set-piece-count-badge">${set.pieces} PIECES</span>
          <span class="set-tray-badge">${set.traySize}</span>
          <span class="manifest-modal-cat">${set.categoryLabel}</span>
        </div>
        <h2 class="manifest-modal-title" id="manifest-modal-heading">${set.name}</h2>
        <p class="manifest-modal-desc">${set.description}</p>
      </div>
      <div class="manifest-modal-body">
        <h3 class="manifest-instruments-heading">COMPLETE BILL OF MATERIALS</h3>
        <ul class="manifest-instruments-list" aria-label="Instrument manifest for ${set.name}">
          ${set.keyInstruments.map((k, i) => `
            <li class="manifest-instrument-row">
              <span class="manifest-item-no">${String(i + 1).padStart(2, '0')}</span>
              <span class="manifest-item-name">${k}</span>
            </li>
          `).join('')}
        </ul>
        <div class="manifest-modal-specs">
          <div class="manifest-spec-item">
            <span class="manifest-spec-label">MATERIAL</span>
            <span class="manifest-spec-val">ASTM F899 / AISI 420 Stainless Steel</span>
          </div>
          <div class="manifest-spec-item">
            <span class="manifest-spec-label">HARDNESS</span>
            <span class="manifest-spec-val">HRC 52–56 Cryo-Treated</span>
          </div>
          <div class="manifest-spec-item">
            <span class="manifest-spec-label">STERILIZATION</span>
            <span class="manifest-spec-val">134°C Steam Autoclave (ASTM A967)</span>
          </div>
          <div class="manifest-spec-item">
            <span class="manifest-spec-label">ORIGIN</span>
            <span class="manifest-spec-val">Sialkot, Pakistan</span>
          </div>
          <div class="manifest-spec-item">
            <span class="manifest-spec-label">TRAY SIZE</span>
            <span class="manifest-spec-val">${set.traySize} Anodized Aluminum DIN Cassette</span>
          </div>
          <div class="manifest-spec-item">
            <span class="manifest-spec-label">CUSTOMIZATION</span>
            <span class="manifest-spec-val">Available — Laser marking, custom finishes, silicone layouts</span>
          </div>
        </div>
      </div>
      <div class="manifest-modal-actions">
        <a href="${rfqUrl}" class="btn btn-primary">REQUEST SET RFQ</a>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WHATSAPP FACTORY DESK
        </a>
        <button class="btn btn-ghost" onclick="window.surgicalSetsController.closeManifest()">CLOSE</button>
      </div>
    `;

    modal.setAttribute('aria-labelledby', 'manifest-modal-heading');
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus management
    const firstFocusable = modal.querySelector('a, button, [tabindex="0"]');
    if (firstFocusable) firstFocusable.focus();
  }

  closeManifest() {
    const modal = document.getElementById('manifest-modal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.activeSet = null;
  }

  _bindManifestModal() {
    const modal = document.getElementById('manifest-modal');
    if (!modal) return;

    // ESC key to close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hidden) {
        this.closeManifest();
      }
    });

    // Backdrop click to close
    modal.addEventListener('click', e => {
      if (e.target === modal) this.closeManifest();
    });

    // Focus trap within modal
    modal.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('a, button, [tabindex="0"]')].filter(el => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // --------------------------------------------------------------------------
  // TRAY CONFIGURATOR
  // --------------------------------------------------------------------------

  _renderTrayConfigurator() {
    const container = document.getElementById('tray-configurator-container');
    if (!container) return;

    container.innerHTML = `
      <div class="tray-configurator-card">
        <div class="tray-config-steps">

          <!-- Step 1: DIN Size -->
          <div class="tray-config-step">
            <h4 class="tray-step-label">
              <span class="tray-step-no">01</span>CASSETTE SIZE
            </h4>
            <div class="tray-option-grid" role="radiogroup" aria-label="Select DIN tray size" id="config-size-group">
              ${TRAY_OPTIONS.sizes.map(s => `
                <button class="tray-option-btn ${s.id === this.trayConfig.size ? 'is-active' : ''}"
                        data-config="size" data-value="${s.id}"
                        role="radio" aria-checked="${s.id === this.trayConfig.size ? 'true' : 'false'}"
                        title="${s.desc}">
                  <span class="tray-option-icon" aria-hidden="true">${s.icon}</span>
                  <span class="tray-option-name">${s.label}</span>
                  <span class="tray-option-dims">${s.dims}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 2: Anodizing Color -->
          <div class="tray-config-step">
            <h4 class="tray-step-label">
              <span class="tray-step-no">02</span>ANODIZED COLOR
            </h4>
            <div class="tray-color-row" role="radiogroup" aria-label="Select anodizing color" id="config-color-group">
              ${TRAY_OPTIONS.colors.map(c => `
                <button class="tray-color-btn ${c.id === this.trayConfig.color ? 'is-active' : ''}"
                        data-config="color" data-value="${c.id}"
                        role="radio" aria-checked="${c.id === this.trayConfig.color ? 'true' : 'false'}"
                        aria-label="${c.label}: ${c.desc}"
                        title="${c.desc}">
                  <span class="tray-color-swatch" style="background:${c.hex};" aria-hidden="true"></span>
                  <span class="tray-color-name">${c.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 3: Silicone Layout -->
          <div class="tray-config-step">
            <h4 class="tray-step-label">
              <span class="tray-step-no">03</span>SILICONE LAYOUT
            </h4>
            <div class="tray-option-grid" role="radiogroup" aria-label="Select silicone cushioning layout" id="config-silicone-group">
              ${TRAY_OPTIONS.silicone.map(s => `
                <button class="tray-option-btn ${s.id === this.trayConfig.silicone ? 'is-active' : ''}"
                        data-config="silicone" data-value="${s.id}"
                        role="radio" aria-checked="${s.id === this.trayConfig.silicone ? 'true' : 'false'}"
                        title="${s.desc}">
                  <span class="tray-option-name">${s.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 4: Laser Engraving -->
          <div class="tray-config-step">
            <h4 class="tray-step-label">
              <span class="tray-step-no">04</span>LASER MARKING
            </h4>
            <div class="tray-option-grid" role="radiogroup" aria-label="Select laser engraving option" id="config-engraving-group">
              ${TRAY_OPTIONS.engraving.map(e => `
                <button class="tray-option-btn ${e.id === this.trayConfig.engraving ? 'is-active' : ''}"
                        data-config="engraving" data-value="${e.id}"
                        role="radio" aria-checked="${e.id === this.trayConfig.engraving ? 'true' : 'false'}"
                        title="${e.desc}">
                  <span class="tray-option-name">${e.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Live Summary -->
        <div class="tray-config-summary" id="tray-config-summary" aria-live="polite" aria-label="Current tray configuration summary">
          ${this._renderConfigSummary()}
        </div>
      </div>
    `;
  }

  _renderConfigSummary() {
    const size = TRAY_OPTIONS.sizes.find(s => s.id === this.trayConfig.size);
    const color = TRAY_OPTIONS.colors.find(c => c.id === this.trayConfig.color);
    const silicone = TRAY_OPTIONS.silicone.find(s => s.id === this.trayConfig.silicone);
    const engraving = TRAY_OPTIONS.engraving.find(e => e.id === this.trayConfig.engraving);

    const rfqMsg = `Hello Xentia Industries, I would like to configure a custom modular DIN sterilization tray with the following specifications: Size: ${size?.label}, Anodizing: ${color?.label}, Silicone: ${silicone?.label}, Laser Marking: ${engraving?.label}. Please advise on pricing and lead times.`;
    const waLink = `https://wa.me/923497400818?text=${encodeURIComponent(rfqMsg)}`;
    const rfqUrl = `wholesale-custom-orders.html?tray=custom&size=${this.trayConfig.size}&color=${this.trayConfig.color}&silicone=${this.trayConfig.silicone}&engraving=${this.trayConfig.engraving}`;

    return `
      <h4 class="tray-summary-heading">YOUR TRAY CONFIGURATION</h4>
      <div class="tray-summary-grid">
        <div class="tray-summary-row">
          <span class="tray-summary-label">CASSETTE</span>
          <span class="tray-summary-val">${size?.label} (${size?.dims})</span>
        </div>
        <div class="tray-summary-row">
          <span class="tray-summary-label">ANODIZING</span>
          <span class="tray-summary-val">
            <span class="tray-sum-swatch" style="background:${color?.hex};" aria-hidden="true"></span>
            ${color?.label}
          </span>
        </div>
        <div class="tray-summary-row">
          <span class="tray-summary-label">SILICONE</span>
          <span class="tray-summary-val">${silicone?.label}</span>
        </div>
        <div class="tray-summary-row">
          <span class="tray-summary-label">MARKING</span>
          <span class="tray-summary-val">${engraving?.label}</span>
        </div>
      </div>
      <div class="tray-summary-actions">
        <a href="${rfqUrl}" class="btn btn-primary btn-sm">SUBMIT TRAY RFQ</a>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          WHATSAPP FACTORY DESK
        </a>
      </div>
    `;
  }

  _bindTrayConfigurator() {
    const container = document.getElementById('tray-configurator-container');
    if (!container) return;

    container.addEventListener('click', e => {
      const btn = e.target.closest('.tray-option-btn, .tray-color-btn');
      if (!btn) return;

      const configKey = btn.getAttribute('data-config');
      const configVal = btn.getAttribute('data-value');
      if (!configKey || !configVal) return;

      this.trayConfig[configKey] = configVal;

      // Update active state in the button group
      const group = btn.closest('[role="radiogroup"]');
      if (group) {
        group.querySelectorAll('.tray-option-btn, .tray-color-btn').forEach(b => {
          const active = b.getAttribute('data-value') === configVal;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-checked', active ? 'true' : 'false');
        });
      }

      // Update live summary
      const summary = document.getElementById('tray-config-summary');
      if (summary) summary.innerHTML = this._renderConfigSummary();
    });
  }
}
