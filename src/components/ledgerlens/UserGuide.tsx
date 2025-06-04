import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Rows, Edit3, MousePointerSquareDashed, UploadCloud } from "lucide-react";

export function UserGuide() {
  return (
    <Card className="shadow-xl border-0 bg-gray-800/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl bg-gradient-to-r from-[#e0aaff] to-[#b88cff] bg-clip-text text-transparent">
          Welcome to LedgerLens!
        </CardTitle>
        <CardDescription className="text-slate-400">
          Streamline your transaction categorization with a simple swipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <UploadCloud className="h-6 w-6 text-[#e0aaff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-1">1. Process New Statements</h3>
            <p className="text-sm text-slate-400">
              If you've uploaded a new bank statement to your connected Google Drive, click the "Process New Bank Statement" button to fetch the latest transactions.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <Rows className="h-6 w-6 text-[#e0aaff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-1">2. View Transactions</h3>
            <p className="text-sm text-slate-400">
              Uncategorized transactions will appear below as interactive cards, each with a suggested category.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <MousePointerSquareDashed className="h-6 w-6 text-[#e0aaff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-1">3. Categorize Transactions</h3>
            <p className="text-sm text-slate-400">
              Review each transaction and either accept the suggested category or select a different one. Use the quick actions to speed up your workflow.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <Edit3 className="h-6 w-6 text-[#e0aaff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-1">4. Customize Categories</h3>
            <p className="text-sm text-slate-400">
              Create custom categories and rules to better organize your transactions. The system will learn from your preferences over time.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <ListChecks className="h-6 w-6 text-[#e0aaff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-1">5. Review and Save</h3>
            <p className="text-sm text-slate-400">
              Once you're done categorizing, review your changes and save them. Your categorized transactions will be available for reporting and analysis.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
