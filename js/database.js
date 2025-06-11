// Database handling for the grocery list app
class GroceryDatabase {
  constructor() {
    this.dbName = 'groceryListDB';
    this.dbVersion = 1;
    this.db = null;
    this.initDatabase();
  }

  // Initialize the IndexedDB database
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject('Could not open database');
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
          categoryStore.createIndex('name', 'name', { unique: true });
        }

        if (!db.objectStoreNames.contains('lists')) {
          const listStore = db.createObjectStore('lists', { keyPath: 'id', autoIncrement: true });
          listStore.createIndex('name', 'name', { unique: false });
          listStore.createIndex('date', 'date', { unique: false });
        }

        // Add initial data
        const transaction = event.target.transaction;
        
        // Add vegetable category
        const categoryStore = transaction.objectStore('categories');
        categoryStore.add({
          id: 1,
          name: 'Vegetables',
          image: 'images/vegetables-category.jpg'
        });

        // Add initial vegetable products
        const productStore = transaction.objectStore('products');
        const vegetables = [
          { name: 'Carrot', category: 1, image: 'images/vegetables/carrot.jpg' },
          { name: 'Leek', category: 1, image: 'images/vegetables/leek.jpg' },
          { name: 'Zucchini', category: 1, image: 'images/vegetables/zucchini.jpg' },
          { name: 'Turnip', category: 1, image: 'images/vegetables/turnip.jpg' },
          { name: 'Cabbage', category: 1, image: 'images/vegetables/cabbage.jpg' },
          { name: 'Shallot', category: 1, image: 'images/vegetables/shallot.jpg' },
          { name: 'Fennel', category: 1, image: 'images/vegetables/fennel.jpg' },
          { name: 'Celery Root', category: 1, image: 'images/vegetables/celery_root.jpg' },
          { name: 'Green Bean', category: 1, image: 'images/vegetables/green_bean.jpg' },
          { name: 'Endive', category: 1, image: 'images/vegetables/endive.jpg' }
        ];

        vegetables.forEach(vegetable => {
          productStore.add(vegetable);
        });
      };
    });
  }

  // Get all products by category
  async getProductsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const index = store.index('category');
      const request = index.getAll(categoryId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject('Error fetching products: ' + event.target.error);
      };
    });
  }

  // Get all categories
  async getAllCategories() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject('Error fetching categories: ' + event.target.error);
      };
    });
  }

  // Add a new product
  async addProduct(product) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.add(product);

      request.onsuccess = (event) => {
        resolve(event.target.result); // Returns the new product ID
      };

      request.onerror = (event) => {
        reject('Error adding product: ' + event.target.error);
      };
    });
  }

  // Add a new category
  async addCategory(category) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);

      request.onsuccess = (event) => {
        resolve(event.target.result); // Returns the new category ID
      };

      request.onerror = (event) => {
        reject('Error adding category: ' + event.target.error);
      };
    });
  }

  // Save a new shopping list
  async saveList(list) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['lists'], 'readwrite');
      const store = transaction.objectStore('lists');
      const request = store.add(list);

      request.onsuccess = (event) => {
        resolve(event.target.result); // Returns the new list ID
      };

      request.onerror = (event) => {
        reject('Error saving list: ' + event.target.error);
      };
    });
  }

  // Get all shopping lists
  async getAllLists() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['lists'], 'readonly');
      const store = transaction.objectStore('lists');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject('Error fetching lists: ' + event.target.error);
      };
    });
  }

  // Get a specific list by ID
  async getListById(listId) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['lists'], 'readonly');
      const store = transaction.objectStore('lists');
      const request = store.get(listId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject('Error fetching list: ' + event.target.error);
      };
    });
  }

  // Update an existing list
  async updateList(list) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['lists'], 'readwrite');
      const store = transaction.objectStore('lists');
      const request = store.put(list);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject('Error updating list: ' + event.target.error);
      };
    });
  }

  // Delete a list
  async deleteList(listId) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['lists'], 'readwrite');
      const store = transaction.objectStore('lists');
      const request = store.delete(listId);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject('Error deleting list: ' + event.target.error);
      };
    });
  }
}
