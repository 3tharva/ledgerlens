"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, apiFetch } from "@/config/api";

interface Transaction {
  row_number: number;
  date: string;
  description: string;
  debit_amount: number;
  credit_amount: string;
  balance: number;
  category: string;
  mode: string;
  subcategory: string;
  name: string;
  remarks: string;
}

const COLORS = ['#7B61FF', '#00C9FF', '#FF6B6B', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722'];

type TransactionType = 'debit' | 'credit';
type ViewMode = 'category' | 'mode';

export function TransactionAnalytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('debit');
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset dependent filters when parent filter changes
    if (viewMode === 'category') {
      setSelectedMode('all');
    }
    setAmountRange('all');
  }, [viewMode, selectedCategory, selectedMode]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch(API_ENDPOINTS.GET_TRANSACTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      if (!text) {
        setTransactions([]);
        return;
      }
      const data = JSON.parse(text);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again later.",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionAmount = (transaction: Transaction): number => {
    if (transactionType === 'debit') {
      return transaction.debit_amount || 0;
    } else {
      return transaction.credit_amount && transaction.credit_amount !== "" 
        ? parseFloat(transaction.credit_amount) 
        : 0;
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filter by transaction type
    filtered = filtered.filter(t => {
      const amount = getTransactionAmount(t);
      return amount > 0;
    });

    // Filter by category if in category view
    if (viewMode === 'category' && selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by mode
    if (selectedMode !== 'all') {
      filtered = filtered.filter(t => t.mode === selectedMode);
    }

    // Filter by amount range
    if (amountRange !== 'all') {
      const [min, max] = amountRange.split('-').map(Number);
      filtered = filtered.filter(t => {
        const amount = getTransactionAmount(t);
        if (max) {
          return amount >= min && amount < max;
        } else {
          return amount >= min;
        }
      });
    }

    return filtered;
  };

  const getChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    const data: { [key: string]: number } = {};

    filteredTransactions.forEach(transaction => {
      const amount = getTransactionAmount(transaction);
      if (amount === 0) return;
      const key = viewMode === 'category' ? transaction.category : transaction.mode;
      if (!key) return;
      data[key] = (data[key] || 0) + amount;
    });

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  };

  const getAmountRanges = () => {
    const ranges = [
      { label: 'All Amounts', value: 'all' },
      { label: 'Below 500', value: '0-500' },
      { label: '500 - 1000', value: '500-1000' },
      { label: '1000 - 5000', value: '1000-5000' },
      { label: '5000+', value: '5000-' },
    ];
    return ranges;
  };

  const getUniqueCategories = () => {
    const categories = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(categories).map(category => ({ label: category, value: category }));
  };

  const getUniqueModes = () => {
    const modes = new Set(transactions.map(t => t.mode).filter(Boolean));
    return Array.from(modes).map(mode => ({ label: mode, value: mode }));
  };

  const formatAmount = (transaction: Transaction): string => {
    const amount = getTransactionAmount(transaction);
    if (amount === 0) return '-';
    return `₹${amount.toLocaleString()}`;
  };

  const renderFilters = () => {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Select value={transactionType} onValueChange={(value: TransactionType) => setTransactionType(value)}>
            <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700/50 text-slate-200">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">Debit Transactions</SelectItem>
              <SelectItem value="credit">Credit Transactions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700/50 text-slate-200">
              <SelectValue placeholder="Select view mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="mode">By Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          {viewMode === 'category' && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700/50 text-slate-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700/50 text-slate-200">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {getUniqueModes().map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={amountRange} onValueChange={setAmountRange}>
            <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700/50 text-slate-200">
              <SelectValue placeholder="Select amount range" />
            </SelectTrigger>
            <SelectContent>
              {getAmountRanges().map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const loadTransactions = async () => {
    try {
      const response = await apiFetch(API_ENDPOINTS.UPDATE_CATEGORIZED_TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: categorizedTransactions.map(t => ({
            row_number: t.row_number,
            date: t.date,
            description: t.description,
            mode: t.mode,
            name: t.name,
            debit_amount: t.debit_amount,
            credit_amount: t.credit_amount,
            balance: t.balance,
            remarks: t.remarks,
            category: t.category,
            subcategory: t.subcategory
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-14 px-6 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 text-slate-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] hover:bg-gray-800/50"
        >
          <BarChart2 className="mr-2 h-5 w-5 text-[#7B61FF]" />
          View Analytics
          <ArrowRight className="ml-2 h-5 w-5 text-[#7B61FF]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto bg-[#1A1D24] border-gray-700/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] bg-clip-text text-transparent">
            Transaction Analytics
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View and analyze your transaction data with interactive charts and filters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {renderFilters()}

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Bar Chart</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#E5E7EB'
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#7B61FF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Pie Chart</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getChartData()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      labelLine={false}
                    >
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#E5E7EB'
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      wrapperStyle={{ paddingLeft: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Transaction List</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/30">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200">Amount</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200">Category</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200">Mode</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200">Subcategory</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTransactions().map((transaction) => (
                    <tr key={transaction.row_number} className="border-b border-gray-700/30 hover:bg-gray-700/30">
                      <td className="px-4 py-2 text-sm text-slate-200">{transaction.date}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{transaction.description}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{formatAmount(transaction)}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{transaction.category || '-'}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{transaction.mode || '-'}</td>
                      <td className="px-4 py-2 text-sm text-slate-200">{transaction.subcategory || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 