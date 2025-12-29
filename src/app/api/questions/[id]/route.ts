import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const updates = await request.json();
        const question = await prisma.question.update({
            where: { id: params.id },
            data: updates,
        });
        return NextResponse.json(question);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.question.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }
}
