import type { Transaction, CategorizedTransactionData } from '@/types';

const N8N_BASE_URL = 'http://localhost:5698/webhook-test';

export async function fetchUncategorizedTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${N8N_BASE_URL}/getUncategorizedTransactions`);
  if (!response.ok) {
    throw new Error('Failed to fetch uncategorized transactions');
  }
  const result = await response.json();
  console.log('Raw webhook response:', result); // Debugging: Log raw response
  
  // Process the data to ensure it matches our Transaction interface
  const processTransactions = (data: any[]): Transaction[] => {
    return data.map((item, index) => ({
      row_number: item.row_number || index + 1,
      date: item.date,
      description: item.description,
      mode: item.mode,
      name: item.name,
      debit_amount: Number(item.debit_amount) || 0,
      credit_amount: Number(item.credit_amount) || 0,
      balance: Number(item.balance) || 0,
      remarks: item.remarks || '',
      'ai.Category': item['ai.Category'],
      category: item.category, // Keep the original category field
      currency: 'INR', // Default currency
      suggestedCategory: item['ai.Category'], // Map ai.Category to suggestedCategory for UI
    }));
  };

  // Check if the result is an array with a single object containing a 'response' property
  if (Array.isArray(result) && result.length > 0 && result[0].response && Array.isArray(result[0].response.body)) {
    return processTransactions(result[0].response.body);
  }
  // If the result is directly an array of transactions, return it
  if (Array.isArray(result)) {
    return processTransactions(result);
  }
  return [];
}

export async function submitCategorization(data: CategorizedTransactionData): Promise<void> {
  // Send the data in the original format, just updating the category field
  const response = await fetch(`${N8N_BASE_URL}/87b25eb3-91c8-4f15-a733-db54bec6af4d`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      row_number: parseInt(data.transactionId),
      category: data.category
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Submit categorization error:", errorBody);
    throw new Error('Failed to submit categorization');
  }
}

export async function triggerNewStatementProcessing(): Promise<void> {
  const response = await fetch(`${N8N_BASE_URL}/bf027b15-0096-4f2f-82c2-bcb217dcd430`, {
    method: 'POST', // Assuming POST, adjust if GET or other method
  });
  if (!response.ok) {
    throw new Error('Failed to trigger new statement processing');
  }
  // You might want to return a message from n8n if it provides one
  // For now, just confirm success if response is ok
}
