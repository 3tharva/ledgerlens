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

export const SUBCATEGORIES: Record<Category, string[]> = {
  "Groceries": ["Supermarket", "Local Market", "Online Grocery"],
  "Dining Out": ["Restaurant", "Cafe", "Fast Food", "Food Delivery"],
  "Transport": ["Public Transport", "Taxi", "Fuel", "Maintenance"],
  "Utilities": ["Electricity", "Water", "Gas", "Internet", "Phone"],
  "Housing": ["Rent", "Mortgage", "Maintenance", "Furniture"],
  "Entertainment": ["Movies", "Streaming", "Games", "Events"],
  "Healthcare": ["Doctor", "Pharmacy", "Insurance", "Fitness"],
  "Apparel": ["Clothing", "Shoes", "Accessories"],
  "Travel": ["Flights", "Hotels", "Local Transport", "Activities"],
  "Education": ["Tuition", "Books", "Courses", "Supplies"],
  "Income": ["Salary", "Freelance", "Investments", "Gifts"],
  "Gifts/Donations": ["Charity", "Personal Gifts", "Tips"],
  "Personal Care": ["Haircut", "Beauty", "Spa", "Cosmetics"],
  "Subscriptions": ["Software", "Memberships", "Services"],
  "Miscellaneous": ["Other"]
};
