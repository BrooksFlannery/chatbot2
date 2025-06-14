// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '~/db/drizzle';
// import { chatTable, roleEnum } from '~/db/schema';
// import { MsgData } from '~/lib/definitions/types';
// import { eq } from 'drizzle-orm';
// import { getSessionCookie } from 'better-auth/cookies';



// //get route next, must return array of messages. i should prob be defining message typs somewhere
// export async function GET(req: NextRequest) {
//     const session = getSessionCookie(req);

//     if (!session) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = session.user.id;

//     const chats = await db
//         .select()
//         .from(chatTable)
//         .where(eq(chatTable.user_id, userId))
//         .orderBy(chatTable.created_at);

//     return new Response(JSON.stringify(chats), { status: 200 });
// }


// export async function POST(req: NextRequest) {
//     try {
//         const { userId } = await req.json();
//         if (!userId) {
//             return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
//         }
//         const [newChat] = await db
//             .insert(chatTable)
//             .values({
//                 user_id: userId,
//             })
//             .returning({ id: chatTable.id });

//         return NextResponse.json({ id: newChat.id });
//     } catch (error) {
//         console.error('Error in /api/chat POST:', error);
//         return NextResponse.json(
//             { error: 'Internal Server Error' },
//             { status: 500 }
//         );
//     }
// }

