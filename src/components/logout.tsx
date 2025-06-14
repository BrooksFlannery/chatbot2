'use client'

import { authClient } from "~/lib/auth-client";
import { Button } from "./ui/button";
import { LogOut } from 'lucide-react'
import { redirect, useRouter } from "next/navigation";
import { useSidebar } from "./ui/sidebar";


export function Logout() {
    const { setOpen } = useSidebar();
    const handleLogout = async () => {
        setOpen(false)
        await authClient.signOut();
        redirect('/')
    };

    return (
        <Button variant='outline' onClick={handleLogout}>
            Logout <LogOut className='size-4' />
        </Button>
    )
}