import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp({
  projectId: firebaseConfig.projectId
});
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
    await db.collection('system').doc('stats').set(DATA.stats);
    
    for (const dept of DATA.departments) {
      await db.collection('departments').doc(dept.name).set(dept);
    }

    for (const nurse of DATA.topNurses) {
      await db.collection('recognitions').doc(nurse.name).set({
        ...nurse,
        type: 'nurse'
      });
    }

    for (const head of DATA.topHeads) {
      await db.collection('recognitions').doc(head.name).set({
        ...head,
        type: 'head'
      });
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
