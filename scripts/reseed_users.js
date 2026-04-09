import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

const getEnvVar = (key) => {
    const match = envContent.match(new RegExp(`${key}="(.*?)"`));
    return match ? match[1] : process.env[key];
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
const auth = getAuth(app);

// Data structure
const randomData = {
    firstNamesM: ["Ravi", "Aarav", "Tariq", "Imran", "David", "John", "Rahul", "Vikram", "Omar", "Michael"],
    firstNamesF: ["Priya", "Aisha", "Fatima", "Sarah", "Emily", "Neha", "Riya", "Zainab", "Sneha", "Jessica"],
    lastNames: ["Sharma", "Khan", "Patel", "Ali", "Smith", "Thomas", "Reddy", "Joseph", "Rao", "Menon"],
    religions: [
        { r: "Hindu", castes: ["Brahmin", "Rajput", "Bania", "Yadav", "Kayastha", "Reddy", "Patidar", "Nair", "Ezhava", "Any"] },
        { r: "Muslim", castes: ["Sunni", "Shia", "Pathan", "Syed", "Sheikh", "Any"] },
        { r: "Christian", castes: ["Catholic", "Protestant", "Orthodox", "Syrian Catholic", "Any"] },
        { r: "Sikh", castes: ["Jat", "Khatri", "Arora", "Ramgarhia", "Any"] }
    ],
    communities: ["Hindi", "Urdu", "Punjabi", "Gujarati", "Malayali", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali"],
    locations: ["New York, USA", "London, UK", "Toronto, Canada", "Sydney, Australia", "Dubai, UAE", "Chicago, USA", "Houston, USA", "San Francisco, USA", "Kerala, India", "Mumbai, India"],
    jobs: ["Software Engineer", "Doctor", "Manager", "Architect", "Designer", "Nurse", "Teacher", "Business Analyst", "Marketing", "Consultant"],
    qualifications: ["B.Tech", "MBBS", "MBA", "B.Arch", "BFA", "B.Sc", "M.Sc", "PhD", "BBA", "BA"],
    genders: ["Male", "Female"]
};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomItem(arr) {
    return arr[getRandomInt(arr.length)];
}

function generateProfiles(count) {
    const profiles = [];
    for (let i = 1; i <= count; i++) {
        const gender = getRandomItem(randomData.genders);
        const firstName = gender === "Male" ? getRandomItem(randomData.firstNamesM) : getRandomItem(randomData.firstNamesF);
        const lastName = getRandomItem(randomData.lastNames);
        const relObj = getRandomItem(randomData.religions);
        const religion = relObj.r;
        const caste = getRandomItem(relObj.castes);
        const community = getRandomItem(randomData.communities);
        const location = getRandomItem(randomData.locations);
        const job = getRandomItem(randomData.jobs);
        const qual = getRandomItem(randomData.qualifications);
        
        // Random age between 22 and 35
        const age = 22 + getRandomInt(14);
        const birthYear = new Date().getFullYear() - age;
        const dob = `${birthYear}-05-15`; // fixed month/day for simplicity
        
        const photoM = [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
        ];
        const photoF = [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"
        ];
        const photos = gender === "Male" ? [getRandomItem(photoM)] : [getRandomItem(photoF)];
        
        const email = `testuser${i}@weunited.test`;
        const password = `Password123!`;
        const profileId = `WU${String(i).padStart(6, '0')}`;

        profiles.push({
            email,
            password,
            profileId,
            profileData: {
                firstName,
                lastName,
                gender,
                dob,
                religion,
                caste,
                community,
                location,
                job,
                qualification: qual,
                photos,
                avatarPhoto: photos[0],
                profileId,
                aboutMe: `I'm ${firstName}, looking for someone special from ${location}.`,
                height: `${150 + getRandomInt(40)}`,
                heightUnit: 'cm',
                income: '$50k - $100k',
                phone: `+1 ${getRandomInt(900) + 100} ${getRandomInt(900) + 100} ${getRandomInt(9000) + 1000}`,
                maritalStatus: 'Never Married',
                isVerified: i % 3 === 0, // Some verified, some not
                step: 5 // fully onboarded
            }
        });
    }
    return profiles;
}

async function wipeDatabase() {
    console.log("🔥 Wiping old profiles...");
    const profilesSnap = await getDocs(collection(db, 'profiles'));
    for (const d of profilesSnap.docs) {
        await deleteDoc(doc(db, 'profiles', d.id));
    }
    console.log("🔥 Wiping old interests...");
    const interestsSnap = await getDocs(collection(db, 'interests'));
    for (const d of interestsSnap.docs) {
        await deleteDoc(doc(db, 'interests', d.id));
    }
    console.log("✅ Wiped!");
}

async function reseed() {
    try {
        await wipeDatabase();

        const profiles = generateProfiles(20);
        console.log(`🌱 Beginning creation of ${profiles.length} fresh profiles...`);

        const credsFile = ['# WeUnited Test Credentials\n\nPassword for all accounts is: `Password123!`\n\n| PID | Name | Email | Gender | Religion | Caste |\n|-----|------|-------|--------|----------|-------|'];

        for (const p of profiles) {
            let uid;
            try {
                // Try create
                const cred = await createUserWithEmailAndPassword(auth, p.email, p.password);
                uid = cred.user.uid;
                await signOut(auth);
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                    // Try login
                    const cred = await signInWithEmailAndPassword(auth, p.email, p.password);
                    uid = cred.user.uid;
                    await signOut(auth);
                } else {
                    console.error(`Error with ${p.email}:`, err);
                    continue;
                }
            }

            p.profileData.uid = uid;
            await setDoc(doc(db, 'profiles', uid), p.profileData);
            
            console.log(`✅ Created/Updated ${p.profileData.firstName} ${p.profileData.lastName} (${p.email})`);
            credsFile.push(`| ${p.profileId} | ${p.profileData.firstName} ${p.profileData.lastName} | ${p.email} | ${p.profileData.gender} | ${p.profileData.religion} | ${p.profileData.caste} |`);
        }

        const credsPath = path.resolve(process.cwd(), 'test_credentials.md');
        fs.writeFileSync(credsPath, credsFile.join('\n'), 'utf8');
        
        console.log(`\n🎉 All done! Wrote credentials to test_credentials.md`);
        process.exit(0);

    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
}

reseed();
