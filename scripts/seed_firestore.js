import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Helper to read .env.local without external deps
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (key) => {
    const match = envContent.match(new RegExp(`${key}="(.*?)"`));
    return match ? match[1] : null;
};

const firebaseConfig = {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID')
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MOCK_PROFILES = [
    {
        uid: 'seed_user_1', firstName: 'Priya', lastName: 'Sharma', dob: '1998-05-15', height: '162', heightUnit: 'cm',
        location: 'New York, USA', community: 'Hindi', religion: 'Hindu', caste: 'Brahmin',
        job: 'Software Engineer', income: '$100k - $200k', qualification: 'MS in Computer Science',
        bioTags: 'Travel, Cooking, Fitness', photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_2', firstName: 'Aisha', lastName: 'Khan', dob: '1996-08-20', height: '168', heightUnit: 'cm',
        location: 'London, UK', community: 'Urdu', religion: 'Muslim', caste: 'Sunni',
        job: 'Doctor', income: '$100k - $200k', qualification: 'MBBS, MD',
        bioTags: 'Reading, Art, Volunteering', photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_3', firstName: 'Neha', lastName: 'Patel', dob: '1999-12-10', height: '158', heightUnit: 'cm',
        location: 'Chicago, USA', community: 'Gujarati', religion: 'Hindu', caste: 'Patidar',
        job: 'Marketing Manager', income: '$50k - $100k', qualification: 'MBA',
        bioTags: 'Photography, Music, Hiking', photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'], isIdVerified: false
    },
    {
        uid: 'seed_user_4', firstName: 'Riya', lastName: 'Menon', dob: '1997-03-25', height: '165', heightUnit: 'cm',
        location: 'Dubai, UAE', community: 'Malayali', religion: 'Hindu', caste: 'Nair',
        job: 'Architect', income: '$100k - $200k', qualification: 'B.Arch',
        bioTags: 'Design, Yoga, Coffee', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_5', firstName: 'Sarah', lastName: 'Thomas', dob: '1995-11-05', height: '172', heightUnit: 'cm',
        location: 'Toronto, Canada', community: 'Malayali', religion: 'Christian', caste: 'Orthodox',
        job: 'Data Analyst', income: '$100k - $200k', qualification: 'MSc Data Science',
        bioTags: 'Tech, Board Games, Pets', photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_6', firstName: 'Sneha', lastName: 'Reddy', dob: '2000-07-15', height: '160', heightUnit: 'cm',
        location: 'Houston, USA', community: 'Telugu', religion: 'Hindu', caste: 'Reddy',
        job: 'Business Analyst', income: '$50k - $100k', qualification: 'BBA',
        bioTags: 'Dancing, Movies, Foodie', photos: ['https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600'], isIdVerified: false
    },
    {
        uid: 'seed_user_7', firstName: 'Kiran', lastName: 'Rao', dob: '1993-02-12', height: '178', heightUnit: 'cm',
        location: 'San Francisco, USA', community: 'Kannada', religion: 'Hindu', caste: 'Brahmin',
        job: 'Product Manager', income: '$150k+', qualification: 'MBA',
        bioTags: 'Startups, Cycling, Books', photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_8', firstName: 'Fatima', lastName: 'Ali', dob: '1998-09-30', height: '162', heightUnit: 'cm',
        location: 'Sydney, Australia', community: 'Punjabi', religion: 'Muslim', caste: 'Shia',
        job: 'Graphic Designer', income: '$50k - $100k', qualification: 'BFA',
        bioTags: 'Art, Museums, Travel', photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_9', firstName: 'Anu', lastName: 'Joseph', dob: '1999-04-18', height: '165', heightUnit: 'cm',
        location: 'Kerala, India', community: 'Malayali', religion: 'Christian', caste: 'Catholic',
        job: 'Nurse', income: '$50k - $100k', qualification: 'B.Sc Nursing',
        bioTags: 'Compassion, Travel, Music', photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600'], isIdVerified: true
    },
    {
        uid: 'seed_user_10', firstName: 'Elizabeth', lastName: 'Maria', dob: '1996-12-25', height: '169', heightUnit: 'cm',
        location: 'Chicago, USA', community: 'Malayali', religion: 'Christian', caste: 'Syrian Catholic',
        job: 'Attorney', income: '$150k+', qualification: 'JD',
        bioTags: 'Law, Advocacy, Hiking', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'], isIdVerified: true
    }
];

async function seed() {
    console.log("Starting Firestore seeding...");
    for (const profile of MOCK_PROFILES) {
        try {
            await setDoc(doc(db, "profiles", profile.uid), profile);
            console.log(`✅ Seeded profile: ${profile.firstName} ${profile.lastName}`);
        } catch (error) {
            console.error(`❌ Failed to seed ${profile.firstName}:`, error);
        }
    }
    console.log("Seeding complete! You can now browse these profiles in the app.");
    process.exit(0);
}

seed();
