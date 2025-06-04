"use client";

import type { Transaction, Category } from "@/types";
import { CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { CheckCircle, Edit3, Save, XCircle, RotateCcw, ArrowLeftRight, ThumbsUp, ThumbsDown } from "lucide-react";
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder={editedCategory ? "Select a subcategory" : "Select a category first"} />
              </SelectTrigger>
              <SelectContent>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSubmit}
            disabled={!editedCategory}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              editedCategory
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
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
    <div
      ref={cardRef}
      className={`relative bg-white rounded-xl shadow-lg p-6 transition-all duration-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        transform: `translateX(${dragDistance}px)`,
        touchAction: 'pan-y',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe feedback overlays */}
      {isDragging && dragDistance > 20 && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/50 to-green-500/50 backdrop-blur-sm flex items-center justify-start p-4 transition-opacity duration-100"
          style={{ opacity: swipeFeedbackOpacity }}
        >
          <ThumbsUp className="h-8 w-8 text-white" />
          <span className="ml-2 text-white font-semibold">Accept</span>
        </div>
      )}
      {isDragging && dragDistance < -20 && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-rose-500/50 backdrop-blur-sm flex items-center justify-end p-4 transition-opacity duration-100"
          style={{ opacity: swipeFeedbackOpacity }}
        >
          <span className="mr-2 text-white font-semibold">Edit</span>
          <ThumbsDown className="h-8 w-8 text-white" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {transaction.description}
          </h3>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              {transaction.mode ? `${transaction.mode} ${transaction.debit_amount > 0 ? 'To: ' : 'From: '}${transaction.name} on ` : ''}{transaction.date}
            </p>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {transaction.debit_amount > 0 ? (
                  <span className="text-red-600">-₹{transaction.debit_amount.toFixed(2)}</span>
                ) : (
                  <span className="text-green-600">+₹{transaction.credit_amount.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Suggested Category:</span>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
              >
                {transaction['ai.Category'] || 'No suggestion'}
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Subcategory:</span>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              >
                {transaction.subcategory || 'Add subcategory'}
                <Edit3 className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Edit
          </button>
          <button
            onClick={handleAcceptCategory}
            disabled={!transaction['ai.Category'] || isProcessing}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              transaction['ai.Category'] && !isProcessing
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
