import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/db/drizzle';
import { message } from '~/db/schema'; // Make sure this matches your schema export
import { randomUUID } from 'crypto';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;
        const { content } = await request.json();

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(chatId)) {
            return NextResponse.json({ error: 'Invalid chat ID format' }, { status: 400 });
        }

        const [savedMessage] = await db.insert(message).values({
            id: randomUUID(),
            chatId: chatId,
            content: content,
            role: 'assistant',
            createdAt: new Date(),
            accessedAt: new Date()
        }).returning();

        return NextResponse.json(savedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}