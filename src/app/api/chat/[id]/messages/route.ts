import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { db } from '~/db/drizzle';
import { message } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { auth } from '~/lib/auth';

//POST MESSAGE    GET MESSAGES

export async function POST(
    req: NextRequest,
    content: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { id: chatId } = (await content.params);
        const body = await req.json();
        const messageContent = body.msg;

        if (!chatId || typeof chatId !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
        }

        if (!messageContent || typeof messageContent !== 'string') {
            return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
        }

        await db.insert(message).values({
            chatId,
            content: messageContent,
            role: 'user'
        });

        const messages = await db
            .select()
            .from(message)
            .where(eq(message.chatId, chatId))
            .orderBy(message.createdAt);

        const mappedMsgs = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        })) as CoreMessage[];

        if (mappedMsgs.length === 0) {
            return new Response(JSON.stringify({ error: 'No messages found' }), { status: 400 });
        }

        let result;
        try {
            result = streamText({
                model: openai('gpt-4-turbo'),
                system: "You are a helpful assistant, but the longer the conversation goes, the more rude you become.",
                messages: mappedMsgs,
            });
        } catch (err) {
            console.error('Error creating streamText:', err);
            return new Response(JSON.stringify({ error: 'Failed to create stream' }), { status: 500 });
        }

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in POST /api/chat/[id]/messages:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { id } = await params;
        const chatId = id;

        if (!chatId || typeof chatId !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
        }

        const messages = await db
            .select()
            .from(message)
            .where(eq(message.chatId, chatId))
            .orderBy(message.createdAt);

        const formatted = messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            chatId: msg.chatId,
            accessedAt: msg.accessedAt || msg.createdAt,
        }));

        return Response.json(formatted);
    } catch (error) {
        console.error('Error in GET /api/chat/[id]/messages:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}