import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { text, categoryId, parentId, order } = await request.json();
        const question = await prisma.question.create({
            data: {
                text,
                categoryId,
                parentId,
                order: order || 0,
            },
        });
        return NextResponse.json(question);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
}
