"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, X, ArrowRight } from "lucide-react";

interface CategoryRule {
  ruleId: number;
  row_number: number;
  mode: string;
  name: string;
  amount_min: string;
  amount_max: string;
  category: string;
  subcategory: string;
  Categories: string;
}

export function CategoryRulesManager() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5698/webhook-test/getCat');
      const data = await response.json();
      console.log('Fetched rules data:', data);
      setRules(data);
    } catch (error) {
      console.error('Error fetching category rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      console.log('Saving rules:', rules);
      const response = await fetch('http://localhost:5698/webhook-test/saveCat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rules),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Save response:', responseData);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error saving category rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewRule = () => {
    const lastRuleId = rules.length > 0 ? Math.max(...rules.map(rule => rule.ruleId)) : 0;
    console.log('Current rules:', rules);
    console.log('Last ruleId:', lastRuleId);
    const newRule: CategoryRule = {
      ruleId: lastRuleId + 1,
      row_number: rules.length + 1,
      mode: "",
      name: "",
      amount_min: "",
      amount_max: "",
      category: "",
      subcategory: "",
      Categories: "",
    };
    console.log('New rule:', newRule);
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, field: keyof CategoryRule, value: string | number) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-14 px-6 rounded-xl bg-gradient-to-r from-[#e0aaff] to-[#b88cff] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02]"
        >
          <Plus className="mr-2 h-5 w-5" />
          Edit Categories
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Category Rules</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 p-4 border rounded-lg bg-gray-800/40 backdrop-blur-sm">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-400">Rule ID:</span>
                  <span className="text-sm font-semibold text-slate-200">{rule.ruleId}</span>
                </div>
                <Input
                  placeholder="Mode"
                  value={rule.mode}
                  onChange={(e) => updateRule(index, 'mode', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Name"
                  value={rule.name}
                  onChange={(e) => updateRule(index, 'name', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Min Amount"
                  value={rule.amount_min}
                  onChange={(e) => updateRule(index, 'amount_min', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Max Amount"
                  value={rule.amount_max}
                  onChange={(e) => updateRule(index, 'amount_max', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Category"
                  value={rule.category}
                  onChange={(e) => updateRule(index, 'category', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Subcategory"
                  value={rule.subcategory}
                  onChange={(e) => updateRule(index, 'subcategory', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
                <Input
                  placeholder="Categories"
                  value={rule.Categories}
                  onChange={(e) => updateRule(index, 'Categories', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-slate-200 placeholder:text-gray-400"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRule(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-between">
            <Button 
              onClick={addNewRule} 
              className="h-14 px-6 rounded-xl bg-gradient-to-r from-[#e0aaff] to-[#b88cff] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Rule
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading} 
              className="h-14 px-6 rounded-xl bg-gradient-to-r from-[#e0aaff] to-[#b88cff] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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