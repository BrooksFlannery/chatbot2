"use client";

import { useRouter } from "next/navigation"; // Fixed: use next/navigation for app router
import { useEffect, useState } from "react";
import { clientBotAPI } from "~/lib/api";
import type { ChatData } from "~/lib/definitions/types";

export function SideBar() {
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

    if (loading) {
        return <div>Loading Chats...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!chats || chats.length === 0) {
        return <div>No chats yet</div>;
    }

    return (
        <ul>
            {chats.map((chat) => (
                <div
                    className="chats cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => router.push(`/chat/${chat.id}`)}
                    key={chat.id}
                >
                    {chat.chatName}
                </div>
            ))}
        </ul>
    );
}