// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { 
        getFirestore,
        collection,
        doc,
        addDoc,
        getDocs,
        deleteDoc,
        updateDoc,
     } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

    import {
        initializeApp
    } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

    import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

    const auth = getAuth(app);

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
    apiKey: "AIzaSyCjcfnZkPNCrvFFsPfp4QNMlpa-dukF4P4",
    authDomain: "myrecipebook-fc07c.firebaseapp.com",
    projectId: "myrecipebook-fc07c",
    storageBucket: "myrecipebook-fc07c.firebasestorage.app",
    messagingSenderId: "879122141513",
    appId: "1:879122141513:web:1de195a18e3d0354ff8a98",
    measurementId: "G-DY4LGZ2FJY"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  export { auth };

  // Add a Recipe
  export async function addRecipe(recipe) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated");
        return;
    }
    try {
        const docRef = await addDoc(collection(db, "recipes"), { uid: user.uid, ...recipe });
        return { id: docRef.id, ...recipe };
    } catch (error) {
        console.error("Error adding recipe:", error);
    }
}

  // Get Recipe
  export async function getRecipe(params) {
    const recipes = [];
    try{
        const querySnapshot = await getDocs(collection(db, "tasks"));
        querySnapshot.forEach((doc)=>{
            recipes.push({id: doc.id, ...doc.data() });
        });
    }
    catch(error) {
        console.error("error retrieving recipe: ", error);
    }
    return recipes;
  }
  // Delete Recipe
  export async function deleteRecipe(id) {
    try{
        audit deleteDoc(doc(db, "recipes", id));
    }
    catch (error) {
        console.error("error deleting recipe: ", error);
    }
  }
  // Update Recipe
  export async function updateRecipe(id, updatedData) {
    try{
        const recipeRef = doc(db, "recipes", id);
        await updateDoc(recipeRef, updateData);
    }
    catch (error) {
        console.error("error editing recipe: ", error);
    }
  }

  import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { auth } from "./firebaseDB.js";

const db = getFirestore();

const addRecipe = async (recipe) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not signed in");
        return;
    }
    try {
        await addDoc(collection(db, "recipes"), {
            uid: user.uid, // Associate with user
            ...recipe
        });
        console.log("Recipe added to Firestore:", recipe);
    } catch (error) {
        console.error("Firestore Add Error:", error.message);
    }
};

const loadRecipes = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not signed in");
        return [];
    }
    const recipesQuery = query(
        collection(db, "recipes"),
        where("uid", "==", user.uid)
    );
    const snapshot = await getDocs(recipesQuery);
    return snapshot.docs.map(doc => doc.data());
};
