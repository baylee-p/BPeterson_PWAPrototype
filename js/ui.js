import { addRecipe, getRecipes } from './firebaseDB.js'; // Assuming firebaseDB.js exports these

console.log('UI script loaded. Firebase app:', app);

// Function to load recipes from Firestore and display in the UI
async function loadRecipesToUI() {
    const recipesContainer = document.querySelector('#recipes-container');
    recipesContainer.innerHTML = ''; // Clear existing content

    try {
        const recipes = await getRecipes(); // Fetch from Firestore
        recipes.forEach(recipe => {
            const recipeHTML = `
                <div class="card">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.ingredients}</p>
                    <p>${recipe.instructions}</p>
                </div>
            `;
            recipesContainer.innerHTML += recipeHTML;
        });
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

// Import idb library
const { openDB } = idb;

// Debugging log: Ensure idb is loaded
if (openDB) {
    console.log('idb library loaded successfully.');
} else {
    console.error('Failed to load idb library.');
}

document.addEventListener('DOMContentLoaded', function () {
    try {

        // Only run idb-related code if idb is available
        if (typeof idb !== 'undefined') {
            console.log('idb is available. Running IndexedDB logic.');
            // Your idb-related code here
        } else {
            console.warn('idb is not available. Skipping IndexedDB logic.');
        }
    } catch (error) {
        console.error('Error initializing UI:', error);
    }
});

    // Load recipes from IndexedDB
    loadRecipes();


document.addEventListener('DOMContentLoaded', function () {
    try {
        // Initialize side navigation for menus (right side)
        const menus = document.querySelectorAll('.sidenav');
        M.Sidenav.init(menus, { edge: 'right' });

        // Initialize side navigation for the Add Recipe form (left side)
        const sideForm = document.querySelector('#side-form');
        if (sideForm) {
            M.Sidenav.init(sideForm, { edge: 'left' }); // Ensure form opens from the left
            console.log('Side form initialized to open from the left.');
        } else {
            console.error('Side form (#side-form) not found.');
        }

        // Event listener for "Add Recipe" button
        const addRecipeButton = document.querySelector('.add-btn');
        if (addRecipeButton) {
            addRecipeButton.addEventListener('click', () => {
                try {
                    const recipeForm = document.querySelector('#side-form');
                    if (recipeForm) {
                        // Show the form via Materialize sidenav
                        const instance = M.Sidenav.getInstance(recipeForm);
                        if (instance) {
                            instance.open();
                            console.log('Recipe form opened successfully.');
                        } else {
                            console.error('Materialize instance for #side-form not found.');
                        }
                    } else {
                        console.error('Recipe form not found. Ensure it exists with ID "side-form".');
                    }
                } catch (error) {
                    console.error('Error when opening Add Recipe form:', error);
                }
            });
        } else {
            console.error('Add Recipe button not found. Ensure it exists with class "add-btn".');
        }

        // Hook form submission to addRecipe
        const recipeFormElement = document.querySelector('#side-form form');
        if (recipeFormElement) {
            recipeFormElement.addEventListener('submit', async (e) => {
                e.preventDefault();

                try {
                    // Get form data
                    const title = document.querySelector('#title').value.trim();
                    const ingredients = document.querySelector('#ingredients').value.trim();

                    if (title && ingredients) {
                        const newRecipe = { title, ingredients };

                        // Add the recipe and reset the form
                        await addRecipe(newRecipe);
                        console.log('New recipe added successfully:', newRecipe);
                        recipeFormElement.reset();

                        const instance = M.Sidenav.getInstance(document.querySelector('#side-form'));
                        if (instance) instance.close();
                    } else {
                        alert('Please fill in all fields.');
                    }
                } catch (error) {
                    console.error('Error submitting recipe form:', error);
                }
            });
        } else {
            console.error('Recipe form element not found.');
        }

        // Request persistent storage for IndexedDB
        requestPersistentStorage();
    } catch (error) {
        console.error('Error initializing Materialize components:', error);
    }
});


async function deleteRecipe(id) {
    try {
        console.log(`Attempting to delete recipe with id: ${id}`);
        const db = await openDB('MyRecipeBook', 1);
        const tx = db.transaction('recipes', 'readwrite');
        const store = tx.objectStore('recipes');
        await store.delete(id); // Delete the recipe from IndexedDB
        console.log(`Recipe with id ${id} successfully deleted.`);
    } catch (error) {
        console.error(`Failed to delete recipe with id ${id}:`, error);
    }
}

// Function to add a recipe to IndexedDB
async function addRecipe(recipe) {
    try {
        const db = await openDB('MyRecipeBook', 1);
        const tx = db.transaction('recipes', 'readwrite');
        const store = tx.objectStore('recipes');
        await store.add(recipe);
        console.log('Recipe added to IndexedDB:', recipe);
        loadRecipes(); // Reload recipes after adding
    } catch (error) {
        console.error('Failed to add recipe:', error);
    }
}

// Load recipes from IndexedDB
async function loadRecipes() {
    try {
        const db = await openDB('MyRecipeBook', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('recipes')) {
                    const store = db.createObjectStore('recipes', {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    store.createIndex('title', 'title', { unique: false });
                }
            },
        });

        const tx = db.transaction('recipes', 'readonly');
        const store = tx.objectStore('recipes');
        const recipes = await store.getAll();

        console.log('Fetched recipes from IndexedDB:', recipes);

        const recipeList = document.getElementById('recipe-list');
        if (recipeList) {
            recipeList.innerHTML = ''; // Clear existing content

            recipes.forEach(recipe => {
                // Create the recipe card
                const card = document.createElement('div');
                card.className = 'card-panel recipe white row';
                card.setAttribute('data-id', recipe.id); // Add data-id for easy identification

                // Add image
                const img = document.createElement('img');
                img.src = '/img/dish.png'; // Placeholder image
                img.alt = 'recipe thumb';
                card.appendChild(img);

                // Add recipe details
                const details = document.createElement('div');
                details.className = 'recipe-details';

                const title = document.createElement('div');
                title.className = 'recipe-title';
                title.textContent = recipe.title;
                details.appendChild(title);

                const ingredients = document.createElement('div');
                ingredients.className = 'recipe-ingredients';
                ingredients.textContent = recipe.ingredients;
                details.appendChild(ingredients);

                card.appendChild(details);

                // Add delete button
                const deleteBtn = document.createElement('div');
                deleteBtn.className = 'recipe-delete';
                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'material-icons';
                deleteIcon.textContent = 'delete_outline';
                deleteBtn.appendChild(deleteIcon);
                card.appendChild(deleteBtn);

                // Attach delete functionality
                deleteBtn.addEventListener('click', async () => {
                    console.log(`Delete button clicked for recipe with id: ${recipe.id}`);
                    await deleteRecipe(recipe.id); // Call deleteRecipe to remove from IndexedDB
                    recipeList.removeChild(card); // Immediately remove the card from the DOM
                });

                // Append the card to the recipe list
                recipeList.appendChild(card);
            });

            console.log('Recipes rendered successfully to #recipe-list.');
        } else {
            console.error('Recipe list container (#recipe-list) not found.');
        }
    } catch (error) {
        console.error('Failed to load recipes:', error);
    }
}

document.querySelector('#recipe-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload

    const recipe = {
        title: document.querySelector('#title').value,
        ingredients: document.querySelector('#ingredients').value,
        instructions: document.querySelector('#instructions').value,
    };

    try {
        await addRecipe(recipe); // Save to Firestore
        alert('Recipe added successfully!');
        loadRecipesToUI(); // Refresh UI with updated recipes
    } catch (error) {
        console.error('Error adding recipe:', error);
    }
});

document.addEventListener('DOMContentLoaded', loadRecipesToUI);
