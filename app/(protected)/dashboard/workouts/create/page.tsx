'use client';

import { useActionState, useState } from 'react';
import { createWorkout } from '@/app/lib/actions/workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormStatus } from 'react-dom';
import { Plus, Trash2, Search, ArrowLeft, Dumbbell } from 'lucide-react';
import Link from 'next/link';

interface Exercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    weight: string;
}

export default function CreateWorkoutPage() {
    const [errorMessage, dispatch] = useActionState(createWorkout, undefined);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exerciseSuggestions, setExerciseSuggestions] = useState<string[]>([]);
    const [titleSuggestions, setTitleSuggestions] = useState<any[]>([]);
    const [activeExerciseSearch, setActiveExerciseSearch] = useState<string | null>(null);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

    const fetchExerciseSuggestions = async (q: string) => {
        if (!q) {
            setExerciseSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setExerciseSuggestions(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchTitleSuggestions = async (q: string) => {
        if (!q) {
            setTitleSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`/api/workouts/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setTitleSuggestions(data);
        } catch (e) {
            console.error(e);
        }
    };

    const addExercise = () => {
        setExercises([
            ...exercises,
            { id: crypto.randomUUID(), name: '', sets: '', reps: '', weight: '' }
        ]);
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(e => e.id !== id));
    };

    const updateExercise = (id: string, field: keyof Exercise, value: string) => {
        setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
        if (field === 'name') {
            fetchExerciseSuggestions(value);
            setActiveExerciseSearch(id);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/dashboard/workouts">
                <Button variant="ghost" className="rounded-xl text-gray-500 dark:text-zinc-400">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
                </Button>
            </Link>

            <Card className="rounded-3xl border-zinc-200 shadow-xl overflow-hidden border-t-4 border-t-blue-600">
                <CardHeader className="pb-4">
                    <CardTitle className="text-3xl font-black text-gray-900 dark:text-zinc-100">Workout Builder</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-zinc-400 font-medium italic">
                        "The only bad workout is the one that didn't happen."
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-2 relative">
                            <Label htmlFor="title" className="text-sm font-bold text-gray-400 uppercase tracking-widest">Workout Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Upper Body Power"
                                required
                                onChange={(e) => {
                                    fetchTitleSuggestions(e.target.value);
                                    setShowTitleSuggestions(true);
                                }}
                                onFocus={() => setShowTitleSuggestions(true)}
                                className="h-12 rounded-xl border-zinc-200 focus-visible:ring-blue-600 font-bold"
                            />
                            {showTitleSuggestions && titleSuggestions.length > 0 && (
                                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-zinc-100 rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto">
                                    {titleSuggestions.map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => {
                                                const input = document.getElementById('title') as HTMLInputElement;
                                                if (input) input.value = t.title;
                                                setShowTitleSuggestions(false);
                                            }}
                                            className="p-3 hover:bg-blue-50 rounded-xl cursor-pointer font-medium text-gray-900 dark:text-zinc-100 transition-colors"
                                        >
                                            {t.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description (Optional)</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Brief description of the workout goal"
                                className="h-12 rounded-xl border-zinc-200 text-sm"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-black text-gray-900 dark:text-zinc-100">Exercises</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 font-bold">
                                    <Plus className="h-4 w-4 mr-2" /> Add Exercise
                                </Button>
                            </div>

                            {exercises.length === 0 && (
                                <div className="text-center py-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100">
                                    <Dumbbell className="mx-auto h-8 w-8 text-zinc-200 mb-2" />
                                    <p className="text-sm text-gray-400 font-medium">No exercises added yet.</p>
                                </div>
                            )}

                            {exercises.map((exercise, index) => (
                                <div key={exercise.id} className="relative grid grid-cols-12 gap-3 items-end p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm animate-in zoom-in-95 duration-200">
                                    <div className="col-span-12 md:col-span-4 relative">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Exercise Name</Label>
                                        <Input
                                            value={exercise.name}
                                            onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                                            onFocus={() => setActiveExerciseSearch(exercise.id)}
                                            placeholder="Bench Press"
                                            className="h-10 rounded-xl border-zinc-100 font-bold text-sm"
                                            autoComplete="off"
                                        />
                                        {activeExerciseSearch === exercise.id && exerciseSuggestions.length > 0 && (
                                            <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-zinc-100 rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto">
                                                {exerciseSuggestions.map((s) => (
                                                    <div
                                                        key={s}
                                                        onClick={() => {
                                                            updateExercise(exercise.id, 'name', s);
                                                            setExerciseSuggestions([]);
                                                            setActiveExerciseSearch(null);
                                                        }}
                                                        className="p-2.5 hover:bg-blue-50 rounded-xl cursor-pointer text-sm font-bold text-gray-900 transition-colors"
                                                    >
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block text-center">Sets</Label>
                                        <Input
                                            value={exercise.sets}
                                            onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                                            placeholder="3"
                                            className="h-10 rounded-xl border-zinc-100 text-center font-black"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block text-center">Reps</Label>
                                        <Input
                                            value={exercise.reps}
                                            onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                                            placeholder="10"
                                            className="h-10 rounded-xl border-zinc-100 text-center font-black"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-3">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Weight (lbs/kg)</Label>
                                        <Input
                                            value={exercise.weight}
                                            onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                                            placeholder="135"
                                            className="h-10 rounded-xl border-zinc-100 font-bold"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-1 flex justify-center pb-2">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)} className="h-10 w-10 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hidden input to pass exercises JSON */}
                        <input type="hidden" name="exercises" value={JSON.stringify(exercises)} />

                        {errorMessage && (
                            <div className="text-red-500 text-sm">{errorMessage}</div>
                        )}

                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
        >
            {pending ? 'Saving Workout Template...' : 'Save Workout Template'}
        </Button>
    );
}
