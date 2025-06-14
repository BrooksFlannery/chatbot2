// 'use client';

// import { useParams } from 'next/navigation';
// import { useEffect, useState, type ReactElement } from 'react';
// import type { ChatData, MsgData } from '~/lib/definitions/types';
// import { clientBotAPI } from '~/lib/api';

// export default function Chat() {
//     const api = new clientBotAPI();

//     const { id: chatId } = useParams();
//     const [thinking, setThinking] = useState<boolean>(false);
//     const [responding, setResponding] = useState<boolean>(false);
//     const [chat, setChat] = useState<ChatData | null>(null)

//     const [input, setInput] = useState('');
//     const [messages, setMsgs] = useState<MsgData[]>([]);

//     useEffect(() => {
//         if (!chatId || typeof chatId !== "string") return;//redirect here would be good

//         api.getChat(chatId).then(setChat)
//         api.getMsgs(chatId).then(setMsgs);//also maybe this is a good spot for the no waterfall thing?
//     }, [chatId]);

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const newUserMsg = {
//             id: 'temp-user',
//             role: 'user',
//             content: input,
//         };
//         setMsgs(prev => [...(prev), newUserMsg]);
//         setResponding(true);

//         try {
//             await api.postMsg(
//                 input,
//                 Number(chatId),
//                 setMsgs,
//                 setThinking,
//                 setResponding,
//             );
//         } catch (error) {
//             console.error('Failed to send message:', error);
//         } finally {
//             setResponding(false);
//             setInput('');
//         }
//     };


//     return (
//         <div className='chat-container'>

//             {!chat &&
//                 <div>Loading Chat Info...</div>}
//             {chat &&
//                 <div>{JSON.stringify(chat.chatName)}</div>}

//             {!messages &&
//                 <div>Loading Messages...</div>}
//             {messages && messages.map((message, i) => {
//                 return (
//                     <div
//                         key={i}
//                         className={`message ${message.role === 'user' ? 'user' : 'bot'}`}
//                     >
//                         {message.role === 'user' ? '' : 'AI: '}
//                         {message.content}
//                         {message.role === 'user' ? ': User' : ''}

//                     </div>

//                 );
//             })}

//             {thinking && (
//                 <div className="whitespace-pre-wrap">
//                     AI: <span className="animate-pulse">Thinking...</span>
//                 </div>
//             )}

//             <form className="input-form" onSubmit={handleSubmit}>
//                 <input
//                     value={input}
//                     placeholder="Say something..."
//                     onChange={(e) => { setInput(e.target.value) }}
//                     disabled={responding}
//                     autoFocus
//                 />
//                 <button type="submit" disabled={responding || !chat}>
//                     {/* remember to disable on !input */}
//                     Send
//                 </button>
//             </form>
//         </div>
//     );
// }
