import { NextResponse } from 'next/server';
import { EvoApi } from '@/lib/evo';
import { signToken } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
    try {
        const { name } = await params;
        const data = await EvoApi.connectInstance(name);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ name: string }> }) {
    // Generate a temporary link
    try {
        const { name } = await params;
        const token = await signToken({ instanceName: name });
        return NextResponse.json({ token });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
