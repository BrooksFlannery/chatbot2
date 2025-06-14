// app/api/chat/[id]/messages/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { db } from '~/db/drizzle'; // Fixed: match your import path
import { message } from '~/db/schema'; // Fixed: match your schema name
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { auth } from '~/lib/auth'; // Add auth

//POST MESSAGE    GET MESSAGES

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Add authentication
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { id } = await params;
        const chatId = id; // Keep as string since it's a UUID

        if (!chatId || typeof chatId !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
        }

        const body = await req.json();
        const messageContent = body.msg; // Fixed: don't stringify here

        if (!messageContent || typeof messageContent !== 'string') {
            return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
        }

        // Insert user message - match your exact schema field names
        await db.insert(message).values({
            chatId: chatId, // This should match your schema exactly
            content: messageContent,
            role: 'user'
        });

        // Get all messages for context
        const messages = await db
            .select()
            .from(message)
            .where(eq(message.chatId, chatId))
            .orderBy(message.createdAt);

        const mappedMsgs = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        })) as CoreMessage[];

        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: "You are a helpful assistant, but the longer the conversation goes, the more rude you become.",
            messages: mappedMsgs,
        });

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
        // Add authentication
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { id } = await params;
        const chatId = id; // Keep as string since it's a UUID

        if (!chatId || typeof chatId !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
        }

        const messages = await db
            .select()
            .from(message)
            .where(eq(message.chatId, chatId))
            .orderBy(message.createdAt);

        // Return in the format your frontend expects (MsgData[])
        const formatted = messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            chatId: msg.chatId,
            accessedAt: msg.accessedAt || msg.createdAt, // Add accessedAt if your schema has it
        }));

        return Response.json(formatted);
    } catch (error) {
        console.error('Error in GET /api/chat/[id]/messages:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}