import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/db/drizzle';
import { chat } from '~/db/schema'; // Fixed: Import 'chat' not 'chatTable'
import type { MsgData } from '~/lib/definitions/types'; // Fixed: type-only import
import { eq } from 'drizzle-orm';
import { auth } from '~/lib/auth'; // Import your Better Auth instance

//GET ALL CHATS   CREATE NEW CHAT

//get route next, must return array of messages. i should prob be defining message typs somewhere
export async function GET(req: NextRequest) {
    // Use Better Auth's proper session verification
    const session = await auth.api.getSession({
        headers: req.headers
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const chats = await db
        .select()
        .from(chat) // Fixed: use 'chat' table
        .where(eq(chat.userId, userId))
        .orderBy(chat.createdAt);

    return new Response(JSON.stringify(chats), { status: 200 });
}

export async function POST(req: NextRequest) {
    try {
        // Use Better Auth's proper session verification
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const [newChat] = await db
            .insert(chat) // Fixed: use 'chat' table
            .values({
                userId: userId,
            })
            .returning({ id: chat.id });

        if (!newChat) throw Error;

        return NextResponse.json({ id: newChat.id });
    } catch (error) {
        console.error('Error in /api/chat POST:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}