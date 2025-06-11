// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the database
  const db = new GroceryDatabase();
  
  // App state
  const state = {
    currentScreen: 'home-screen',
    selectedProducts: [],
    currentList: null,
    currentCategory: 1, // Default to vegetables
  };
  
  // DOM Elements
  const screens = document.querySelectorAll('.screen');
  const homeBtn = document.getElementById('home-btn');
  const createListBtn = document.getElementById('create-list-btn');
  const myListsBtn = document.getElementById('my-lists-btn');
  const categoriesBtn = document.getElementById('categories-btn');
  const saveListBtn = document.getElementById('save-list-btn');
  const cancelListBtn = document.getElementById('cancel-list-btn');
  const saveListDialog = document.getElementById('save-list-dialog');
  const confirmSaveBtn = document.getElementById('confirm-save-btn');
  const cancelSaveBtn = document.getElementById('cancel-save-btn');
  const listNameInput = document.getElementById('list-name');
  const listDateInput = document.getElementById('list-date');
  const vegetablesGallery = document.getElementById('vegetables-gallery');
  const listsContainer = document.getElementById('lists-container');
  const sortByDateBtn = document.getElementById('sort-by-date');
  const sortByCategoryBtn = document.getElementById('sort-by-category');
  const listDetailTitle = document.getElementById('list-detail-title');
  const listDetailDate = document.getElementById('list-detail-date');
  const listDetailItems = document.getElementById('list-detail-items');
  const editListBtn = document.getElementById('edit-list-btn');
  const backToListsBtn = document.getElementById('back-to-lists-btn');
  const vegetablesCategory = document.getElementById('vegetables-category');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const categoryDetailTitle = document.getElementById('category-detail-title');
  const categoryItems = document.getElementById('category-items');
  const addProductBtn = document.getElementById('add-product-btn');
  const backToCategoriesBtn = document.getElementById('back-to-categories-btn');
  const addProductDialog = document.getElementById('add-product-dialog');
  const confirmAddProductBtn = document.getElementById('confirm-add-product-btn');
  const cancelAddProductBtn = document.getElementById('cancel-add-product-btn');
  const productNameInput = document.getElementById('product-name');
  const productImageInput = document.getElementById('product-image');
  const imagePreview = document.getElementById('image-preview');
  
  // Set current date as default for list date input
  const today = new Date().toISOString().split('T')[0];
  listDateInput.value = today;
  
  // Navigation functions
  function showScreen(screenId) {
    screens.forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    state.currentScreen = screenId;
  }
  
  // Initialize vegetable gallery
  async function initVegetableGallery() {
    try {
      const vegetables = await db.getProductsByCategory(1);
      vegetablesGallery.innerHTML = '';
      
      vegetables.forEach(vegetable => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.id = vegetable.id;
        
        galleryItem.innerHTML = `
          <img src="${vegetable.image}" alt="${vegetable.name}">
          <div class="gallery-item-name">${vegetable.name}</div>
          <div class="gallery-item-checkbox">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        `;
        
        galleryItem.addEventListener('click', () => {
          toggleProductSelection(galleryItem, vegetable);
        });
        
        vegetablesGallery.appendChild(galleryItem);
      });
    } catch (error) {
      console.error('Error initializing vegetable gallery:', error);
    }
  }
  
  // Toggle product selection
  function toggleProductSelection(element, product) {
    element.classList.toggle('selected');
    
    const index = state.selectedProducts.findIndex(p => p.id === product.id);
    if (index === -1) {
      state.selectedProducts.push(product);
    } else {
      state.selectedProducts.splice(index, 1);
    }
  }
  
  // Load shopping lists
  async function loadShoppingLists(sortByDate = true) {
    try {
      let lists = await db.getAllLists();
      
      if (sortByDate) {
        lists.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        lists.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      listsContainer.innerHTML = '';
      
      if (lists.length === 0) {
        listsContainer.innerHTML = '<div class="empty-state">No shopping lists yet. Create your first list!</div>';
        return;
      }
      
      lists.forEach(list => {
        const listCard = document.createElement('div');
        listCard.className = 'list-card';
        
        const formattedDate = new Date(list.date).toLocaleDateString();
        
        listCard.innerHTML = `
          <div class="list-info">
            <div class="list-name">${list.name}</div>
            <div class="list-date">${formattedDate}</div>
            <div class="list-items-count">${list.items.length} items</div>
          </div>
          <div class="list-actions">
            <div class="list-action-btn edit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div class="list-action-btn delete">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
          </div>
        `;
        
        // View list details
        listCard.querySelector('.list-info').addEventListener('click', () => {
          viewListDetails(list);
        });
        
        // Edit list
        listCard.querySelector('.list-action-btn.edit').addEventListener('click', (e) => {
          e.stopPropagation();
          editList(list);
        });
        
        // Delete list
        listCard.querySelector('.list-action-btn.delete').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteList(list.id);
        });
        
        listsContainer.appendChild(listCard);
      });
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  }
  
  // View list details
  async function viewListDetails(list) {
    state.currentList = list;
    listDetailTitle.textContent = list.name;
    listDetailDate.textContent = new Date(list.date).toLocaleDateString();
    
    listDetailItems.innerHTML = '';
    
    try {
      // Get all products to match with list items
      const vegetables = await db.getProductsByCategory(1);
      
      list.items.forEach(itemId => {
        const product = vegetables.find(v => v.id === itemId);
        if (product) {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-item';
          
          galleryItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="gallery-item-name">${product.name}</div>
          `;
          
          listDetailItems.appendChild(galleryItem);
        }
      });
    } catch (error) {
      console.error('Error loading list details:', error);
    }
    
    showScreen('list-detail-screen');
  }
  
  // Edit list
  async function editList(list) {
    state.currentList = list;
    state.selectedProducts = [];
    
    try {
      const vegetables = await db.getProductsByCategory(1);
      
      // Reset gallery and pre-select items from the list
      vegetablesGallery.innerHTML = '';
      
      vegetables.forEach(vegetable => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.id = vegetable.id;
        
        // Check if this vegetable is in the list
        const isSelected = list.items.includes(vegetable.id);
        if (isSelected) {
          galleryItem.classList.add('selected');
          state.selectedProducts.push(vegetable);
        }
        
        galleryItem.innerHTML = `
          <img src="${vegetable.image}" alt="${vegetable.name}">
          <div class="gallery-item-name">${vegetable.name}</div>
          <div class="gallery-item-checkbox">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        `;
        
        galleryItem.addEventListener('click', () => {
          toggleProductSelection(galleryItem, vegetable);
        });
        
        vegetablesGallery.appendChild(galleryItem);
      });
      
      showScreen('create-list-screen');
    } catch (error) {
      console.error('Error editing list:', error);
    }
  }
  
  // Delete list
  async function deleteList(listId) {
    if (confirm('Are you sure you want to delete this list?')) {
      try {
        await db.deleteList(listId);
        loadShoppingLists();
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  }
  
  // Initialize category view
  async function initCategoryView() {
    try {
      const vegetables = await db.getProductsByCategory(1);
      categoryDetailTitle.textContent = 'Vegetables';
      categoryItems.innerHTML = '';
      
      vegetables.forEach(vegetable => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        galleryItem.innerHTML = `
          <img src="${vegetable.image}" alt="${vegetable.name}">
          <div class="gallery-item-name">${vegetable.name}</div>
        `;
        
        categoryItems.appendChild(galleryItem);
      });
    } catch (error) {
      console.error('Error initializing category view:', error);
    }
  }
  
  // Handle image upload preview
  productImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Event Listeners
  homeBtn.addEventListener('click', () => {
    showScreen('home-screen');
  });
  
  createListBtn.addEventListener('click', () => {
    state.currentList = null;
    state.selectedProducts = [];
    initVegetableGallery();
    showScreen('create-list-screen');
  });
  
  myListsBtn.addEventListener('click', () => {
    loadShoppingLists();
    showScreen('my-lists-screen');
  });
  
  categoriesBtn.addEventListener('click', () => {
    showScreen('categories-screen');
  });
  
  vegetablesCategory.addEventListener('click', () => {
    initCategoryView();
    showScreen('category-detail-screen');
  });
  
  saveListBtn.addEventListener('click', () => {
    if (state.selectedProducts.length === 0) {
      alert('Please select at least one product for your list.');
      return;
    }
    
    // If editing an existing list, pre-fill the name
    if (state.currentList) {
      listNameInput.value = state.currentList.name;
      listDateInput.value = state.currentList.date;
    } else {
      listNameInput.value = '';
      listDateInput.value = today;
    }
    
    saveListDialog.classList.add('active');
  });
  
  cancelListBtn.addEventListener('click', () => {
    showScreen('home-screen');
  });
  
  confirmSaveBtn.addEventListener('click', async () => {
    const name = listNameInput.value.trim();
    const date = listDateInput.value;
    
    if (!name) {
      alert('Please enter a name for your list.');
      return;
    }
    
    try {
      const items = state.selectedProducts.map(p => p.id);
      
      if (state.currentList) {
        // Update existing list
        const updatedList = {
          ...state.currentList,
          name,
          date,
          items
        };
        await db.updateList(updatedList);
      } else {
        // Create new list
        await db.saveList({
          name,
          date,
          items,
          createdAt: new Date().toISOString()
        });
      }
      
      saveListDialog.classList.remove('active');
      showScreen('home-screen');
      
      // Show success message
      alert(state.currentList ? 'List updated successfully!' : 'List created successfully!');
    } catch (error) {
      console.error('Error saving list:', error);
      alert('There was an error saving your list. Please try again.');
    }
  });
  
  cancelSaveBtn.addEventListener('click', () => {
    saveListDialog.classList.remove('active');
  });
  
  sortByDateBtn.addEventListener('click', () => {
    sortByDateBtn.classList.add('active');
    sortByCategoryBtn.classList.remove('active');
    loadShoppingLists(true);
  });
  
  sortByCategoryBtn.addEventListener('click', () => {
    sortByCategoryBtn.classList.add('active');
    sortByDateBtn.classList.remove('active');
    loadShoppingLists(false);
  });
  
  backToListsBtn.addEventListener('click', () => {
    showScreen('my-lists-screen');
  });
  
  editListBtn.addEventListener('click', () => {
    editList(state.currentList);
  });
  
  addProductBtn.addEventListener('click', () => {
    productNameInput.value = '';
    productImageInput.value = '';
    imagePreview.innerHTML = '';
    addProductDialog.classList.add('active');
  });
  
  backToCategoriesBtn.addEventListener('click', () => {
    showScreen('categories-screen');
  });
  
  confirmAddProductBtn.addEventListener('click', async () => {
    const name = productNameInput.value.trim();
    const fileInput = productImageInput;
    
    if (!name) {
      alert('Please enter a product name.');
      return;
    }
    
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Please select an image for the product.');
      return;
    }
    
    try {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        // In a real app, we would upload this image to a server
        // For this prototype, we'll use the data URL directly
        const newProduct = {
          name,
          category: state.currentCategory,
          image: imageData
        };
        
        await db.addProduct(newProduct);
        addProductDialog.classList.remove('active');
        initCategoryView(); // Refresh the category view
        
        alert('Product added successfully!');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('There was an error adding the product. Please try again.');
    }
  });
  
  cancelAddProductBtn.addEventListener('click', () => {
    addProductDialog.classList.remove('active');
  });
  
  // Initialize the app
  showScreen('home-screen');
});
