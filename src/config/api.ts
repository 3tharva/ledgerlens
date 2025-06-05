export const API_BASE_URL = 'https://5d6e-106-219-147-39.ngrok-free.app/webhook';

export const API_ENDPOINTS = {
  GET_TRANSACTIONS: `${API_BASE_URL}/getData`,
  GET_CATEGORY_RULES: `${API_BASE_URL}/getCat`,
  SAVE_CATEGORY_RULES: `${API_BASE_URL}/saveCat`,
  UPDATE_CATEGORIZED_TRANSACTIONS: `${API_BASE_URL}/updateCategorizedTransactions`,
  PROCESS_NEW_STATEMENT: `${API_BASE_URL}/processNewStatement`,
  SAVE_URL: `${API_BASE_URL}/saveUrl`,
  GET_UNCATEGORIZED_TRANSACTIONS: `${API_BASE_URL}/getUncategorizedTransactions`,
  PROCESS_STATEMENT: `${API_BASE_URL}/87b25eb3-91c8-4f15-a733-db54bec6af4d`,
  UPDATE_CATEGORIZED: `${API_BASE_URL}/bf027b15-0096-4f2f-82c2-bcb217dcd430`,
} as const;

const defaultHeaders = {
  "ngrok-skip-browser-warning": "true"
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {})
  };

  return fetch(endpoint, {
    ...options,
    headers
  });
};

export async function getUncategorizedTransactions() {
  try {
    const response = await apiFetch(API_ENDPOINTS.GET_UNCATEGORIZED_TRANSACTIONS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching uncategorized transactions:', error);
    throw error;
  }
}

export async function processNewStatement(url: string) {
  try {
    const response = await apiFetch(API_ENDPOINTS.PROCESS_STATEMENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error processing new statement:', error);
    throw error;
  }
}

export async function updateCategorizedTransactions(transactions: any[]) {
  try {
    const response = await apiFetch(API_ENDPOINTS.UPDATE_CATEGORIZED, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactions }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating categorized transactions:', error);
    throw error;
  }
} 