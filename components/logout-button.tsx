'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: '/login' })}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}
