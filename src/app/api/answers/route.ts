import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { text, questionId } = await request.json();
        const answer = await prisma.answer.create({
            data: {
                text,
                questionId,
            },
        });
        return NextResponse.json(answer);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
    }
}
