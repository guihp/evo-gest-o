import { NextResponse } from 'next/server';
import { EvoApi } from '@/lib/evo';

export async function POST(req: Request, { params }: { params: Promise<{ name: string }> }) {
    try {
        const { name } = await params;
        const body = await req.json();
        const { action } = body;

        let res;
        switch (action) {
            case 'restart':
                res = await EvoApi.restartInstance(name);
                break;
            case 'logout':
                res = await EvoApi.logoutInstance(name);
                break;
            case 'delete':
                res = await EvoApi.deleteInstance(name);
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
        return NextResponse.json(res);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
