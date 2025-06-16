import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/db/drizzle';
import { message } from '~/db/schema';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: chatId } = await params;
        const { content } = await request.json();


        const uuidSchema = z.string().uuid();

        try {
            uuidSchema.parse(chatId);
        } catch {
            return NextResponse.json({ error: 'Invalid chat ID format' }, { status: 400 });
        }

        const [savedMessage] = await db.insert(message).values({
            id: randomUUID(),
            chatId,
            content,
            role: 'assistant',
            createdAt: new Date(),
            accessedAt: new Date()
        }).returning();

        return NextResponse.json(savedMessage);
    } catch (error) {
        console.error('Error creating AI message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}