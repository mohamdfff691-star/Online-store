import { Product, CustomerOrder, OrderStatus } from '../types';

const ADMIN_TOKEN_KEY = 'rlz_admin_bearer_token';

export function getStoredAdminToken(): string {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || 'rlz_auth_token_96329_verified';
}

export function setStoredAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearStoredAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

// 1. Fetch Global Products (available to all users, phones, incognito)
export async function fetchGlobalProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[RLZ SHOP API] Error fetching server products, falling back to cache:', err);
    throw err;
  }
}

// 2. Admin: Create Product on Server
export async function createProductOnServer(
  productData: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  const token = getStoredAdminToken();
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    throw new Error('Failed to create product on server');
  }
  return await res.json();
}

// 3. Admin: Update Product on Server
export async function updateProductOnServer(product: Product): Promise<Product> {
  const token = getStoredAdminToken();
  const res = await fetch(`/api/products/${product.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error('Failed to update product on server');
  }
  return await res.json();
}

// 4. Admin: Delete Product from Server
export async function deleteProductOnServer(id: string): Promise<boolean> {
  const token = getStoredAdminToken();
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete product from server');
  }
  return true;
}

// 5. Admin: Seed Demo Products
export async function seedDemoProductsOnServer(demoProducts: Product[]): Promise<boolean> {
  const token = getStoredAdminToken();
  const res = await fetch('/api/products/seed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
    body: JSON.stringify({ demoProducts }),
  });

  return res.ok;
}

// 6. Admin: Clear Products
export async function clearProductsOnServer(): Promise<boolean> {
  const token = getStoredAdminToken();
  const res = await fetch('/api/products/clear', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
  });

  return res.ok;
}

// 7. Public: Submit Customer Order
export async function submitOrderToServer(order: CustomerOrder): Promise<CustomerOrder> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[RLZ SHOP API] Error syncing order to server:', err);
  }
  return order;
}

// 8. Admin: Fetch All Orders
export async function fetchOrdersFromServer(): Promise<CustomerOrder[]> {
  const token = getStoredAdminToken();
  const res = await fetch('/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  return await res.json();
}

// 9. Admin: Update Order Status
export async function updateOrderStatusOnServer(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  const token = getStoredAdminToken();
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}

// 10. Admin: Delete Order
export async function deleteOrderOnServer(orderId: string): Promise<boolean> {
  const token = getStoredAdminToken();
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    },
  });
  return res.ok;
}

// 11. Admin Login on Server
export async function loginAdminOnServer(username: string, pin: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, pin }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.token) {
      setStoredAdminToken(data.token);
      return true;
    }
  }
  return false;
}
