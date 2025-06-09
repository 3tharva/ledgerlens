"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Save, X, ArrowRight, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, apiFetch } from "@/config/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/types";

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
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

  const getFilteredRules = () => {
    return rules.filter(rule => {
      // Filter by category
      if (selectedCategory !== "all" && rule.category !== selectedCategory) {
        return false;
      }

      // Filter by mode
      if (selectedMode !== "all" && rule.mode !== selectedMode) {
        return false;
      }

      return true;
    });
  };

  const sortedRules = [...getFilteredRules()].sort((a, b) => {
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
  ];

  // Get unique categories and modes for filters
  const uniqueCategories = Array.from(new Set(rules.map(r => r.category).filter((c): c is string => Boolean(c))));
  const uniqueModes = Array.from(new Set(rules.map(r => r.mode).filter((m): m is string => Boolean(m))));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-14 px-6 rounded-lg bg-white border border-gray-200 text-gray-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] hover:bg-gray-50"
        >
          <Plus className="mr-2 h-5 w-5 text-[#326DEC]" />
          Edit Categories
          <ArrowRight className="ml-2 h-5 w-5 text-[#326DEC]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#326DEC]">
            Manage Category Rules
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Category Rules</h2>
            <Button
              onClick={handleSave}
              className="bg-[#326DEC] hover:bg-[#2A5BCB] text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-800">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 hover:bg-gray-100">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200 max-h-[200px] overflow-y-auto"
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
                <SelectTrigger className="w-full bg-white border-gray-200 text-gray-800 hover:bg-gray-100">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border-gray-200 max-h-[200px] overflow-y-auto"
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRules.map((rule, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Input
                                  value={rule[column.key] ?? ""}
                                  onChange={(e) => updateRule(index, column.key, e.target.value)}
                                  className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-[#326DEC] focus:ring-[#326DEC]/20 pr-8"
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
                              className="max-w-[300px] break-words bg-white text-gray-800 border border-gray-200"
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
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={addNewRule}
              className="bg-[#326DEC] hover:bg-[#2A5BCB] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 