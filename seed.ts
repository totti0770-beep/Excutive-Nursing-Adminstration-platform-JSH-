import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const DATA = {
  stats: {
    nurses: 719,
    satisfaction: 99,
    training: 33,
    experience: 30,
  },
  departments: [
    { name: 'العيادات الخارجية', supervisor: 'عبد مصبحي', nurses: 4, shifts: 1 },
    { name: 'النساء والولادة', supervisor: 'أروى اسماعيل', nurses: 4, shifts: 4 },
    { name: 'مركز السكري', supervisor: 'أمل حمزي', nurses: 4, shifts: 1 },
    { name: 'غرف العمليات', supervisor: 'خالد شراحيلي', nurses: 4, shifts: 2 },
  ],
  topNurses: [
    { name: 'اميره محمد مضوي', dept: 'العناية المركزة', votes: 4900 },
    { name: 'عائشة ولي حكمي', dept: 'الطوارئ', votes: 4200 },
    { name: 'خريبة محمد كاملي', dept: 'العيادات الخارجية', votes: 3800 },
    { name: 'اشواق محمد مبارك', dept: 'النساء والولادة', votes: 3400 },
    { name: 'مها حسن عقدي', dept: 'مركز السكري', votes: 3100 },
  ],
  topHeads: [
    { name: 'نجوم حسن حكمي', dept: 'قسم التمريض', votes: 5303 },
    { name: 'نوره علي حطاباني', dept: 'العناية المركزة', votes: 4800 },
    { name: 'عبيسه محمد علي بوريزه', dept: 'الحروق', votes: 4100 },
    { name: 'كريمة الشحات سيد احمد', dept: 'الطوارئ', votes: 3700 },
    { name: 'منال حكمي', dept: 'العيادات الخارجية', votes: 3300 },
  ],
};

async function seed() {
  try {
    await setDoc(doc(db, 'system', 'stats'), DATA.stats);
    
    for (const dept of DATA.departments) {
      await setDoc(doc(db, 'departments', dept.name), dept);
    }

    for (const nurse of DATA.topNurses) {
      await setDoc(doc(db, 'recognitions', nurse.name), {
        ...nurse,
        type: 'nurse'
      });
    }

    for (const head of DATA.topHeads) {
      await setDoc(doc(db, 'recognitions', head.name), {
        ...head,
        type: 'head'
      });
    }
    
    // Add default admin user
    await setDoc(doc(db, 'users', 'admin_uid_placeholder'), {
        name: 'Admin User',
        email: 'admin@jazanhospital.com',
        role_id: 'System Admin',
        department_id: 'IT',
        is_active: true
    });

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
