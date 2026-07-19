const BASE_URL = '/api';

// Helper fetch wrapper
const apiFetch = async (url, options = {}) => {
  const res = await fetch(BASE_URL + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const initDB = async () => {
  return Promise.resolve();
};

export const db = {
  // ============================================================
  // PRODUCTS
  // ============================================================
  getProducts: () => apiFetch('/products'),

  addProduct: (product) =>
    apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (updatedProduct) =>
    apiFetch(`/products/${updatedProduct.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
    }),

  deleteProduct: (id) =>
    apiFetch(`/products/${id}`, { method: 'DELETE' }),

  // ============================================================
  // SUPPLIERS
  // ============================================================
  getSuppliers: () => apiFetch('/suppliers'),

  addSupplier: (supplier) =>
    apiFetch('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),

  updateSupplier: (updatedSupplier) =>
    apiFetch(`/suppliers/${updatedSupplier.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedSupplier),
    }),

  deleteSupplier: (id) =>
    apiFetch(`/suppliers/${id}`, { method: 'DELETE' }),

  // ============================================================
  // STOCKS
  // ============================================================
  getStocks: () => apiFetch('/stocks'),

  updateStock: (updatedStock) =>
    apiFetch(`/stocks/${updatedStock.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedStock),
    }),

  adjustStockQuantity: (productId, quantityChange) =>
    apiFetch(`/stocks/adjust/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantityChange }),
    }),

  // ============================================================
  // SALES
  // ============================================================
  getSales: () => apiFetch('/sales'),

  addSale: (sale) =>
    apiFetch('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),

  deleteSale: (id) =>
    apiFetch(`/sales/${id}`, { method: 'DELETE' }),

  // ============================================================
  // ANNOUNCEMENTS
  // ============================================================
  getAnnouncements: () => apiFetch('/announcements'),

  addAnnouncement: (announcement) =>
    apiFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    }),

  updateAnnouncement: (ann) =>
    apiFetch(`/announcements/${ann.id}`, {
      method: 'PUT',
      body: JSON.stringify(ann),
    }),

  deleteAnnouncement: (id) =>
    apiFetch(`/announcements/${id}`, { method: 'DELETE' }),

  // ============================================================
  // AUTH — disimpan di sessionStorage
  // ============================================================
  getAuth: () => {
    try {
      const item = sessionStorage.getItem('sembako_auth');
      return item ? JSON.parse(item) : { loggedIn: false, user: null };
    } catch {
      return { loggedIn: false, user: null };
    }
  },

  setAuth: (loggedIn, user) => {
    try {
      sessionStorage.setItem('sembako_auth', JSON.stringify({ loggedIn, user }));
    } catch { }
  },

  login: (username) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  logout: () => {
    try {
      sessionStorage.removeItem('sembako_auth');
    } catch { }
  },
};
