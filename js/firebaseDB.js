// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { 
        getFirestore,
        collection,
        addDoc,
        getDocs,
        updateDoc,
        deleteDoc,
        doc
     } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries



    import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

          const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);


  export { auth };

// Function to add a recipe
//async function addRecipe(recipe) {
  //try {
   // const docRef = await addDoc(collection(db, 'recipes'), recipe);
  //  console.log('Recipe added with ID:', docRef.id);
 // } catch (e) {
 //   console.error('Error adding recipe:', e);
 //}

// Function to fetch recipes
async function getRecipes() {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    const recipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Fetched recipes:', recipes);
    return recipes;
  } catch (e) {
    console.error('Error fetching recipes:', e);
  }
}

// Delete a document by its reference
async function deleteRecipe(recipeId) {
    try {
        const recipeRef = doc(db, "recipes", recipeId); // Create a reference to the document
        await deleteDoc(recipeRef); // Call deleteDoc to delete the document
        console.log("Recipe deleted successfully!");
    } catch (error) {
        console.error("Error deleting document:", error);
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

  import { query, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";




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
