"use client";

import type { Transaction, Category } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionCard } from "@/components/ledgerpoint/TransactionCard";
import { UserGuide } from "@/components/ledgerpoint/UserGuide";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListX, UploadCloud, CheckSquare, CheckCircle, ArrowRight, ArrowLeft, ArrowUpRight, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TransactionAnalytics } from "@/components/ledgerpoint/TransactionAnalytics";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS, apiFetch, getUncategorizedTransactions, processNewStatement, updateCategorizedTransactions } from "@/config/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, SUBCATEGORIES } from "@/types";

export default function LedgerPointPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorizedTransactions, setCategorizedTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedTransactions, setEditedTransactions] = useState<Record<number, { category?: string; subcategory?: string }>>({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getMonthYearFromDate = (dateStr: string): string => {
    const date = parseDate(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthYearLabel = (monthYear: string): string => {
    const [year, month] = monthYear.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getFilteredTransactions = () => {
    return allTransactions.filter(transaction => {
      // Filter by date range
      if (startDate && endDate) {
        const transactionDate = parseDate(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (transactionDate < start || transactionDate > end) {
          return false;
        }
      }

      // Filter by month
      if (selectedMonth !== "all") {
        const transactionMonthYear = getMonthYearFromDate(transaction.date);
        if (transactionMonthYear !== selectedMonth) {
          return false;
        }
      }

      // Filter by category
      if (selectedCategory !== "all" && transaction.category !== selectedCategory) {
        return false;
      }

      // Filter by mode
      if (selectedMode !== "all" && transaction.mode !== selectedMode) {
        return false;
      }

      return true;
    });
  };

  // Get unique categories, modes, and months for filters
  const uniqueCategories = Array.from(new Set(allTransactions.map(t => t.category).filter((c): c is string => Boolean(c))));
  const uniqueModes = Array.from(new Set(allTransactions.map(t => t.mode).filter((m): m is string => Boolean(m))));
  const uniqueMonths = Array.from(new Set(allTransactions.map(t => getMonthYearFromDate(t.date)))).sort().reverse();

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getUncategorizedTransactions();
      console.log('Raw transactions data:', data);
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

  const handleProcessNewStatement = async () => {
    setIsProcessing(true);
    try {
      const response = await apiFetch(API_ENDPOINTS.PROCESS_STATEMENT, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to process statement');
      }
      const data = await response.json();
      setAllTransactions(data);
      toast({
        title: "Success!",
        description: "Statement processed successfully.",
      });
    } catch (error) {
      console.error('Error processing statement:', error);
      toast({
        title: "Error",
        description: "Failed to process statement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategorize = (category: string, subcategory: string) => {
    if (currentIndex >= transactions.length) return;
    
    setIsProcessing(true);
    const transaction = transactions[currentIndex];
    const updatedTransaction = {
      ...transaction,
      category,
      subcategory
    };

    // Add to categorized transactions
    setCategorizedTransactions(prev => [...prev, updatedTransaction]);
    
    // Remove from uncategorized transactions
    setTransactions(prev => prev.filter((_, index) => index !== currentIndex));
    
    // Reset current index if we've reached the end
    if (currentIndex >= transactions.length - 1) {
      setCurrentIndex(Math.max(0, transactions.length - 2));
    }
    
    setIsProcessing(false);
  };

  const handleSubmitAllCategories = async () => {
    if (categorizedTransactions.length === 0) {
      toast({
        title: "No transactions to submit",
        description: "Please categorize some transactions first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiFetch(API_ENDPOINTS.UPDATE_CATEGORIZED_TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: categorizedTransactions }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit categories');
      }

      toast({
        title: "Success!",
        description: `Submitted ${categorizedTransactions.length} categorized transactions.`,
      });

      // Clear categorized transactions after successful submission
      setCategorizedTransactions([]);
    } catch (error) {
      console.error('Error submitting categories:', error);
      toast({
        title: "Error",
        description: "Failed to submit categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadAllTransactions = async () => {
    setIsLoadingAll(true);
    try {
      const response = await apiFetch(API_ENDPOINTS.GET_TRANSACTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      if (!text) {
        setAllTransactions([]);
        return;
      }
      const data = JSON.parse(text);
      setAllTransactions(data);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again later.",
        variant: "destructive",
      });
      setAllTransactions([]);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleCategoryChange = (rowNumber: number, category: string) => {
    setEditedTransactions(prev => ({
      ...prev,
      [rowNumber]: {
        ...prev[rowNumber],
        category,
        subcategory: '' // Reset subcategory when category changes
      }
    }));
  };

  const handleSubcategoryChange = (rowNumber: number, subcategory: string) => {
    setEditedTransactions(prev => ({
      ...prev,
      [rowNumber]: {
        ...prev[rowNumber],
        subcategory
      }
    }));
  };

  const handleSaveCategories = async () => {
    const transactionsToUpdate = Object.entries(editedTransactions).map(([rowNumber, changes]) => {
      const transaction = transactions.find(t => t.row_number === parseInt(rowNumber));
      if (!transaction) return null;

      return {
        row_number: parseInt(rowNumber),
        description: transaction.description,
        mode: transaction.mode,
        name: transaction.name,
        category: changes.category,
        subcategory: changes.subcategory
      };
    }).filter(Boolean);

    if (transactionsToUpdate.length === 0) {
      toast({
        title: "No changes to save",
        description: "Please edit some categories first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiFetch(API_ENDPOINTS.UPDATE_CATEGORIZED_TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: transactionsToUpdate }),
      });

      if (!response.ok) {
        throw new Error('Failed to update categories');
      }

      toast({
        title: "Success!",
        description: `Updated ${transactionsToUpdate.length} transactions.`,
      });

      // Clear edited transactions and refresh data
      setEditedTransactions({});
      fetchTransactions();
    } catch (error) {
      console.error('Error updating categories:', error);
      toast({
        title: "Error",
        description: "Failed to update categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingAll(true);
    try {
      const response = await apiFetch(API_ENDPOINTS.GET_TRANSACTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleUpdateTransaction = async (rowNumber: number) => {
    const changes = editedTransactions[rowNumber];
    if (!changes) return;

    // Find the original transaction
    const transaction = transactions.find(t => t.row_number === rowNumber);
    if (!transaction) return;

    try {
      const response = await apiFetch(API_ENDPOINTS.UPDATE_CATEGORIZED_TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transactions: [{
            row_number: rowNumber,
            description: transaction.description,
            mode: transaction.mode,
            name: transaction.name,
            category: changes.category,
            subcategory: changes.subcategory
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      toast({
        title: "Success!",
        description: "Transaction updated successfully.",
      });

      // Remove from edited transactions and refresh data
      const newEditedTransactions = { ...editedTransactions };
      delete newEditedTransactions[rowNumber];
      setEditedTransactions(newEditedTransactions);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: "Info",
      description: "File upload is not supported for processNewStatement.",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800">
      <Dialog open={isProcessing}>
        <DialogContent className="max-w-md bg-white text-center rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-16 w-16 text-[#7B61FF] animate-spin" />
            <DialogTitle className="text-xl font-semibold text-gray-800">Processing Your Statement...</DialogTitle>
            <p className="text-gray-600">Please wait while we process your transactions.</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-6xl sm:text-7xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] bg-clip-text text-transparent mb-4 tracking-wide">
            LedgerPoint
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            Smart transaction categorization powered by AI. Streamline your financial management with ease.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleProcessNewStatement}
              disabled={isProcessing || isLoading}
              className="w-full h-14 px-6 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[#7B61FF]/20"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-5 w-5" />
              )}
              Process New Statement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={loadTransactions}
              disabled={isLoading || isProcessing}
              className="w-full h-14 px-6 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[#7B61FF]/20"
            >
              <Loader2 className={cn("mr-2 h-5 w-5", isLoading && "animate-spin")} />
              Load Uncategorised Transactions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(true);
                loadAllTransactions();
              }}
              className="w-full h-14 px-6 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[#7B61FF]/20"
            >
              <ListX className="mr-2 h-5 w-5" />
              View All Transactions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-center p-4 rounded-lg bg-gray-100/30 backdrop-blur-sm border border-gray-300/30">
              <div className="flex items-center space-x-3">
                <div className="bg-[#7B61FF]/20 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-[#7B61FF]" />
                </div>
                <div>
                  <span className="text-sm text-gray-600">Categorized</span>
                  <p className="text-lg font-semibold text-gray-800">{categorizedTransactions.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <TransactionAnalytics />
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="space-y-4">
                <Card className="shadow-xl border-0 bg-gray-100/30 backdrop-blur-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </CardFooter>
                </Card>
              </div>
            ) : transactions.length > 0 ? (
              <div className="relative">
                <div className="w-full max-w-2xl mx-auto">
                  <TransactionCard
                    key={transactions[0].row_number}
                    transaction={transactions[0]}
                    onCategorize={handleCategorize}
                    onEdit={() => {}}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            ) : (
              <Card className="shadow-xl border-0 bg-gray-100/30 backdrop-blur-sm text-center py-16 text-gray-800">
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="bg-[#7B61FF]/20 rounded-full p-4 mb-6">
                    <ListX className="h-12 w-12 text-[#7B61FF]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">No Transactions to Categorize</h2>
                  <p className="text-gray-600 max-w-sm mb-6">
                    Click "Load Uncategorised Transactions" above to load new transactions for categorization.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {categorizedTransactions.length > 0 && (
            <div className="mt-8 p-6 bg-gray-100/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-300/30 text-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Ready to Save
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {categorizedTransactions.length} transactions categorized
                  </p>
                </div>
                <Button
                  onClick={handleSubmitAllCategories}
                  className="h-12 px-6 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] hover:shadow-[#7B61FF]/20"
                >
                  <CheckSquare className="mr-2 h-5 w-5" />
                  Save Changes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-12">
            <UserGuide />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-gray-300/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] bg-clip-text text-transparent">
                  All Transactions
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">All Transactions</h2>
                  <Button
                    onClick={handleSaveCategories}
                    disabled={Object.keys(editedTransactions).length === 0}
                    className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white"
                  >
                    Save Changes
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-800">Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-full bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-gray-100 border-gray-300/30 max-h-[200px] overflow-y-auto"
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                      >
                        <SelectItem value="all">All Months</SelectItem>
                        {uniqueMonths.map((month) => (
                          <SelectItem key={month} value={month}>
                            {getMonthYearLabel(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-800">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-gray-100 border-gray-300/30 max-h-[200px] overflow-y-auto"
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                      >
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-800">Mode</Label>
                    <Select
                      value={selectedMode}
                      onValueChange={setSelectedMode}
                    >
                      <SelectTrigger className="w-full bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-gray-100 border-gray-300/30 max-h-[200px] overflow-y-auto"
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                      >
                        <SelectItem value="all">All Modes</SelectItem>
                        {uniqueModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-800">Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30"
                      />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30"
                      />
                    </div>
                  </div>
                </div>
                <div className="border border-gray-300/30 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300/30">
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Date</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Description</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Mode</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Category</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Subcategory</th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-800">Amount</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingAll ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                              <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading transactions...</span>
                              </div>
                            </td>
                          </tr>
                        ) : getFilteredTransactions().length > 0 ? (
                          getFilteredTransactions().map((transaction) => (
                            <tr key={transaction.row_number} className="border-b border-gray-300/30 hover:bg-gray-200/30">
                              <td className="px-4 py-2 text-sm text-gray-800">{transaction.date}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{transaction.description}</td>
                              <td className="px-4 py-2 text-sm text-gray-800">{transaction.mode || '-'}</td>
                              <td className="px-4 py-2 text-sm">
                                <Select
                                  value={editedTransactions[transaction.row_number]?.category || transaction.category || ''}
                                  onValueChange={(value) => handleCategoryChange(transaction.row_number, value)}
                                >
                                  <SelectTrigger className="w-[180px] bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30">
                                    <SelectValue>
                                      {editedTransactions[transaction.row_number]?.category || transaction.category || '-'}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent
                                    className="bg-gray-100 border-gray-300/30 max-h-[200px] overflow-y-auto"
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={4}
                                  >
                                    <SelectItem value="">-</SelectItem>
                                    {CATEGORIES.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <Select
                                  value={editedTransactions[transaction.row_number]?.subcategory || transaction.subcategory || ''}
                                  onValueChange={(value) => handleSubcategoryChange(transaction.row_number, value)}
                                >
                                  <SelectTrigger className="w-[180px] bg-transparent border-gray-300/30 text-gray-800 hover:bg-gray-200/30">
                                    <SelectValue>
                                      {editedTransactions[transaction.row_number]?.subcategory || transaction.subcategory || '-'}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent
                                    className="bg-gray-100 border-gray-300/30 max-h-[200px] overflow-y-auto"
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    sideOffset={4}
                                  >
                                    <SelectItem value="">-</SelectItem>
                                    {SUBCATEGORIES[(editedTransactions[transaction.row_number]?.category || transaction.category) as Category]?.map((subcategory) => (
                                      <SelectItem key={subcategory} value={subcategory}>
                                        {subcategory}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-semibold text-gray-800">₹{transaction.debit_amount || transaction.credit_amount}</td>
                              <td className="px-4 py-2 text-center">
                                <Button
                                  onClick={() => handleUpdateTransaction(transaction.row_number)}
                                  disabled={!editedTransactions[transaction.row_number]}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                                >
                                  Update
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                              No transactions match the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
}
