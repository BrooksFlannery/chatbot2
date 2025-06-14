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
            message: e.message || "An unknown error occured"
        }
    }
}

export const signUp = async (email: string, password: string, name: string) => {

    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        })

        return {
            success: true,
            message: "Successfully created Account"
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            message: e.message || "An unknown error occured"
        }
    }
}
