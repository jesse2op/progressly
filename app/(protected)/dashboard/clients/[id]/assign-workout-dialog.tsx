'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { assignWorkout } from '@/app/lib/actions/workout';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFormStatus } from 'react-dom';

interface Workout {
    id: string;
    title: string;
}

export function AssignWorkoutDialog({ clientId, workouts: initialWorkouts }: { clientId: string; workouts: Workout[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch] = useActionState(assignWorkout, undefined);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Workout[]>(initialWorkouts);

    const fetchWorkouts = async (q: string) => {
        setQuery(q);
        if (!q) {
            setSuggestions(initialWorkouts);
            return;
        }
        try {
            const res = await fetch(`/api/workouts/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSuggestions(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-black uppercase tracking-widest h-10 px-6 transition-all">
                    Assign Workout
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[32px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                <DialogHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                    <DialogTitle className="text-2xl font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight">Assign Workout</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-zinc-400 font-medium">
                        Select a workout template and date to assign to this client.
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                    await dispatch(formData);
                    setOpen(false);
                }} className="grid gap-4 py-4">
                    <input type="hidden" name="clientId" value={clientId} />

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="workout" className="text-right">
                            Workout
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="workout"
                                placeholder="Search workouts..."
                                value={query}
                                onChange={(e) => fetchWorkouts(e.target.value)}
                                list="workout-suggestions"
                                autoComplete="off"
                                required
                            />
                            <datalist id="workout-suggestions">
                                {suggestions.map((workout) => (
                                    <option key={workout.id} value={workout.title}>
                                        {workout.title}
                                    </option>
                                ))}
                            </datalist>
                            {/* Hidden input to pass the actual ID if needed, 
                                but the action currently expects workoutId. 
                                Wait, datalist only provides the value.
                                I'll need to find the ID from the title on submit or 
                                use a more complex autocomplete.
                            */}
                            <input
                                type="hidden"
                                name="workoutId"
                                value={suggestions.find(s => s.title === query)?.id || ''}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            className="col-span-3"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-[0.98]">
            {pending ? 'Assigning...' : 'Assign Workout'}
        </Button>
    );
}
