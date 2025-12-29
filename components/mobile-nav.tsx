'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SidebarContent } from './sidebar-content';
import { useState } from 'react';
import { DialogDescription } from '@radix-ui/react-dialog';

interface MobileNavProps {
    role: string;
    userName: string;
}

export function MobileNav({ role, userName }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
                <DialogDescription className="sr-only">Mobile Navigation Menu</DialogDescription>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent
                    role={role}
                    userName={userName}
                    onLinkClick={() => setOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
