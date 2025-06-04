import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Rows, Edit3, MousePointerSquareDashed, UploadCloud } from "lucide-react";

export function UserGuide() {
  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Welcome to LedgerLens!</CardTitle>
        <CardDescription className="text-muted-foreground">
          Streamline your transaction categorization with a simple swipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <UploadCloud className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold">1. Process New Statements</h3>
            <p className="text-sm text-muted-foreground">
              If you've uploaded a new bank statement to your connected Google Drive, click the &quot;Process New Bank Statement&quot; button to fetch the latest transactions.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Rows className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold">2. View Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Uncategorized transactions will appear below as interactive cards, each with a suggested category.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <MousePointerSquareDashed className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold">3. Swipe to Categorize</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-green-600">Swipe Right</span> to accept the suggested category.
              <br />
              <span className="font-medium text-red-600">Swipe Left</span> to reject the suggestion and manually choose a category.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Edit3 className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold">4. Manual Editing</h3>
            <p className="text-sm text-muted-foreground">
              If a suggestion is incorrect or you swiped left, you can click the &quot;Edit&quot; button on a card or use the controls that appear to select the correct category from a list.
            </p>
          </div>
        </div>
         <div className="flex items-start space-x-3">
          <ListChecks className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold">5. Confirm and Conquer</h3>
            <p className="text-sm text-muted-foreground">
              Once categorized, transactions are sent to your N8N workflow to keep your financial records up-to-date.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
