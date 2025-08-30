// app/api/chat/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/db/drizzle';
import { chat } from '~/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';


//GET SPECIFIC CHAT

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const chatId = id;

        if (!chatId || typeof chatId !== 'string') {
            return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
        }

        const [chatData] = await db
            .select()
            .from(chat)
            .where(and(
                eq(chat.id, chatId),
                eq(chat.userId, userId)
            ));

        if (!chatData) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json(chatData);
    } catch (error) {
        console.error('Error in /api/chat/[id] GET:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}