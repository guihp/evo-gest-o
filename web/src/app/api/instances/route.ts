import { NextResponse } from 'next/server';
import { EvoApi } from '@/lib/evo';

export async function GET() {
    try {
        const data = await EvoApi.fetchInstances();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name } = body;
        if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
        const data = await EvoApi.createInstance(name);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 });
    }
}
