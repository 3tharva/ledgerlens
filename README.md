# LedgerPoint

LedgerPoint is a modern web application for smart transaction categorization powered by AI. It helps users streamline their financial management by automatically categorizing bank transactions and providing an intuitive interface for review and customization.

![LedgerPoint](https://via.placeholder.com/800x400?text=LedgerPoint)

## Features

- **Smart Transaction Categorization**: AI-powered automatic categorization of bank transactions
- **Interactive Transaction Cards**: Swipe-based interface for quick transaction categorization
- **Custom Category Rules**: Create and manage custom categories and rules
- **Transaction Analytics**: Visualize spending patterns with interactive charts
- **Real-time Updates**: Process new bank statements and refresh transactions instantly
- **User-friendly Interface**: Modern, responsive design with intuitive controls

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS
- **State Management**: React Hooks
- **Data Visualization**: Recharts
- **API Integration**: RESTful API with fetch
- **Styling**: Tailwind CSS with custom animations
- **Development Tools**: TypeScript, ESLint

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ledgerpoint.git
cd ledgerpoint
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_API_BASE_URL=your_api_base_url
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Process New Statements**
   - Upload your bank statement or connect your bank account
   - Click "Process New Statement" to fetch transactions

2. **Categorize Transactions**
   - Review each transaction card
   - Swipe right to accept the suggested category
   - Swipe left to edit the category
   - Select custom categories and subcategories

3. **Customize Categories**
   - Access the Category Rules Manager
   - Create new categories and rules
   - Set up automatic categorization rules

4. **View Analytics**
   - Access transaction analytics
   - View spending patterns by category
   - Filter and analyze transactions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for data visualization
- [Lucide Icons](https://lucide.dev/) for beautiful icons 