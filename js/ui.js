import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { auth } from "./firebaseDB.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    // nav menu
    const menus = document.querySelectorAll('.side-menu');
    M.Sidenav.init(menus, {edge: 'right'});
    // add recipe form
    const forms = document.querySelectorAll('.side-form');
    M.Sidenav.init(forms, {edge: 'left'});

    // Load Recipes
    loadRecipes();
});

document.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form submission
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const errorElement = document.querySelector('#login-error');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', userCredential.user);
        errorElement.textContent = ''; // Clear any previous errors
    } catch (error) {
        console.error('Login error:', error.message);
        errorElement.textContent = error.message; // Display the error to the user
    }
});

onAuthStateChanged(auth, (user) => {
    const loginSection = document.querySelector('#login-section');
    if (user) {
        console.log("User signed in:", user.uid);
        document.querySelector('#auth-status').textContent = `Signed in as: ${user.email}`;
        loginSection.style.display = 'none'; // Hide login form
        loadRecipesFromDB(); // Load user-specific recipes
    } else {
        console.log("User signed out");
        document.querySelector('#auth-status').textContent = "Not signed in";
        loginSection.style.display = 'block'; // Show login form
    }
});

document.querySelector('#logout-button').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('User signed out');
        document.querySelector('#logout-button').style.display = 'none'; // Hide logout button
    } catch (error) {
        console.error('Logout error:', error.message);
    }
});


async function syncFirebaseToIndexedDB() {
    const user = auth.currentUser;
    if (!user) return;

    const db = await createDB();
    const tx = db.transaction("recipes", "readwrite");
    const store = tx.objectStore("recipes");

    const snapshot = await getDocs(collection(db, "recipes"));
    snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        store.put(data); // Use `put` to avoid duplicates
    });

    console.log("Data synced from Firebase to IndexedDB");
}


async function syncIndexedDBToFirebase() {
    const user = auth.currentUser;
    if (!user) return;

    const db = await createDB();
    const tx = db.transaction("recipes", "readonly");
    const store = tx.objectStore("recipes");
    const unsyncedRecipes = (await store.getAll()).filter(recipe => !recipe.synced);

    for (const recipe of unsyncedRecipes) {
        const docRef = await addDoc(collection(db, "recipes"), { ...recipe, uid: user.uid });
        recipe.synced = true;

        // Update the synced flag in IndexedDB
        const updateTx = db.transaction("recipes", "readwrite");
        const updateStore = updateTx.objectStore("recipes");
        await updateStore.put(recipe);
    }

    console.log("Data synced from IndexedDB to Firebase");
}

window.addEventListener("online", async () => {
    console.log("Online - syncing data...");
    await syncIndexedDBToFirebase();
    await syncFirebaseToIndexedDB();
});


// Show/hide the logout button based on auth state
onAuthStateChanged(auth, (user) => {
    const logoutButton = document.querySelector('#logout-button');
    if (user) {
        logoutButton.style.display = 'block';
    } else {
        logoutButton.style.display = 'none';
    }
});


  // Attach event listener to add recipes
  document.querySelector('#add-recipe-button').addEventListener('click', () => {
    const recipe = {
        name: document.querySelector('#recipe-name').value,
        ingredients: document.querySelector('#recipe-ingredients').value.split(','),
        instructions: document.querySelector('#recipe-instructions').value,
    };
    addRecipe(recipe);
  });

  // Check storage usage
  checkStorageUsage();

  // Request persistent storage
  requestPersistentStorage();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceworker.js")
    .then((req) => console.log("Service Worker Registered!", req))
    .catch((err) => console.log("Service Worker registration failed", err));
}

    // Create the IndexedDB database
    async function createDB() {
    try {
        const db = await openDB("MyRecipeBook", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("recipes")) {
                    db.createObjectStore("recipes", {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                }
            },
        });
        console.log("IndexedDB initialized successfully");
        return db;
    } catch (error) {
        console.error("Error initializing IndexedDB:", error);
    }
    }

    // Load recipes from the IndexedDB
    loadRecipes();

    async function getAllRecipes() {
    const db = await createDB();
    const transaction = db.transaction("recipes", "readonly");
    const store = transaction.objectStore("recipes");
    const recipes = await store.getAll();
    console.log("Retrieved recipes:", recipes);
    return recipes;
    }

    // Add Recipe with Transaction
    async function addRecipe(recipe) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated");
        return;
    }

    const db = await createDB();
    const tx = db.transaction("recipes", "readwrite");
    const store = tx.objectStore("recipes");

    recipe.synced = false; // Mark as unsynced
    await store.add(recipe);

    console.log("Recipe added offline:", recipe);
}

  
    // Start a transaction
    const tx = db.transaction("recipes", "readwrite");
    const store = tx.objectStore("recipes");
  
    // Add recipe to store
    await store.add(recipe);
  
    // Complete transaction
    await tx.done;
  
    // Update storage usage
    checkStorageUsage();
    }  

    // Delete Recipe with Transaction
    async function deleteRecipe(id) {
    const db = await createDB();
  
    // Start a transaction
    const tx = db.transaction("recipes", "readwrite");
    const store = tx.objectStore("recipes");
  
    // Delete recipe by id
    await store.delete(id);
  
    // Complete transaction
    await tx.done;
  
    // Remove recipe from UI
    const recipeCard = document.querySelector(`[data-id="${id}"]`);
    if (recipeCard) {
      recipeCard.remove();
    }

    // Update storage usage
    checkStorageUsage();
    }

    // Load Recipes with Transaction
    async function loadRecipes() {
    const db = await createDB();

    // Start a transaction (read-only)
    const tx = db.transaction("recipes", "readonly");
    const store = tx.objectStore("recipes");

    // Get all recipes
    const recipes = await store.getAll();

    // Complete transaction
    await tx.done;

    const recipeContainer = document.querySelector(".recipes");
    recipeContainer.innerHTML = ""; // Clear current recipes

    recipes.forEach((recipe) => {
        displayRecipe(recipe);
    });
    }

    // Display Recipe using the existing HTML structure
    function displayRecipe(recipe) {
    const recipeContainer = document.querySelector(".recipes");
    const html = `
      <div class="card-panel white row valign-wrapper" data-id="${recipe.id}">
        <div class="col s2">
          <img
            src="/img/icons/dish.png"
            class="circle responsive-img"
            alt="Recipe icon"
            style="max-width: 100%; height: auto"
          />
        </div>
        <div class="recipe-detail col s8">
          <h5 class="recipe-title black-text">${recipe.title}</h5>
          <div class="recipe-description">${recipe.description}</div>
        </div>
        <div class="col s2 right-align">
          <button class="recipe-delete btn-flat" aria-label="Delete recipe">
            <i class="material-icons black-text text-darken-1" style="font-size: 30px">delete</i>
          </button>
        </div>
      </div>
    `;
    recipeContainer.insertAdjacentHTML("beforeend", html);
    
    // Attach delete event listener
     const deleteButton = recipeContainer.querySelector(
    `[data-id="${recipe.id}"] .recipe-delete`
  );
  deleteButton.addEventListener("click", () => deleteRecipe(recipe.id));
}

// Add Recipe Button Listener
const addRecipeButton = document.querySelector(".btn-small");
addRecipeButton.addEventListener("click", async () => {
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");

  const recipe = {
    title: titleInput.value,
    ingredients: ingredientInput.value,
  };

  await addRecipe(recipe); // Add recipe to IndexedDB

  displayRecipe(recipe); // Add recipe to the UI

  // Clear input fields after adding
  titleInput.value = "";
  descriptionInput.value = "";

  // Close the side form after adding
  const forms = document.querySelector(".side-form");
  const instance = M.Sidenav.getInstance(forms);
  instance.close();
});

// Function to check storage usage
async function checkStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      const usageInMB = (usage / (1024 * 1024)).toFixed(2); // Convert to MB
      const quotaInMB = (quota / (1024 * 1024)).toFixed(2); // Convert to MB
  
      console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

// Update the UI with storage info
const storageInfo = document.querySelector("#storage-info");
if (storageInfo) {
  storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
}

// Warn the user if storage usage exceeds 80%
if (usage / quota > 0.8) {
    const storageWarning = document.querySelector("#storage-warning");
    if (storageWarning) {
      storageWarning.textContent =
        "Warning: You are running low on storage space. Please delete old recipes to free up space.";
      storageWarning.style.display = "block";
    }
  } else {
    const storageWarning = document.querySelector("#storage-warning");
    if (storageWarning) {
      storageWarning.textContent = "";
      storageWarning.style.display = "none";
    }
  }
}
}

// Function to request persistent storage
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersistent = await navigator.storage.persist();
      console.log(`Persistent storage granted: ${isPersistent}`);
  
      // Update the UI with a message
      const storageMessage = document.querySelector("#persistent-storage-info");
      if (storageMessage) {
        if (isPersistent) {
          storageMessage.textContent =
            "Persistent storage granted. Your data is safe!";
          storageMessage.classList.remove("red-text");
          storageMessage.classList.add("green-text");
        } else {
          storageMessage.textContent =
            "Persistent storage not granted. Data might be cleared under storage pressure.";
          storageMessage.classList.remove("green-text");
          storageMessage.classList.add("red-text");
        }
      }
    }
  }

import { auth } from "./firebaseDB.js";
import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Sign-In
document.querySelector('#sign-in-button').addEventListener('click', async () => {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Signed in as:', userCredential.user.uid);
    } catch (error) {
        console.error('Sign-In Error:', error.message);
    }
});

// Sign-Out
document.querySelector('#sign-out-button').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('Signed out successfully');
    } catch (error) {
        console.error('Sign-Out Error:', error.message);
    }
});


onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User signed in:", user.uid);
        document.querySelector('#auth-status').textContent = `Signed in as: ${user.email}`;
        // Load user-specific data
        loadRecipes(); // Call your data loading function
    } else {
        console.log("No user signed in");
        document.querySelector('#auth-status').textContent = "Not signed in";
        // Optionally clear the UI or show default content
    }
});

const addRecipeToDB = async (recipe) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not signed in");
        return;
    }
    const db = await openDatabase();
    const transaction = db.transaction('recipes', 'readwrite');
    const store = transaction.objectStore('recipes');
    store.add({
        uid: user.uid, // Associate with user
        ...recipe
    });
    console.log("Recipe added to IndexedDB:", recipe);
};

async function loadRecipesFromDB() {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated");
        return [];
    }
    const db = await createDB();
    const tx = db.transaction("recipes", "readonly");
    const store = tx.objectStore("recipes");
    const allRecipes = await store.getAll();
    return allRecipes.filter(recipe => recipe.uid === user.uid);
}

