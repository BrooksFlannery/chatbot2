"use client";

import { Calendar, Home, Inbox, Search, Settings, MessageSquare, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clientBotAPI } from "~/lib/api";
import type { ChatData } from "~/lib/definitions/types";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";

// Navigation menu items
const navItems = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    // {
    //     title: "Inbox",
    //     url: "/inbox",
    //     icon: Inbox,
    // },
    // {
    //     title: "Calendar",
    //     url: "/calendar",
    //     icon: Calendar,
    // },
    {//implement chat search later
        title: "Search",
        url: "/search",
        icon: Search,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

export function AppSidebar() {
    const [chats, setChats] = useState<ChatData[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = new clientBotAPI();
    const router = useRouter();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setLoading(true);
                const chatData = await api.getChats();
                setChats(chatData);
            } catch (err) {
                console.error('Failed to fetch chats:', err);
                setError('Failed to load chats');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const handleNewChat = async () => {
        try {
            // Assuming your API has a createChat method
            const newId = await api.createChat();
            router.push(`/chat/${newId}`);
        } catch (err) {
            console.error('Failed to create chat:', err);
        }
    };

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center justify-between">
                        <span>Chats</span>
                        <button
                            onClick={handleNewChat}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="New Chat"
                        >
                            <Plus size={16} />
                        </button>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {loading && (
                                <SidebarMenuItem>
                                    <div className="px-2 py-1 text-sm text-gray-500">
                                        Loading chats...
                                    </div>
                                </SidebarMenuItem>
                            )}

                            {error && (
                                <SidebarMenuItem>
                                    <div className="px-2 py-1 text-sm text-red-500">
                                        Error: {error}
                                    </div>
                                </SidebarMenuItem>
                            )}

                            {!loading && !error && (!chats || chats.length === 0) && (
                                <SidebarMenuItem>
                                    <div className="px-2 py-1 text-sm text-gray-500">
                                        No chats yet
                                    </div>
                                </SidebarMenuItem>
                            )}

                            {chats && chats.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton
                                        onClick={() => router.push(`/chat/${chat.id}`)}
                                        className="w-full justify-start"
                                    >
                                        <MessageSquare size={16} />
                                        <span className="truncate">{chat.chatName}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}