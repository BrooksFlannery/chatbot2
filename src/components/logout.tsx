'use client'

import { Button } from "./ui/button";
import { LogOut } from 'lucide-react'
import { redirect } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { useClerk } from "@clerk/nextjs";

export function Logout() {
    const { setOpen } = useSidebar();
    const { signOut } = useClerk();
    const handleLogout = async () => {
        setOpen(false)
        await signOut(() => redirect('/'))
    };

    return (
        <Button variant='outline' onClick={handleLogout}>
            Logout <LogOut className='size-4' />
        </Button>
    )
}