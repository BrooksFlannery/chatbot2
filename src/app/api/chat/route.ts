import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '~/db/drizzle';
import { chat } from '~/db/schema';
import { auth } from '~/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    console.log('Fetching chats...');
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const chats = await db
            .select()
            .from(chat)
            .where(eq(chat.userId, userId))
            .orderBy(chat.createdAt);

        return NextResponse.json(chats, { status: 200 });
    } catch (error) {
        console.error('Error in /api/chat GET:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const [newChat] = await db
            .insert(chat)
            .values({
                userId: userId,
            })
            .returning({ id: chat.id });

        if (!newChat) {
            return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
        }

        return NextResponse.json({ id: newChat.id });
    } catch (error) {
        console.error('Error in /api/chat POST:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}