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

  // Add a Recipe
  export async function addRecipe(recipe) {
    try{
        const docRef = await addDoc(collection(db, "recipes"), recipes);
        return {id: docRef.id, ...recipe}
    }
    catch(error) {
        console.error("error adding recipe: ", error);
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