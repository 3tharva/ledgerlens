export interface Transaction {
  row_number: number;
  date: string;
  description: string;
  mode: string;
  name: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  remarks: string;
  'ai.Category'?: string;
  category?: string;
  subcategory?: string;
  // Optional fields for internal use
  currency?: string;
  suggestedCategory?: string;
  suggestedSubcategory?: string;
  // Optional: other fields that might come from n8n
  payee?: string;
  rawDetails?: string; 
}

export interface CategorizedTransactionData {
  transactionId: string;
  category: string;
}

export const CATEGORIES = [
  "Groceries", 
  "Dining Out", 
  "Transport", 
  "Utilities", 
  "Housing",
  "Entertainment", 
  "Healthcare", 
  "Apparel", 
  "Travel", 
  "Education", 
  "Income", 
  "Gifts/Donations",
  "Personal Care",
  "Subscriptions",
  "Miscellaneous"
] as const;

export type Category = typeof CATEGORIES[number];
