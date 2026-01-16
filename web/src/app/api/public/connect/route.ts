import { NextResponse } from 'next/server';
import { EvoApi } from '@/lib/evo';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.instanceName) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // Valid token, fetch QR code
        const data = await EvoApi.connectInstance(payload.instanceName as string);
        return NextResponse.json({ ...data, instanceName: payload.instanceName });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
