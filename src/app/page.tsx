"use client";

import type { Transaction, Category } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TransactionCard } from "@/components/ledgerpoint/TransactionCard";
import { UserGuide } from "@/components/ledgerpoint/UserGuide";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListX, UploadCloud, CheckSquare, CheckCircle, ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CategoryRulesManager } from "@/components/ledgerpoint/CategoryRulesManager";
import { TransactionAnalytics } from "@/components/ledgerpoint/TransactionAnalytics";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS, apiFetch, getUncategorizedTransactions, processNewStatement, updateCategorizedTransactions } from "@/config/api";

export default function LedgerPointPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorizedTransactions, setCategorizedTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const [url, setUrl] = useState("");

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
      await processNewStatement(url);
      toast({
        title: "Success",
        description: "New statement processing triggered successfully.",
      });
    } catch (error) {
      console.error('Error processing new statement:', error);
      toast({
        title: "Error",
        description: "Failed to process new statement. Please try again later.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiFetch(API_ENDPOINTS.SAVE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "URL saved successfully. You can now view transactions.",
      });
      setUrl("");
    } catch (error) {
      console.error('Error saving URL:', error);
      toast({
        title: "Error",
        description: "Failed to save URL. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0C29] to-[#1A1D24] text-slate-200">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-6xl sm:text-7xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] bg-clip-text text-transparent mb-4 tracking-wide">
            LedgerPoint
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
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
              Refresh Transactions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-center p-4 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="bg-[#7B61FF]/20 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-[#7B61FF]" />
                </div>
                <div>
                  <span className="text-sm text-slate-400">Categorized</span>
                  <p className="text-lg font-semibold text-slate-200">{categorizedTransactions.length}</p>
                </div>
              </div>
            </div>
            <div className="w-full">
              <CategoryRulesManager />
            </div>
          </div>

          <div className="mb-8">
            <TransactionAnalytics />
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="space-y-4">
                <Card className="shadow-xl border-0 bg-gray-800/30 backdrop-blur-sm">
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
              <Card className="shadow-xl border-0 bg-gray-800/30 backdrop-blur-sm text-center py-16 text-slate-200">
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="bg-[#7B61FF]/20 rounded-full p-4 mb-6">
                    <ListX className="h-12 w-12 text-[#7B61FF]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-100 mb-3">No Transactions to Categorize</h2>
                  <p className="text-slate-400 max-w-sm mb-6">
                    Click "Refresh Transactions" above to load new transactions for categorization.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {categorizedTransactions.length > 0 && (
            <div className="mt-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/30 text-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">
                    Ready to Save
                  </h3>
                  <p className="text-slate-400 text-sm">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-gray-300">Enter URL</Label>
              <div className="flex gap-4">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="flex-1 bg-gray-800/50 border-gray-700/50 text-slate-200 placeholder:text-gray-500 focus:border-[#7B61FF]/50 focus:ring-[#7B61FF]/20"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-14 px-6 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[#7B61FF]/20"
                >
                  {isLoading ? 'Saving...' : 'Save URL'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
