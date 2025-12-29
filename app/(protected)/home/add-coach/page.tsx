'use client';

import { useActionState } from 'react';
import { linkUserByCode } from '@/app/lib/actions/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Search, Target } from 'lucide-react';

export default function AddCoachPage() {
    const [errorMessage, dispatch] = useActionState(linkUserByCode, undefined);

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div className="space-y-1">
                <Link href="/home" className="text-zinc-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4">
                    <div className="h-6 w-6 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                        <ArrowLeft className="h-3 w-3" />
                    </div>
                    Back to home
                </Link>
                <h1 className="text-4xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 tracking-tight">Connect Coach</h1>
                <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 font-medium">Link with your professional trainer to receive plans</p>
            </div>

            <Card className="rounded-[40px] border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden bg-white">
                <CardHeader className="bg-zinc-50/50 pb-8 pt-10 px-10 border-b border-zinc-100">
                    <CardTitle className="text-2xl font-black text-gray-900 dark:text-zinc-100">Find My Coach</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-zinc-400 font-medium">
                        Enter your coach's unique **Coach Code** or their **Username** to connect.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <form action={dispatch} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="identifier" className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Coach Username or Code</Label>
                                <div className="relative group">
                                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 dark:text-zinc-700 group-focus-within:text-orange-600 transition-colors" />
                                    <Input
                                        id="identifier"
                                        name="identifier"
                                        placeholder="e.g. PG-C-5X9T or mark_coach"
                                        required
                                        className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 transition-all pl-14 pr-6 text-base font-bold dark:text-zinc-100"
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider ml-1">Example: PG-C-XXXX</p>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                                {errorMessage}
                            </div>
                        )}

                        <div className="pt-4">
                            <SubmitButton />
                        </div>
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
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-16 rounded-[24px] font-black text-lg shadow-xl shadow-zinc-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                </div>
            ) : (
                'Find & Link My Coach'
            )}
        </Button>
    );
}
