'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Utensils, Save, CheckCircle2 } from 'lucide-react';
import { toggleMealCompletion, updateDailyMealLog } from '@/app/lib/actions/nutrition';

interface FoodEntry {
    name: string;
    amount: number;
    unit: string;
    calories: number;
}

interface Meal {
    name: string;
    foods: FoodEntry[];
}

interface MealLogCardProps {
    assignmentId: string;
    initialCompleted: string[];
    initialLog: string;
    planTitle: string;
    planMeals: Meal[];
}

export default function MealLogCard({
    assignmentId,
    initialCompleted,
    initialLog,
    planTitle,
    planMeals
}: MealLogCardProps) {
    const [completed, setCompleted] = useState<string[]>(initialCompleted);
    const [log, setLog] = useState(initialLog);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (mealName: string) => {
        // Optimistic update
        const newCompleted = completed.includes(mealName)
            ? completed.filter(m => m !== mealName)
            : [...completed, mealName];
        setCompleted(newCompleted);

        await toggleMealCompletion(assignmentId, mealName);
    };

    const handleSaveLog = async () => {
        setIsSaving(true);
        await updateDailyMealLog(assignmentId, log);
        setIsSaving(false);
    };

    const totalCals = planMeals.reduce((acc, meal) => {
        return acc + meal.foods.reduce((sum, food) => sum + food.calories, 0);
    }, 0);

    return (
        <Card className="rounded-[32px] border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl dark:shadow-none bg-white dark:bg-zinc-900/50 flex flex-col h-full border-t-4 border-t-orange-500">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-2.5 rounded-xl">
                            <Utensils className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <CardTitle className="text-xl font-black text-gray-900 dark:text-zinc-100 leading-tight">
                            {planTitle || "Daily Nutrition"}
                        </CardTitle>
                    </div>
                    <div className="bg-zinc-900 dark:bg-zinc-800 px-3 py-1.5 rounded-full text-white dark:text-zinc-100 text-[10px] font-black uppercase tracking-widest">
                        {Math.round(totalCals)} kcal
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6 flex-1">
                {planMeals.length > 0 ? (
                    <div className="space-y-4">
                        {planMeals.map((meal) => {
                            const isDone = completed.includes(meal.name);
                            return (
                                <div
                                    key={meal.name}
                                    className={`p-5 rounded-2xl border transition-all duration-300 ${isDone ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={`meal-${meal.name}`}
                                                checked={isDone}
                                                onCheckedChange={() => handleToggle(meal.name)}
                                                className="h-5 w-5 rounded-md border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                                            />
                                            <label
                                                htmlFor={`meal-${meal.name}`}
                                                className={`text-sm font-black uppercase tracking-wider cursor-pointer transition-colors ${isDone ? 'text-green-800 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'
                                                    }`}
                                            >
                                                {meal.name}
                                            </label>
                                        </div>
                                        {isDone && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />}
                                    </div>
                                    <div className="space-y-1 pl-8">
                                        {meal.foods.map((food, i) => (
                                            <div key={i} className="flex justify-between text-xs font-medium text-gray-500 dark:text-zinc-500">
                                                <span>{food.name}</span>
                                                <span className="text-gray-400 dark:text-zinc-600">{food.amount}{food.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-dashed border-orange-100 dark:border-orange-900/30">
                        <p className="text-sm font-bold text-orange-800/60 dark:text-orange-400/60 italic">No prescribed meals for today.</p>
                    </div>
                )}

                <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Personal Food Log</label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveLog}
                            disabled={isSaving}
                            className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition-all"
                        >
                            {isSaving ? "Saving..." : <><Save className="mr-1 h-3 w-3" /> Save Log</>}
                        </Button>
                    </div>
                    <Textarea
                        value={log}
                        onChange={(e) => setLog(e.target.value)}
                        placeholder="Logged anything else today? Extra snacks, water intake, etc."
                        className="min-h-[100px] rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm focus-visible:ring-1 focus-visible:ring-orange-500 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
