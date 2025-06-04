"use client";

import type { Transaction, Category } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TransactionCard } from "@/components/ledgerlens/TransactionCard";
import { UserGuide } from "@/components/ledgerlens/UserGuide";
import { fetchUncategorizedTransactions, submitCategorization, triggerNewStatementProcessing } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListX, UploadCloud, CheckSquare, CheckCircle, ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function LedgerLensPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorizedTransactions, setCategorizedTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUncategorizedTransactions();
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
      await triggerNewStatementProcessing();
      toast({
        title: "Success",
        description: "New statement processing initiated. Click 'Refresh Transactions' to see new transactions.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to trigger new statement processing.",
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
      const response = await fetch('http://localhost:5698/webhook-test/updateCategorizedTransactions', {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            LedgerLens
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Swipe right to categorize, left to skip. Your financial data, simplified.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={handleProcessNewStatement}
              disabled={isProcessing || isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-12 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-5 w-5" />
              )}
              Process New Statement
            </Button>
            <Button
              onClick={loadTransactions}
              disabled={isLoading || isProcessing}
              className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Loader2 className={cn("mr-2 h-5 w-5", isLoading && "animate-spin")} />
              Refresh Transactions
            </Button>
            <Button
              onClick={handleSubmitAllCategories}
              disabled={categorizedTransactions.length === 0}
              className={cn(
                "h-12 shadow-lg hover:shadow-xl transition-all duration-200",
                categorizedTransactions.length > 0
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <CheckSquare className="mr-2 h-5 w-5" />
              Done ({categorizedTransactions.length})
            </Button>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="space-y-4">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
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
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ArrowLeft className="h-8 w-8" />
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ArrowRight className="h-8 w-8" />
                </div>
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
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center py-16">
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="bg-slate-100 rounded-full p-4 mb-6">
                    <ListX className="h-12 w-12 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-700 mb-3">No Transactions to Categorize</h2>
                  <p className="text-slate-500 max-w-sm">
                    Click "Refresh Transactions" to load new transactions for categorization.
                  </p>
                  <Button
                    onClick={loadTransactions}
                    className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Load Transactions
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {categorizedTransactions.length > 0 && (
            <div className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Categorized Transactions ({categorizedTransactions.length})
              </h3>
              <p className="text-slate-500 text-sm">
                Click "Done" to save all categorized transactions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
