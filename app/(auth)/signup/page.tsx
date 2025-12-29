'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signup } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function SignupPage() {
    const [errorMessage, dispatch] = useActionState(signup, undefined);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 transition-colors duration-300 py-12">
            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl dark:shadow-none rounded-[32px] overflow-hidden">
                <CardHeader className="relative">
                    <Link href="/" className="absolute left-4 top-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Home className="h-4 w-4" />
                        </Button>
                    </Link>
                    <CardTitle className="text-2xl font-bold text-center dark:text-zinc-100">Create an Account</CardTitle>
                    <CardDescription className="text-center dark:text-zinc-400">
                        Get started with Progressly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required minLength={6} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">I am a...</Label>
                            <select
                                id="role"
                                name="role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="CLIENT">Client</option>
                                <option value="COACH">Coach</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Link href="/login" className="text-sm text-blue-600 hover:underline">
                                Already have an account? Login
                            </Link>
                        </div>
                        {errorMessage && (
                            <div className="text-red-500 text-sm">{errorMessage}</div>
                        )}
                        <SignupButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Creating Account...' : 'Sign Up'}
        </Button>
    );
}
