'use client';

import { useActionState, useState, useEffect } from 'react';
import { createMealPlan } from '@/app/lib/actions/meal-plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Search, ArrowLeft, Fuel, Info } from 'lucide-react';
import Link from 'next/link';

interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    unit: string;
}

interface FoodEntry {
    id: string;
    name: string;
    amount: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    unit: string;
    baseMacros?: FoodItem;
}

interface Meal {
    id: string;
    name: string;
    foods: FoodEntry[];
}

export default function CreateMealPlanPage() {
    const [errorMessage, dispatch] = useActionState(createMealPlan, undefined);
    const [title, setTitle] = useState('');
    const [meals, setMeals] = useState<Meal[]>([
        { id: '1', name: 'Breakfast', foods: [] }
    ]);
    const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
    const [activeSearch, setActiveSearch] = useState<{ mealId: string, foodId: string } | null>(null);

    const addMeal = () => {
        const names = ['Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Pre-Workout'];
        const nextName = names[meals.length - 1] || `Meal ${meals.length + 1}`;
        setMeals([...meals, { id: crypto.randomUUID(), name: nextName, foods: [] }]);
    };

    const removeMeal = (id: string) => {
        setMeals(meals.filter(m => m.id !== id));
    };

    const addFood = (mealId: string) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: [...m.foods, { id: crypto.randomUUID(), name: '', amount: 100, calories: 0, protein: 0, carbs: 0, fat: 0, unit: 'gms' }]
        } : m));
    };

    const removeFood = (mealId: string, foodId: string) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: m.foods.filter(f => f.id !== foodId)
        } : m));
    };

    const searchFood = async (q: string) => {
        if (!q) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSuggestions(data);
        } catch (e) {
            console.error(e);
        }
    };

    const calculateMacros = (food: FoodItem, amount: number) => {
        const factor = food.unit.includes('100') ? amount / 100 : amount;
        return {
            calories: Math.round(food.calories * factor),
            protein: Math.round(food.protein * factor * 10) / 10,
            carbs: Math.round(food.carbs * factor * 10) / 10,
            fat: Math.round(food.fat * factor * 10) / 10,
        };
    };

    const selectFood = (mealId: string, foodId: string, food: FoodItem) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: m.foods.map(f => {
                if (f.id === foodId) {
                    const defaultAmount = food.unit.includes('100') ? 100 : 1;
                    const macros = calculateMacros(food, defaultAmount);
                    return {
                        ...f,
                        name: food.name,
                        baseMacros: food,
                        amount: defaultAmount,
                        unit: food.unit.replace('100', ''),
                        ...macros
                    };
                }
                return f;
            })
        } : m));
        setSuggestions([]);
        setActiveSearch(null);
    };

    const updateAmount = (mealId: string, foodId: string, amount: number) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: m.foods.map(f => {
                if (f.id === foodId) {
                    const macros = f.baseMacros ? calculateMacros(f.baseMacros, amount) : {
                        calories: f.calories,
                        protein: f.protein,
                        carbs: f.carbs,
                        fat: f.fat
                    };
                    return { ...f, amount, ...macros };
                }
                return f;
            })
        } : m));
    };

    const updateFoodNameManual = (mealId: string, foodId: string, name: string) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: m.foods.map(f => f.id === foodId ? { ...f, name } : f)
        } : m));
        searchFood(name);
        setActiveSearch({ mealId, foodId });
    };

    const updateCalories = (mealId: string, foodId: string, calories: number) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: m.foods.map(f => f.id === foodId ? { ...f, calories } : f)
        } : m));
    };

    const updateMacro = (mealId: string, foodId: string, field: 'protein' | 'carbs' | 'fat', value: number) => {
        setMeals(meals.map(m => m.id === mealId ? {
            ...m,
            foods: m.foods.map(f => f.id === foodId ? { ...f, [field]: value } : f)
        } : m));
    };

    // Totals
    const totals = meals.reduce((acc, meal) => {
        meal.foods.forEach(f => {
            acc.calories += f.calories;
            acc.protein += f.protein;
            acc.carbs += f.carbs;
            acc.fat += f.fat;
        });
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <Link href="/dashboard/meal-plans">
                    <Button variant="ghost" className="rounded-xl text-gray-500 dark:text-zinc-400">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </Link>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-sm">
                    <Fuel className="h-5 w-5 text-orange-500" />
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>Cals: <span className="text-gray-900 dark:text-zinc-100">{Math.round(totals.calories)}</span></span>
                        <span>P: <span className="text-blue-600">{Math.round(totals.protein)}g</span></span>
                        <span>C: <span className="text-orange-600">{Math.round(totals.carbs)}g</span></span>
                        <span>F: <span className="text-red-600">{Math.round(totals.fat)}g</span></span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Smart Meal Plan Builder</h1>
                <p className="text-gray-500 dark:text-zinc-400">Add meals, search for foods, and track macros in real-time.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-3xl border-zinc-200 shadow-xl overflow-hidden border-t-4 border-t-orange-500">
                        <CardHeader className="pb-4">
                            <Label htmlFor="title" className="text-sm font-bold text-gray-400 uppercase tracking-widest">Plan Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Lean Muscle Gains"
                                className="text-2xl font-black h-14 rounded-2xl border-none focus-visible:ring-0 px-0 placeholder:text-gray-200"
                            />
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {meals.map((meal) => (
                                <div key={meal.id} className="space-y-4 p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-xl">
                                                <Fuel className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <Input
                                                value={meal.name}
                                                onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, name: e.target.value } : m))}
                                                className="border-none bg-transparent font-bold text-lg focus-visible:ring-0 p-0 w-32"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMeal(meal.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {meal.foods.map((food) => (
                                            <div key={food.id} className="relative grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-2xl shadow-sm border border-zinc-100 group/food">
                                                <div className="col-span-12 md:col-span-5 relative">
                                                    <Input
                                                        value={food.name}
                                                        onChange={(e) => updateFoodNameManual(meal.id, food.id, e.target.value)}
                                                        onFocus={() => setActiveSearch({ mealId: meal.id, foodId: food.id })}
                                                        placeholder="Search food (e.g. Chicken)..."
                                                        className="h-10 rounded-xl border-zinc-100 text-sm font-medium pr-10"
                                                    />
                                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />

                                                    {activeSearch?.foodId === food.id && suggestions.length > 0 && (
                                                        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-zinc-100 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto">
                                                            {suggestions.map((s) => (
                                                                <div
                                                                    key={s.name}
                                                                    onClick={() => selectFood(meal.id, food.id, s)}
                                                                    className="flex flex-col p-2.5 hover:bg-orange-50 rounded-xl cursor-pointer group/item transition-colors"
                                                                >
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{s.name}</span>
                                                                    <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                                        <span>P: {s.protein}g</span>
                                                                        <span>C: {s.carbs}g</span>
                                                                        <span>F: {s.fat}g</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={food.amount}
                                                        onChange={(e) => updateAmount(meal.id, food.id, Number(e.target.value))}
                                                        className="h-10 rounded-xl border-zinc-100 text-sm font-bold w-20"
                                                    />
                                                    <span className="text-xs font-bold text-gray-400 capitalize">{food.unit}</span>
                                                </div>

                                                <div className="col-span-4 md:col-span-3">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-1 group/cal">
                                                            <Input
                                                                type="number"
                                                                value={food.calories}
                                                                onChange={(e) => updateCalories(meal.id, food.id, Number(e.target.value))}
                                                                className="h-7 w-16 text-right px-1 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-orange-500 font-black text-gray-900 dark:text-zinc-100 text-sm p-0"
                                                            />
                                                            <span className="text-[10px] font-medium text-gray-400">kcal</span>
                                                        </div>
                                                        <div className="flex gap-2 text-[9px] font-black text-orange-600/70 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span>P</span>
                                                                <input
                                                                    type="number"
                                                                    value={Math.round(food.protein)}
                                                                    onChange={(e) => updateMacro(meal.id, food.id, 'protein', Number(e.target.value))}
                                                                    className="w-8 bg-transparent border-none text-[9px] font-black text-orange-600/70 p-0 focus:outline-none"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span>C</span>
                                                                <input
                                                                    type="number"
                                                                    value={Math.round(food.carbs)}
                                                                    onChange={(e) => updateMacro(meal.id, food.id, 'carbs', Number(e.target.value))}
                                                                    className="w-8 bg-transparent border-none text-[9px] font-black text-orange-600/70 p-0 focus:outline-none"
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span>F</span>
                                                                <input
                                                                    type="number"
                                                                    value={Math.round(food.fat)}
                                                                    onChange={(e) => updateMacro(meal.id, food.id, 'fat', Number(e.target.value))}
                                                                    className="w-8 bg-transparent border-none text-[9px] font-black text-orange-600/70 p-0 focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => removeFood(meal.id, food.id)}
                                                    className="col-span-2 md:col-span-1 flex justify-center text-gray-200 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addFood(meal.id)}
                                        className="w-full mt-2 rounded-xl border-dashed border-zinc-200 text-gray-400 hover:border-orange-300 hover:text-orange-600 h-10 transition-all font-bold"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Food to {meal.name}
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="bg-zinc-50 border-t border-zinc-100 p-6 flex justify-between">
                            <Button variant="ghost" onClick={addMeal} className="rounded-xl font-bold text-gray-500 dark:text-zinc-400 hover:text-orange-600">
                                <Plus className="mr-2 h-4 w-4" /> Add Another Meal
                            </Button>

                            <form action={async () => {
                                const formData = new FormData();
                                formData.append('title', title);
                                // Formatting content for current action (could be JSON or rich text)
                                const content = JSON.stringify({
                                    meals,
                                    summary: totals
                                });
                                formData.append('content', content);
                                dispatch(formData);
                            }}>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-2xl font-bold shadow-lg shadow-orange-100">
                                    Save Plan
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <Card className="rounded-3xl border-zinc-200 shadow-xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Daily Macro Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-500 dark:text-zinc-400">Protein</span>
                                    <span className="text-xl font-black text-blue-600">{Math.round(totals.protein)}g</span>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, totals.protein)}%` }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-500 dark:text-zinc-400">Carbs</span>
                                    <span className="text-xl font-black text-orange-600">{Math.round(totals.carbs)}g</span>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="bg-orange-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, totals.carbs)}%` }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-500 dark:text-zinc-400">Fats</span>
                                    <span className="text-xl font-black text-red-600">{Math.round(totals.fat)}g</span>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="bg-red-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, totals.fat)}%` }} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100">
                                <div className="bg-zinc-900 rounded-2xl p-6 text-white dark:bg-zinc-900 mt-2">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Daily Energy</p>
                                    <h3 className="text-4xl font-black">{Math.round(totals.calories)} <span className="text-lg font-medium text-zinc-400">kcal</span></h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex gap-4">
                        <Info className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-orange-800 leading-relaxed">
                            These values are estimates. Actual nutrition may vary based on specific brands and preparation methods.
                        </p>
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-in slide-in-from-right-full">
                    {errorMessage}
                </div>
            )}
        </div>
    );
}
