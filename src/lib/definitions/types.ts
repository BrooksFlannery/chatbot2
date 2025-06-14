import { z } from 'zod';
import { chatSchema, userSchema, messageSchema, sessionSchema } from './zod';

export type UserData = z.infer<typeof userSchema>

export type ChatData = z.infer<typeof chatSchema>

export type MsgData = z.infer<typeof messageSchema>

export type SessionData = z.infer<typeof sessionSchema>