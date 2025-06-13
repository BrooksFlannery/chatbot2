'use server'

import { auth } from '~/lib/auth';

export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            }

        })

        return {
            success: true,
            message: "Succesful Sign In"
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            message: { error: e.message || "An unknown error occured" }
        }
    }
}

export const signUp = async (email: string, password: string, name: string) => {
    await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        }
    })
}