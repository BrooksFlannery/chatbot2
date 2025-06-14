import type { UserData, ChatData, MsgData } from "~/lib/definitions/types";
import { chatSchema } from "~/lib/definitions/zod";

export interface chatBotAPI {
    getChats(): Promise<ChatData[]>;
    createChat(): Promise<ChatData['id']>;
    getChat(id: ChatData["id"]): Promise<ChatData>;
    getMsgs(id: ChatData["id"]): Promise<MsgData[]>;
}

export class clientBotAPI implements chatBotAPI {
    async getChats(): Promise<ChatData[]> {
        try {
            const res = await fetch("/api/chat", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch chats: ${res.status}`);
            }

            const data = await res.json() as ChatData[];
            return data;

        } catch (error) {
            console.error('Error fetching chats:', error);
            throw error;
        }
    }

    async createChat(): Promise<ChatData["id"]> {
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error(`Failed to create chat: ${res.status}`);
            }

            const data = await res.json();
            return data.id;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }

    async getChat(chatId: ChatData['id']): Promise<ChatData> {

        try {
            const res = await fetch(`/api/chat/${chatId}`);

            if (!res.ok) {
                throw new Error(`Failed to fetch chat: ${res.status}`);
            }

            const data = await res.json();

            // Debug log to see what we're getting
            console.log('Raw chat data:', data);

            // Let the schema handle the preprocessing - pass strings, not Date objects
            const mappedData = {
                id: data.id,
                userId: data.userId,
                chatName: data.chatName || "New Chat",
                createdAt: data.createdAt || new Date().toISOString(), // Pass as string
            };

            console.log('Mapped chat data:', mappedData);

            return chatSchema.parse(mappedData);
        } catch (error) {
            console.error('Chat validation error:', error);
            throw error;
        }
    }

    async getMsgs(chatId: ChatData['id']): Promise<MsgData[]> {
        try {
            const res = await fetch(`/api/chat/${chatId}/messages`);

            if (!res.ok) {
                throw new Error(`Failed to fetch messages: ${res.status}`);
            }

            const data = await res.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid response format: expected array');
            }

            return data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    async postMsg(
        msg: string,
        chatId: string, // Changed to string since your IDs are UUIDs
        setMsgs: React.Dispatch<React.SetStateAction<MsgData[]>>,
        setThinking: (value: boolean) => void,
        setResponding: (value: boolean) => void
    ): Promise<void> {
        setResponding(true);
        setThinking(true);

        try {
            const res = await fetch(`/api/chat/${chatId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ msg }),
            });

            if (!res.ok) {
                const data = await res.json();
                console.error('Failed to send message:', data);
                return;
            }

            if (!res.body) return;

            setThinking(false);
            const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
            const aiMessageId = `ai-${Date.now()}`;
            let aiMessageContent = '';
            let buffer = '';

            try {
                const newAiMessage: MsgData = {
                    id: aiMessageId,
                    role: 'assistant',
                    content: '',
                    createdAt: new Date(),
                    chatId: chatId,
                    accessedAt: new Date(),
                };
                setMsgs(prev => [...prev, newAiMessage]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += value;
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('0:')) {
                            try {
                                const content = JSON.parse(line.slice(2));
                                aiMessageContent += content;

                                setMsgs(prev =>
                                    prev.map(msg =>
                                        msg.id === aiMessageId
                                            ? { ...msg, content: aiMessageContent }
                                            : msg
                                    )
                                );
                            } catch (e) {
                                console.error('Failed to parse streaming content:', e);
                            }
                        }
                    }
                }

                // Save the AI response to database
                if (aiMessageContent.trim()) {
                    const saveResponse = await fetch(`/api/chat/${chatId}/messages/ai`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: aiMessageContent,
                        }),
                    });

                    if (saveResponse.ok) {
                        const savedMessage = await saveResponse.json();
                        setMsgs(prev =>
                            prev.map(msg =>
                                msg.id === aiMessageId
                                    ? { ...msg, id: savedMessage.id }
                                    : msg
                            )
                        );
                    } else {
                        console.error('Failed to save AI message');
                    }
                }

            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            console.error('Error in postMsg:', error);
        } finally {
            setResponding(false);
            setThinking(false);
        }
    }
}