import type { UserData, ChatData, MsgData } from "~/lib/definitions/types";
import { chatSchema } from "~/lib/definitions/zod";


export interface chatBotAPI {
    getChats(): Promise<ChatData[]>;
    createChat(): Promise<ChatData['id']>;
    // getChat(id: ChatData["id"]): Promise<ChatData>;
    // // deleteChat()
    // getMsgs(id: ChatData["id"]): Promise<MsgData[]>;
    // postMsg(
    //     msg: string,
    //     chatId: number,
    //     setMsgs: React.Dispatch<React.SetStateAction<any[]>>,
    //     setThinking: (value: boolean) => void,
    //     setResponding: (value: boolean) => void
    // ): Promise<void>
}


export class clientBotAPI implements chatBotAPI {
    async getChats(): Promise<ChatData[]> {
        try {

            const res = await fetch("/api/chat", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json() as ChatData[];
            return (data)

        } catch (error) {
            throw error;
        }
    }

    async createChat(): Promise<ChatData["id"]> {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        return data.id;
    }

    // async getChat(chatId: ChatData['id']): Promise<ChatData> {
    //     const res = await fetch(`/api/chat/${chatId}`);

    //     if (!res.ok) {
    //         throw new Error(`Failed to fetch chat: ${res.status}`);
    //     }

    //     const data = await res.json();

    //     const mappedData = {
    //         id: data.id,
    //         userId: data.user_id,
    //         chatName: data.chat_name,
    //         createdAt: new Date(data.created_at),
    //     };

    //     return chatSchema.parse(mappedData);
    // }

    // async getMsgs(chatId: ChatData['id']): Promise<MsgData[]> {
    //     const res = await fetch(`/api/chat/${chatId}/messages`);

    //     if (!res.ok) {
    //         throw new Error(`Failed to fetch messages: ${res.status}`);
    //     }

    //     const data = await res.json();

    //     if (!Array.isArray(data)) {
    //         throw new Error('Invalid response format: expected array');
    //     }

    //     return data;
    // }

    // async postMsg(
    //     msg: string,
    //     chatId: number,
    //     setMsgs: React.Dispatch<React.SetStateAction<any[]>>,
    //     setThinking: (value: boolean) => void,
    //     setResponding: (value: boolean) => void
    // ): Promise<void> {
    //     setResponding(true);
    //     setThinking(true);

    //     try {
    //         const res = await fetch(`/api/chat/${chatId}/messages`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ msg }),
    //         });

    //         if (!res.ok) {
    //             const data = await res.json();
    //             console.error('Failed to send message:', data);
    //             return;
    //         }

    //         if (!res.body) return;

    //         setThinking(false);
    //         const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    //         const aiMessageId = `ai-${Date.now()}`;
    //         let aiMessageContent = '';
    //         let buffer = '';

    //         try {
    //             const newAiMessage = {
    //                 id: aiMessageId,
    //                 role: 'assistant',
    //                 content: '',
    //             };
    //             setMsgs(prev => [...prev, newAiMessage]);

    //             while (true) {
    //                 const { done, value } = await reader.read();
    //                 if (done) break;

    //                 buffer += value;
    //                 const lines = buffer.split('\n');
    //                 buffer = lines.pop() || '';

    //                 for (const line of lines) {
    //                     if (line.startsWith('0:')) {
    //                         try {
    //                             const content = JSON.parse(line.slice(2));
    //                             aiMessageContent += content;

    //                             setMsgs(prev =>
    //                                 prev.map(msg =>
    //                                     msg.id === aiMessageId
    //                                         ? { ...msg, content: aiMessageContent }
    //                                         : msg
    //                                 )
    //                             );
    //                         } catch (e) {
    //                             console.error('Failed to parse streaming content:', e);
    //                         }
    //                     }
    //                 }
    //             }

    //             if (aiMessageContent.trim()) {

    //                 const saveResponse = await fetch(`/api/chat/${chatId}/messages/ai`, {
    //                     method: 'POST',
    //                     headers: { 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({
    //                         content: aiMessageContent,
    //                     }),
    //                 });

    //                 if (saveResponse.ok) {
    //                     const savedMessage = await saveResponse.json();
    //                     setMsgs(prev =>
    //                         prev.map(msg =>
    //                             msg.id === aiMessageId
    //                                 ? { ...msg, id: savedMessage.id.toString() }
    //                                 : msg
    //                         )
    //                     );
    //                 } else {
    //                     console.error('Failed to save AI message');
    //                 }
    //             }

    //         } finally {
    //             reader.releaseLock();
    //         }
    //     } catch (error) {
    //         console.error('Error in sendMsg:', error);
    //     } finally {
    //         setResponding(false);
    //         setThinking(false);
    //     }
    // }
}