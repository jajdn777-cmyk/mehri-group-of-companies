<div align="center">
<img width="1200" height="475" alt="Mehri OS Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mehri OS

**Mehri OS** is a smart fitness and health app. It helps you track your health, get advice from an AI coach, and read tips on how to stay fit and healthy.

## 🚀 Main Features

- **Activity Tracking:** A simple calendar to see your workouts and how many days in a row you have been active.
- **AI Coach Coach:** An AI that gives you a morning update, looks at your workouts, and gives you health tips.
- **Health Stats:** See your body stats and trends to understand your progress better.
- **Blog Section:** Read articles about health, sleep, and fitness.
- **Goals:** Set your own fitness goals and see when you reach them.
- **Mehri Tracker Sync:** Works with the Mehri Fitness tracker to get your body data into the app.
- **Works on Phone:** You can use it like a normal app on your phone.

## 🛠️ Tools Used

- **Website:** React and Vite (to make it fast).
- **Database:** Supabase (to save your data safely).
- **AI:** Google Gemini (the brain for the AI coach).
- **Design:** Tailwind CSS and Framer Motion (for smooth looks).

## ⚙️ How to Set Up

### What you need
- Node.js installed on your computer.
- A Supabase account.
- A Google Gemini API key.

### Steps to run

1. Download the code:
   ```bash
   git clone <repository-url>
   cd mehri-os
   ```

2. Install the app:
   ```bash
   npm install
   ```

3. Setup your keys:
   Create a file named `.env.local` and add these lines:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_GEMINI_API_KEY=your_key
   ```

4. Start the app:
   ```bash
   npm run dev
   ```

## 🏗️ Folder Layout

- `index.tsx`: The main part of the app.
- `Dashboard.tsx`: Your main home screen.
- `AI.tsx`: Where you talk to the AI coach.
- `Stats.tsx`: Your health charts and numbers.
- `Landing.tsx`: The first page people see.

## 📄 License

Only for the Mehri Group.

---

*Simple. Fast. Healthy.*
