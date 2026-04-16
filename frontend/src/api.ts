const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:5000";

export const getToken   = () => localStorage.getItem("dairy_token") ?? "";
export const setToken   = (t: string) => localStorage.setItem("dairy_token", t);
export const clearToken = () => localStorage.removeItem("dairy_token");

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data as T;
}

export const authAPI = {
  login:          (username: string, password: string) =>
    req<{ token: string; username: string }>("POST", "/api/auth/login", { username, password }),
  register:       (username: string, password: string) =>
    req<{ message: string }>("POST", "/api/auth/register", { username, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    req<{ message: string }>("POST", "/api/auth/change-password", { currentPassword, newPassword }),
};

export const customerAPI = {
  list:   () => req<any[]>("GET", "/api/customers"),
  create: (data: any) => req<any>("POST", "/api/customers", data),
  update: (id: string, data: any) => req<any>("PUT", `/api/customers/${id}`, data),
  delete: (id: string) => req<any>("DELETE", `/api/customers/${id}`),
};

export const entryAPI = {
  byMonth:    (month: string) => req<any[]>("GET", `/api/entries?month=${month}`),
  byDate:     (date: string)  => req<any[]>("GET", `/api/entries?date=${date}`),
  byCustomer: (customerId: string, month: string) =>
    req<any[]>("GET", `/api/entries?customerId=${customerId}&month=${month}`),
  save:   (data: any) => req<any>("POST", "/api/entries", data),
  delete: (id: string) => req<any>("DELETE", `/api/entries/${id}`),
};

export const paymentAPI = {
  byMonth:    (month: string)      => req<any[]>("GET", `/api/payments?month=${month}`),
  byCustomer: (customerId: string) => req<any[]>("GET", `/api/payments?customerId=${customerId}`),
  create: (data: any) => req<any>("POST", "/api/payments", data),
  delete: (id: string) => req<any>("DELETE", `/api/payments/${id}`),
};

export const priceAPI = {
  getCurrent: () => req<{ prices: Record<string, number> }>("GET", "/api/prices"),
  getHistory: () => req<any[]>("GET", "/api/prices/history"),
  update:     (prices: Record<string, number>) => req<any>("PUT", "/api/prices", { prices }),
};
