import dbConnect from '@/lib/db'

export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
    await dbConnect()
}
