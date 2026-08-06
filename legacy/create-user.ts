import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function createAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@jazanhospital.com', 'Password123!');
    console.log('User created:', userCredential.user.uid);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: 'System Admin',
        email: 'admin@jazanhospital.com',
        role_id: 'System Admin',
        department_id: 'IT',
        is_active: true
    });
    console.log("User doc created!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
createAdmin();
