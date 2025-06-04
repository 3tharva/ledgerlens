# **App Name**: LedgerLens

## Core Features:

- Transaction Fetching: Fetch uncategorized transactions using the n8n webhook at http://localhost:5698/webhook-test/getUncategorizedTransactions
- Transaction Display: Display each transaction with suggested categories.
- Swipe Categorization: Implement a 'Tinder-like' swipe interface for quick categorization (left for reject, right for accept).
- Manual Edit: Allow users to manually edit or select a category if the recommendation is incorrect.
- Category Submission: Send updated transaction categories to the n8n workflow using webhook at http://localhost:5698/webhook-test/87b25eb3-91c8-4f15-a733-db54bec6af4d to persist categorization data.
- User Guidance: Clear instructions and explanations within the app guiding users on how to use the app effectively. Capture initial transaction extraction using n8n webhook url http://localhost:5698/webhook-test/bf027b15-0096-4f2f-82c2-bcb217dcd430
- New Bank Statement Uploaded Button: Button to execute http://localhost:5698/webhook-test/bf027b15-0096-4f2f-82c2-bcb217dcd430 if you have uploaded another bankstatment to google drive

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to convey trustworthiness and innovation.
- Background color: Light gray (#F5F5F5), providing a clean and modern backdrop.
- Accent color: Soft blue (#A5D8EF) for interactive elements, creating a sense of calm.
- Body and headline font: 'Inter', a grotesque-style sans-serif, chosen for its modern and neutral look.
- Use simple, intuitive icons to represent categories, making navigation straightforward.
- Design a card-based layout for transactions, ensuring each entry is distinct and easy to interact with.
- Incorporate subtle animations for swipe actions and category confirmations, providing clear feedback to the user.