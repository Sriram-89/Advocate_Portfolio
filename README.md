# ⚖️ Legal Consultation Website — Adv. Rajesh Kumar Singh

A production-ready, full-stack legal consultation website built with **Next.js 14**, **Tailwind CSS**, **Firebase Firestore**, and **Google Gemini AI**. Features a professional law-firm aesthetic, AI-powered legal guidance, voice input/output, appointment booking, and WhatsApp integration.

---

## 🗂️ Project Structure

```
legal-consultation-website/
├── app/
│   ├── api/
│   │   ├── ai-legal/route.ts        ← Gemini AI legal analysis endpoint
│   │   └── appointments/route.ts    ← Firebase appointment booking endpoint
│   ├── globals.css                  ← Global styles, Tailwind, fonts
│   ├── layout.tsx                   ← Root layout with metadata & dark mode
│   └── page.tsx                     ← Main page assembling all sections
├── components/
│   ├── Navbar.tsx                   ← Sticky nav with dark mode toggle
│   ├── Hero.tsx                     ← Hero section with photo, stats, CTAs
│   ├── About.tsx                    ← Advocate bio, qualifications, achievements
│   ├── Services.tsx                 ← 9 legal service cards
│   ├── AIAssistant.tsx              ← AI legal guidance with voice I/O
│   ├── Testimonials.tsx             ← Client testimonials
│   ├── Appointment.tsx              ← Firebase-backed booking form
│   ├── Contact.tsx                  ← Contact info + Google Maps
│   ├── Footer.tsx                   ← Footer with disclaimer, links
│   └── WhatsAppFloat.tsx            ← Floating WhatsApp button
├── lib/
│   └── firebase.ts                  ← Firebase client SDK config
├── .env.example                     ← Environment variables template
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Google Firebase project
- A Google Gemini API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd legal-consultation-website
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values (see setup guides below).

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Keys Setup

### Gemini AI (Google)

1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API key**
4. Copy the key → paste as `GEMINI_API_KEY` in `.env.local`

> Free tier: 15 requests/minute, 1 million tokens/day — sufficient for production.

---

### Firebase Setup

#### Step 1: Create Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g., `legal-site-rajesh`)
3. Disable Google Analytics (optional) → **Create project**

#### Step 2: Enable Firestore
1. In Firebase Console → **Firestore Database** → **Create database**
2. Select **Production mode** → choose region (e.g., `asia-south1` for India)
3. Click **Enable**

#### Step 3: Firestore Security Rules
In Firestore → **Rules**, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only server (Admin SDK) can write appointments
    match /appointments/{doc} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

This ensures only the server-side Admin SDK can write appointments.

#### Step 4: Web App Credentials (Client SDK)
1. Firebase Console → ⚙️ **Project Settings** → **Your apps** → **Add app** → Web
2. Register the app → copy the `firebaseConfig` values
3. Paste into `.env.local` as `NEXT_PUBLIC_FIREBASE_*` variables

#### Step 5: Service Account (Admin SDK)
1. Firebase Console → ⚙️ **Project Settings** → **Service accounts**
2. Click **Generate new private key** → download the JSON file
3. From the JSON file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` escaping)

---

## 🎨 Customization Guide

### Replace Advocate Information

All advocate details are in the component files. Search and replace:

| Placeholder | Replace With |
|---|---|
| `Adv. Rambabu Chintaparthi` | Actual advocate name |
| `+91 98765 43210` | Actual phone number |
| `adv.rajeshkumar@gmail.com` | Actual email |
| `DL/4821/2004` | Actual bar registration number |
| `Chamber No. 204, Delhi High Court...` | Actual office address |
| WhatsApp URL `919876543210` | Actual WhatsApp number |

### Add Advocate Photo

In `components/Hero.tsx`, find the photo placeholder div and replace with:

```tsx
<Image
  src="/advocate-photo.jpg"
  alt="Adv. Rambabu Chintaparthi"
  fill
  className="object-cover object-top"
  priority
/>
```

Place the photo file in `/public/advocate-photo.jpg`.

### Update Google Maps

In `components/Contact.tsx`, replace the Maps embed `src` URL with your actual office location embed URL:
1. Go to Google Maps → search your address
2. Click **Share** → **Embed a map** → copy the `src` URL

### Change WhatsApp Number

In both `components/WhatsAppFloat.tsx` and `components/Contact.tsx`, replace `919876543210` with the advocate's WhatsApp number (country code + number, no `+`).

---

## ☁️ Deployment on Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/legal-site.git
git push -u origin main
```

### Step 2: Import on Vercel
1. Go to [https://vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** (first deploy will fail — add env vars next)

### Step 3: Add Environment Variables
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add ALL variables from `.env.example` with their real values
3. Make sure to add for **Production**, **Preview**, and **Development**

### Step 4: Redeploy
1. Go to **Deployments** → click the failed deployment → **Redeploy**
2. Your site will be live at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)
1. Vercel → **Settings** → **Domains** → add your domain
2. Update DNS records as instructed

---

## 🔒 Security Notes

- **Never commit `.env.local`** — it's in `.gitignore`
- Legal issue queries are processed in real-time and **not stored** in any database
- Appointment data is stored securely in Firebase Firestore
- Firebase Admin SDK runs **only server-side** (API routes), never exposed to the browser
- Firestore rules block all direct client access

---

## 📱 Features

| Feature | Status |
|---|---|
| Mobile-first responsive design | ✅ |
| Dark mode (auto + toggle) | ✅ |
| AI legal guidance (Gemini) | ✅ |
| Voice input (Web Speech API) | ✅ |
| Voice output (Speech Synthesis) | ✅ |
| Appointment booking (Firebase) | ✅ |
| WhatsApp integration | ✅ |
| Google Maps embed | ✅ |
| SEO metadata | ✅ |
| Accessibility (WCAG AA) | ✅ |
| Dark/light mode | ✅ |
| Premium law-firm design | ✅ |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom CSS
- **Database:** Firebase Firestore
- **AI:** Google Gemini 1.5 Flash
- **Fonts:** Playfair Display + Inter (Google Fonts)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 📞 Support

For customization help, contact the developer. For legal inquiries, contact Adv. Rajesh Kumar Singh directly.

---

*© 2024 Adv. Rajesh Kumar Singh. All rights reserved.*
