
import { type User } from '@/lib/types';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';


const USERS_COLLECTION = 'users';

const initialUsers: Omit<User, 'id'>[] = [
  { username: 'admin', password: 'admin', role: 'super_admin', location: 'BP PEKANBARU' },
  { username: 'mirul', password: '123', role: 'operator', location: 'BP PEKANBARU' },
  { username: 'operator_prod', password: 'password', role: 'operator', location: 'BP DUMAI' },
  { username: 'andi_mekanik', password: 'password', role: 'mekanik', location: 'BP BAUNG' },
  { username: 'kepala_bp', password: 'password', role: 'kepala_BP', location: 'BP IKN' },
  { username: 'laborat_user', password: 'password', role: 'laborat', location: 'BP PEKANBARU' },
];

async function seedInitialUsers() {
    const usersCollection = collection(firestore, USERS_COLLECTION);
    const batch = writeBatch(firestore);
    initialUsers.forEach(user => {
        const newUserRef = doc(usersCollection);
        batch.set(newUserRef, user);
    });
    await batch.commit();
    console.log("Initial users seeded to Firestore.");
}


export async function getUsers(): Promise<User[]> {
    const usersCollection = collection(firestore, USERS_COLLECTION);
    const userSnapshot = await getDocs(usersCollection);
    
    if (userSnapshot.empty) {
        await seedInitialUsers();
        const seededSnapshot = await getDocs(usersCollection);
        return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    }

    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function addUser(userData: Omit<User, 'id'>): Promise<User> {
    const usersCollection = collection(firestore, USERS_COLLECTION);
    const docRef = await addDoc(usersCollection, userData);
    return { id: docRef.id, ...userData };
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const userDoc = doc(firestore, USERS_COLLECTION, userId);
    // 'id' is not a field in the document, so we remove it
    const { id, ...dataToUpdate } = userData;
    await setDoc(userDoc, dataToUpdate, { merge: true });
}

export async function deleteUser(userId: string): Promise<void> {
    const userDoc = doc(firestore, USERS_COLLECTION, userId);
    await deleteDoc(userDoc);
}


export async function verifyLogin(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const usersCollection = collection(firestore, USERS_COLLECTION);
    const q = query(
        usersCollection, 
        where("username", "==", username), 
        where("password", "==", password)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
