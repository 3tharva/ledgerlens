"use client";

import type { Transaction, Category } from "@/types";
import { CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { CheckCircle, Edit3, Save, XCircle, RotateCcw, ArrowLeftRight, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: Transaction;
  onCategorize: (category: string, subcategory: string) => void;
  onEdit: () => void;
  isProcessing: boolean;
}

const SWIPE_THRESHOLD = 100; // pixels

// Define subcategories for each main category
const SUBCATEGORIES: Record<Category, string[]> = {
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

export function TransactionCard({ 
  transaction, 
  onCategorize, 
  onEdit,
  isProcessing 
}: TransactionCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [dragDistance, setDragDistance] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(transaction.category || '');
  const [editedSubcategory, setEditedSubcategory] = useState(transaction.subcategory || '');
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isProcessing) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setDragDistance(deltaX);
    setDragDirection(deltaX > 0 ? 'right' : 'left');
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    // Handle swipe actions
    if (Math.abs(dragDistance) > SWIPE_THRESHOLD) {
      if (dragDistance > 0) {
        // Swipe right - Accept category
        if (transaction.category) {
          onCategorize(transaction.category, transaction.subcategory || '');
        }
      } else {
        // Swipe left - Edit category
        setIsEditing(true);
      }
    }
    
    setIsDragging(false);
    setDragDistance(0);
    setDragDirection(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isProcessing) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setDragDistance(deltaX);
    setDragDirection(deltaX > 0 ? 'right' : 'left');
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    // Handle swipe actions
    if (Math.abs(dragDistance) > SWIPE_THRESHOLD) {
      if (dragDistance > 0) {
        // Swipe right - Accept category
        if (transaction.category) {
          onCategorize(transaction.category, transaction.subcategory || '');
        }
      } else {
        // Swipe left - Edit category
        setIsEditing(true);
      }
    }
    
    setIsDragging(false);
    setDragDistance(0);
    setDragDirection(null);
  };

  const handleAcceptCategory = () => {
    if (transaction['ai.Category']) {
      onCategorize(transaction['ai.Category'], transaction.subcategory || '');
    }
  };

  const handleEditSubmit = () => {
    onCategorize(editedCategory, editedSubcategory);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              value={editedCategory}
              onValueChange={(value: string) => {
                setEditedCategory(value);
                // Reset subcategory when category changes
                setEditedSubcategory('');
              }}
            >
              <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 hover:bg-gray-100">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white border-gray-200 max-h-[200px] overflow-y-auto"
                position="popper"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory
            </label>
            <Select
              value={editedSubcategory}
              onValueChange={(value: string) => setEditedSubcategory(value)}
              disabled={!editedCategory}
            >
              <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 hover:bg-gray-100">
                <SelectValue placeholder={editedCategory ? "Select a subcategory" : "Select a category first"} />
              </SelectTrigger>
              <SelectContent 
                className="bg-white border-gray-200 max-h-[200px] overflow-y-auto"
                position="popper"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                {editedCategory && SUBCATEGORIES[editedCategory as Category]?.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSubmit}
            disabled={!editedCategory}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              editedCategory
                ? 'bg-[#326DEC] hover:bg-[#2A5BCB]'
                : 'bg-gray-200 cursor-not-allowed text-gray-500'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  const swipeFeedbackOpacity = Math.min(Math.abs(dragDistance) / SWIPE_THRESHOLD, 1);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "relative w-full max-w-2xl mx-auto rounded-xl shadow-lg transition-transform duration-100 ease-out",
        "border border-gray-200 bg-white",
        isDragging && "cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
      style={{
        transform: isDragging ? `translateX(${dragDistance}px)` : undefined,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe feedback overlays */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          dragDirection === 'right' ? 'bg-green-50' : 'bg-blue-50',
          dragDirection ? 'opacity-100' : 'opacity-0'
        )}
        style={{ opacity: swipeFeedbackOpacity }}
      >
        {dragDirection === 'right' ? (
          <ThumbsUp className="h-12 w-12 text-green-600" />
        ) : dragDirection === 'left' ? (
          <Edit3 className="h-12 w-12 text-blue-600" />
        ) : null}
      </div>

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10 rounded-xl">
          <Loader2 className="h-10 w-10 animate-spin text-[#326DEC]" />
        </div>
      )}
      
      <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-gray-200 rounded-t-xl px-6 py-4 flex flex-row items-center justify-between">
        <div className="text-sm text-gray-600">{transaction.date}</div>
        <Badge 
          variant="outline" 
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            transaction.debit_amount > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
          )}
        >
          {transaction.debit_amount > 0 ? "Debit" : "Credit"}
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">{transaction.description}</p>
          <p className="text-xl font-bold text-gray-900">
            {transaction.debit_amount > 0 
              ? `-₹${transaction.debit_amount.toLocaleString()}` 
              : `+₹${transaction.credit_amount?.toLocaleString()}`}
          </p>
        </div>
        <div className="text-sm text-gray-600">
          <p>Mode: {transaction.mode || '-'}</p>
          <p>Bank: {transaction.name || '-'}</p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Suggested Category:</span>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {transaction['ai.Category'] || 'No suggestion'}
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Subcategory:</span>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                {transaction.subcategory || 'Add subcategory'}
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between bg-white border-t border-gray-200 rounded-b-xl">
        <Button 
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="text-gray-700 hover:bg-gray-100 border-gray-200"
          disabled={isProcessing}
        >
          <Edit3 className="mr-2 h-5 w-5" />
          Edit
        </Button>
        <Button 
          onClick={handleAcceptCategory}
          className="bg-[#326DEC] hover:bg-[#2A5BCB] text-white"
          disabled={isProcessing}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
}
