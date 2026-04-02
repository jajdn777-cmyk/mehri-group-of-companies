
export const MEHRI_MINT = "#A7F3D0";
export const MEHRI_SLATE = "#1E293B";

const env = (import.meta as any).env || {};

export const ADMIN_EMAIL = env.VITE_ADMIN_EMAIL || 'jajdn777@gmail.com';
export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID || "241496801920-tl10cd23573shtau5nouhh7o4mrfmvmo.apps.googleusercontent.com";

export const CONFIG = {
  REDIRECT_URL: "https://mehrigroupofcompanies.com"
};

export const getLocalTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TODAY_STR = getLocalTodayStr();

export const ROUTE_APPLICABLE_TYPES = [
  "Run", "Walk", "Cycling (Outdoor)", "Hiking", "Trail Run", "Jogging", "Rucking", "Sprinting"
];

export const ACTIVITY_CATEGORIES: Record<string, string[]> = {
  "Cardio": ["Run", "Walk", "Treadmill Run", "Cycling (Outdoor)", "Cycling (Indoor)", "Swimming", "Rowing", "Elliptical", "Stair Climber", "Jump Rope", "Hiking", "Rucking", "Trail Run", "Sprinting", "Jogging", "Boxing", "Kickboxing", "MMA Training", "Jumping Jacks", "Burpees", "Mountain Climbers", "High Knees", "Skater Jumps", "Shadow Boxing", "Aqua Jogging", "Recumbent Bike", "Handcycle", "SkiErg", "Assault Bike", "VersaClimber"],
  "Strength: Chest": ["Push Ups", "Bench Press (Barbell)", "Bench Press (Dumbbell)", "Incline Bench Press", "Decline Bench Press", "Chest Fly (Dumbbell)", "Chest Fly (Cable)", "Chest Press Machine", "Pec Deck", "Dips (Chest)", "Svend Press", "Landmine Press", "Floor Press", "Wide Grip Push Ups", "Diamond Push Ups", "Decline Push Ups", "Archer Push Ups", "Weighted Push Ups", "Cable Crossover", "Pullover"],
  "Strength: Back": ["Pull Ups", "Chin Ups", "Lat Pulldown", "Seated Cable Row", "Bent Over Row (Barbell)", "Bent Over Row (Dumbbell)", "T-Bar Row", "Deadlift (Conventional)", "Deadlift (Sumo)", "Rack Pulls", "Face Pulls", "Single Arm Row", "Inverted Row", "Back Extensions", "Good Mornings", "Superman", "Renegade Row", "Meadows Row", "Pendlay Row", "Chest Supported Row"],
  "Strength: Legs": ["Squat (Barbell)", "Squat (Dumbbell)", "Front Squat", "Goblet Squat", "Leg Press", "Lunges", "Reverse Lunges", "Walking Lunges", "Bulgarian Split Squat", "Step Ups", "Leg Extension", "Hamstring Curl", "Romanian Deadlift", "Stiff Leg Deadlift", "Hip Thrust", "Glute Bridge", "Calf Raises (Standing)", "Calf Raises (Seated)", "Box Jumps", "Sumo Squat", "Hack Squat", "Sissy Squat", "Pistol Squat", "Wall Sit", "Jump Squats"],
  "Strength: Shoulders": ["Overhead Press (Barbell)", "Overhead Press (Dumbbell)", "Arnold Press", "Lateral Raises", "Front Raises", "Rear Delt Fly", "Upright Row", "Shrugs", "Military Press", "Push Press", "Handstand Pushups", "Pike Pushups", "Face Pulls", "Y-Raises", "Lu Raises", "Around the Worlds"],
  "Strength: Arms": ["Bicep Curl (Barbell)", "Bicep Curl (Dumbbell)", "Hammer Curl", "Preacher Curl", "Concentration Curl", "Cable Curl", "Tricep Extension (Cable)", "Tricep Extension (Dumbbell)", "Skull Crushers", "Dips (Tricep)", "Close Grip Bench Press", "Tricep Kickbacks", "Zottman Curl", "Spider Curl", "Chin Ups (Weighted)"],
  "Strength: Core": ["Plank", "Side Plank", "Crunches", "Sit Ups", "Leg Raises", "Hanging Leg Raises", "Russian Twists", "Ab Roller", "Bicycle Crunches", "V-Ups", "Flutter Kicks", "Scissor Kicks", "Mountain Climbers", "Toe Touches", "Hollow Body Hold", "L-Sit", "Woodchoppers", "Pallof Press", "Dead Bug", "Bird Dog"],
  "Flexibility & Recovery": ["Yoga (Vinyasa)", "Yoga (Hatha)", "Yoga (Yin)", "Pilates", "Stretching (Static)", "Stretching (Dynamic)", "Foam Rolling", "Mobility Drills", "Meditation", "Breathing Exercises", "Sauna", "Ice Bath", "Massage Gun Session", "Active Recovery Walk"],
  "Sports": ["Basketball", "Soccer", "Football", "Tennis", "Volleyball", "Golf", "Baseball", "Rugby", "Cricket", "Badminton", "Squash", "Table Tennis", "Pickleball", "Rock Climbing", "Bouldering", "Surfing", "Skateboarding", "Snowboarding", "Skiing", "Ice Skating", "Rollerblading", "Hockey", "Lacrosse", "Water Polo", "Swimming (Laps)", "Gymnastics", "Cheerleading", "Martial Arts", "Wrestling", "Fencing"]
};

export const PRIVACY_POLICY = `
MEHRI GROUP GLOBAL PRIVACY POLICY
Effective Date: January 27, 2026
Version: 2.4 (Global/Enterprise Compliance)

1. INTRODUCTION AND SCOPE
The MEHRI Group ("we," "us," or "our") operates at the intersection of biotechnology, consumer electronics, and artificial intelligence. This Privacy Policy governs your use of the Mehri Group platform, the Mehri fitness tracker hardware, and the AI calorie trackinging interface. We are committed to transparency regarding the collection, encryption, and utilization of your physiological data. This policy applies to users globally, with specific addendums for residents of the European Economic Area (EEA), California (CCPA/CPRA), and Brazil (LGPD).

2. BIOMETRIC DATA CONTROLLER & PROCESSING
MEHRI Group acts as the Data Controller for your personal information.
- Biometric Data Collection: When you use the Mehri fitness tracker, we collect high-frequency physiological telemetry including but not limited to: Heart Rate Variability (HRV), Blood Oxygen Saturation (SpO2), Accelerometer patterns (Gait Analysis), and Sleep Staging architecture (REM/Deep/Light cycles).
- Purpose of Processing: This data is processed strictly to provide: (a) Real-time performance analytics; (b) "AI-powered calorie tracking" AI-driven coaching insights; and (c) Long-term health trend visualization.
- No Sale of Biometric Data: We do NOT sell, rent, or trade your physiological data to third-party advertisers or data brokers. Your biological signature is yours alone.

3. DATA SOVEREIGNTY AND ENCRYPTION STANDARDS
We employ military-grade security architectures to protect your digital biological profile.
- Edge Encryption: All sensor data is encrypted locally on the Mehri fitness tracker Cortex-M processor using AES-256 hardware encryption before transmission via Bluetooth 5.3.
- Transit Security: Data synchronization occurs exclusively over TLS 1.3 encrypted channels.
- At-Rest Encryption: User databases are sharded and encrypted using XChaCha20-Poly1305 algorithms.
- Anonymization: For the purpose of improving the AI-powered calorie tracking neural engine, data is stripped of all Personally Identifiable Information (PII) before being used in aggregate training sets.

4. GEOGRAPHIC RIGHTS AND COMPLIANCE

A. FOR RESIDENTS OF THE EUROPEAN ECONOMIC AREA (GDPR)
Under the General Data Protection Regulation, you have the right to:
- Access: Request a copy of all raw JSON data we hold on you.
- Rectification: Correct any biometric calibration errors.
- Erasure ("Right to be Forgotten"): Request the permanent deletion of your account and all associated biological history.
- Portability: Receive your workout history in a structured, machine-readable format (CSV/JSON).

B. FOR RESIDENTS OF CALIFORNIA (CCPA/CPRA)
Pursuant to the California Consumer Privacy Act:
- You have the right to know what categories of personal information we collect.
- You have the right to non-discrimination for exercising your privacy rights.
- We do not sell personal information. Therefore, we do not offer a "Do Not Sell My Info" opt-out, as it is our default standard.

5. AI INTERACTION DISCLAIMER (AI-powered nutrition insights)
The "AI-powered calorie tracking" coaching assistant utilizes Large Language Models (LLMs) to interpret your health data. While we strive for accuracy:
- AI-powered calorie tracking is an informational tool, NOT a medical practitioner.
- Interactions with AI-powered calorie tracking are processed via secure cloud inference APIs. Contextual data sent to the model is ephemeral and not used to train public models.

6. DATA RETENTION
We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it. Upon account termination, biometric data is purged from our hot storage within 48 hours and from cold backups within 30 days.

7. CONTACT THE DATA PROTECTION OFFICE
For specific inquiries regarding your biometric privacy or to exercise your legal rights, please contact our Data Protection Officer directly:
Email: jajdn777@gmail.com
Address: MEHRI Group HQ, Legal Dept, San Francisco, CA 94107, USA.
`;

export const TERMS_OF_SERVICE = `
MEHRI GROUP TERMS OF SERVICE & USER AGREEMENT
Last Updated: January 27, 2026

1. ACCEPTANCE OF AGREEMENT
By accessing the Mehri Group of Companies website, downloading our mobile application, or activating a Mehri fitness tracker, you enter into a binding legal agreement with MEHRI Group ("Company", "we", "us"). If you do not agree to these terms, you must immediately discontinue use of our ecosystem and return any hardware within the applicable return window.

2. HARDWARE LIMITED WARRANTY (MEHRI FITNESS TRACKER SERIES)
We warrant that the Mehri fitness tracker shall be free from defects in materials and workmanship under normal use for a period of one (1) year from the date of retail purchase.
- Exclusions: This warranty does not cover: (a) cosmetic damage like scratches or dents; (b) damage caused by accident, abuse, misuse, liquid contact exceeding IP68 ratings; (c) damage caused by operating the device outside the user manual guidelines.
- Remedy: In the event of a defect, MEHRI Group will, at its option, repair the product using new or refurbished parts, or replace the product.

3. MEDICAL DISCLAIMER AND SAFETY WARNINGS
THE MEHRI FITNESS TRACKER AND MEHRI GROUP PLATFORM ARE NOT MEDICAL DEVICES.
- No Medical Advice: The data, insights, text, graphics, and suggestions provided by the "AI-powered calorie tracking" AI coach are for informational and recreational purposes only. They are not intended to diagnose, treat, cure, or prevent any disease.
- Consultation Required: Always consult with a qualified physician before starting any new exercise regime, especially if you have a history of heart disease, high blood pressure, or other chronic conditions.
- Emergency Situations: Do not rely on the Mehri fitness tracker for emergency monitoring. The optical heart rate sensor may be affected by motion artifacts and should not be used as a clinical vital signs monitor.

4. USER CONDUCT AND ACCOUNT SECURITY
You are responsible for maintaining the confidentiality of your account credentials. You agree not to:
- Reverse engineer, decompile, or disassemble the Mehri fitness tracker firmware or Mehri Group source code.
- Use the ecosystem to harass, abuse, or harm another person or group.
- Upload invalid data or use automation tools (bots) to manipulate leaderboard standings or challenges.
Violation of these rules may result in immediate termination of your account without refund.

5. INTELLECTUAL PROPERTY RIGHTS
The Mehri Group design, the "AI-powered calorie tracking" personality engine, the Mehri fitness tracker industrial design, and all associated logos and trademarks are the exclusive property of MEHRI Group. You are granted a limited, non-exclusive, non-transferable license to use the software solely in connection with the Mehri fitness tracker hardware.

6. DISPUTE RESOLUTION AND CLASS ACTION WAIVER
PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.
- Binding Arbitration: All disputes arising out of or relating to these Terms or the Service shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association.
- Class Action Waiver: You agree to resolve disputes with us on an individual basis, and not as a plaintiff or class member in any class, consolidated, or representative action.

7. LIMITATION OF LIABILITY
To the maximum extent permitted by law, MEHRI Group shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.

8. GOVERNING LAW
These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.

9. MODIFICATIONS TO SERVICE
We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the Service.
`;

export const FAQ_DATA = [
  {
    question: "Are AI fitness trackers like the Mehri fitness tracker as accurate as medical devices?",
    answer: "While the Mehri fitness tracker provides high-precision biometric data—including heart rate variability (HRV) and SpO2—it is designed for wellness trends, not medical diagnosis. Its value lies in identifying long-term patterns in your recovery and stress levels, allowing for proactive health management rather than reactive treatment."
  },
  {
    question: "How does the Mehri fitness tracker protect my biometric data and privacy?",
    answer: "We utilize decentralized encryption for all health data. Unlike standard trackers, AI-powered nutrition insights processes sensitive biometrics locally on the device or through secure, end-to-end encrypted tunnels, ensuring your health insights remain your private property and are never sold to third-party advertisers."
  },
  {
    question: "What makes the Mehri fitness tracker different from a standard Apple Watch or Garmin?",
    answer: "The Mehri fitness tracker bridges the gap between a rugged sports watch and an executive accessory. It features \"AI calorie tracking,\" which doesn't just show you steps—it analyzes your sleep and strain to tell you exactly when to work out and when to rest for peak performance."
  },
  {
    question: "Does the Mehri fitness tracker require a monthly subscription for AI features?",
    answer: "No. Unlike many 2026 wearables that paywall your own data, the Mehri fitness tracker offers all core AI health insights, sleep analytics, and the AI-powered nutrition insights dashboard with no hidden monthly fees. You own the hardware and the insights for life."
  },
  {
    question: "How does the \"AI-powered nutrition insights\" AI coaching actually work?",
    answer: "AI-powered calorie tracking uses a proprietary machine learning model to correlate your heart rate, sleep stages, and daily activity. It builds a \"Digital Twin\" of your physiology to predict fatigue before you feel it, providing actionable notifications like \"Your recovery is low; prioritize 20 more minutes of REM sleep tonight.\""
  },
  {
    question: "Can I use the Mehri fitness tracker for contactless payments and smart home control?",
    answer: "Yes. The Mehri Series 1 includes integrated NFC for universal contactless payments and a built-in IoT hub, allowing you to control your \"AI-powered calorie tracking Smart Home\" devices directly from your wrist using simple haptic gestures or voice commands."
  }
];
