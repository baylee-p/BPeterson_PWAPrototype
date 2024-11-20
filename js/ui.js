document.addEventListener('DOMContentLoaded', function() {
    // nav menu
    const menus = document.querySelectorAll('.side-menu');
    M.Sidenav.init(menus, {edge: 'right'});
    // add recipe form
    const forms = document.querySelectorAll('.side-form');
    M.Sidenav.init(forms, {edge: 'left'});
});

  // Load recipes from the IndexedDB
  loadRecipes();

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
    const db = await openDB("MyRecipeBook", 1, {
      upgrade(db) {
        const store = db.createObjectStore("recipes", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status");
      },
    });
    return db;
  }
  
    // Add Recipe with Transaction
    async function addRecipe(recipe) {
    const db = await createDB();
  
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