import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/db/drizzle';
import { chat } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '~/lib/auth';

//GET ALL CHATS   CREATE NEW CHAT

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
        .from(chat)
        .where(eq(chat.userId, userId))
        .orderBy(chat.createdAt);

    return new Response(JSON.stringify(chats), { status: 200 });
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const [newChat] = await db
            .insert(chat)
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