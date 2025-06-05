"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Save, X, ArrowRight, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, apiFetch } from "@/config/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryRule {
  ruleId: number;
  row_number: number;
  mode: string | null;
  name: string | null;
  amount_min: string | null;
  amount_max: string | null;
  category: string | null;
  subcategory: string | null;
  Categories: string | null;
}

type SortField = keyof CategoryRule;
type SortDirection = 'asc' | 'desc';

export function CategoryRulesManager() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('ruleId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  const fetchRules = async () => {
    try {
      const response = await apiFetch(API_ENDPOINTS.GET_CATEGORY_RULES);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category rules. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await apiFetch(API_ENDPOINTS.SAVE_CATEGORY_RULES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rules),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Category rules saved successfully.",
      });
    } catch (error) {
      console.error('Error saving rules:', error);
      toast({
        title: "Error",
        description: "Failed to save category rules. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const addNewRule = () => {
    const lastRuleId = rules.length > 0 ? Math.max(...rules.map(rule => rule.ruleId)) : 0;
    const newRule: CategoryRule = {
      ruleId: lastRuleId + 1,
      row_number: rules.length + 1,
      mode: null,
      name: null,
      amount_min: null,
      amount_max: null,
      category: null,
      subcategory: null,
      Categories: null,
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, field: keyof CategoryRule, value: string | number) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ruleId: updatedRules[index].ruleId,
      row_number: updatedRules[index].row_number,
      mode: null,
      name: null,
      amount_min: null,
      amount_max: null,
      category: null,
      subcategory: null,
      Categories: null,
    };
    setRules(updatedRules);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRules = [...rules].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  const columns: { key: keyof CategoryRule; label: string }[] = [
    { key: 'ruleId', label: 'Rule ID' },
    { key: 'mode', label: 'Mode' },
    { key: 'name', label: 'Name' },
    { key: 'amount_min', label: 'Min Amount' },
    { key: 'amount_max', label: 'Max Amount' },
    { key: 'category', label: 'Category' },
    { key: 'subcategory', label: 'Subcategory' },
    { key: 'Categories', label: 'Categories' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-14 px-6 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 text-slate-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] hover:bg-gray-800/50"
        >
          <Plus className="mr-2 h-5 w-5 text-[#7B61FF]" />
          Edit Categories
          <ArrowRight className="ml-2 h-5 w-5 text-[#7B61FF]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto bg-[#1A1D24] border-gray-700/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] bg-clip-text text-transparent">
            Manage Category Rules
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800/50">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-200 border-b border-gray-700/30 cursor-pointer hover:bg-gray-700/30"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200 border-b border-gray-700/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRules.map((rule, index) => (
                  <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-800/30">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Input
                                  value={rule[column.key] ?? ""}
                                  onChange={(e) => updateRule(index, column.key, e.target.value)}
                                  className="bg-gray-800/50 border-gray-700/50 text-slate-200 placeholder:text-gray-500 focus:border-[#7B61FF]/50 focus:ring-[#7B61FF]/20 pr-8"
                                />
                                {rule[column.key] && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                    <ArrowRight className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-[300px] break-words bg-gray-800 text-slate-200 border border-gray-700"
                            >
                              <p>{rule[column.key] || 'Empty'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(index)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <Button 
              onClick={addNewRule} 
              className="h-14 px-6 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 text-slate-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] hover:bg-gray-800/50"
            >
              <Plus className="mr-2 h-5 w-5 text-[#7B61FF]" />
              Add Rule
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading} 
              className="h-14 px-6 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#00C9FF] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[#7B61FF]/20"
            >
              <Save className="mr-2 h-5 w-5" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 