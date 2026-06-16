/**
 * ADVOCATE CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 * This is the single source of truth for all advocate information.
 * To update any detail, edit ONLY this file.
 * All components read from here automatically.
 * ─────────────────────────────────────────────────────────────
 */

export const advocate = {
  // ── Identity ────────────────────────────────────────────────
  name: 'Rambabu Chintaparthi',
  displayName: 'Adv. Rambabu Chintaparthi',
  shortName: 'Adv. Rambabu Chintaparthi',
  title: 'Senior Advocate',
  tagline: 'Criminal Lawyer · Civil Advocate · Legal Consultant',

  // ── Photo ────────────────────────────────────────────────────
  // Place photo at /public/advocate-photo.jpg and set photoUrl below.
  // Leave as null to show the placeholder initials avatar.
  photoUrl: '/advocate-photo.jpg',
  photoInitial: 'R',

  // ── Bar Enrollment ───────────────────────────────────────────
  barCouncil: 'Bar Council of Andhra Pradesh',
  enrollmentNumber: 'AP/318/2002',
  enrolledYear: 2002,
  enrolledCourt: 'AP High Court',

  // ── Experience ───────────────────────────────────────────────
  yearsOfPractice: '25+',
  casesHandled: '250+',
  clientSatisfaction: '90%',

  // ── Qualifications ───────────────────────────────────────────
  qualifications: [
    'B.A — History & Political Science, SKVT Degree College, Rajahmundry (1994)',
    'B.L - Bachelor of Law, Andhra University (2001)',
  ],

  // ── Practice Areas ───────────────────────────────────────────
  // Keys are used for translations; keep them stable.
  practiceAreaKeys: [
    'criminal',
    'civil',
    'property',
    'family',
    'divorce',
    'domesticViolence',
    'cyberCrime',
    'consumer',
    'documentation',
    'writs',
  ],

  // ── Achievements ─────────────────────────────────────────────


  // ── Languages Spoken ─────────────────────────────────────────
  languagesSpoken: 'English · Telugu ',

  // ── Contact ──────────────────────────────────────────────────
  phones: ['+91 8074228486', '+91 9573259555'],
  primaryPhone: '918074228486',         // for tel: links (no spaces/+)
  emails: ['rambabuchintaparthi@gmail.com', 'advocaterambabuch@gmail.com'],
  primaryEmail: 'advocaterambabuch@gmail.com',

  // ── Office ───────────────────────────────────────────────────
  officeAddress: {
    line1: 'Pedda veedhi',
    line2: 'Danivaipeta, Rajahmundry - 533101',
    full: 'Adv. Rambabu Chintaparthi\nPedda veedhi,Opposite DMH school, Danivaipeta\nRajahmundry - 533101',
    mapQuery: 'Rajahmundry+District+Court',
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d953.8463635009277!2d81.7792879695782!3d17.004752981461262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37a38a952cca25%3A0xf4ca29e705de4779!2sRama%20Temple!5e0!3m2!1sen!2sin!4v1781456933879!5m2!1sen!2sin",
  },

  workingHours: {
    weekdays: 'Mon – Fri: 10:00 AM – 6:00 PM',
    saturday: 'Saturday: 10:00 AM – 2:00 PM',
    sunday: 'Sunday: Closed',
    // Appointment form slots
    appointmentSlots: {
      weekdays: '10:00 AM — 6:00 PM',
      saturday: '10:00 AM — 2:00 PM',
    },
  },

  // ── WhatsApp ─────────────────────────────────────────────────
  // Format: country code + number, no +, no spaces
  whatsappNumber: '919573259555',
  whatsappMessage: 'Hello%20Adv.%20Rambabu%20Chintaparthi%2C%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.',

  // ── Social Media ─────────────────────────────────────────────
  // Set to null to hide a platform icon
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61573891147728',
    instagram: null,
    twitter: null,
  },

  // ── Legal / Footer ───────────────────────────────────────────
  websiteUrl: 'https://rambabuchintaparthi.in',
  copyrightName: 'Adv. Rambabu Chintaparthi',
} as const;

/** Convenience getter: full WhatsApp URL */
export const whatsappUrl = () =>
  `https://wa.me/${advocate.whatsappNumber}?text=${advocate.whatsappMessage}`;
