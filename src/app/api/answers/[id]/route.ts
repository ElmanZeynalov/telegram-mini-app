import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const text = formData.get('text') as string;
        const file = formData.get('file') as File;
        const removeFile = formData.get('removeFile') === 'true';

        let mediaUrl;

        if (file) {
            const blob = await put(file.name, file, { access: 'public' });
            mediaUrl = blob.url;
        } else if (removeFile) {
            mediaUrl = null;
        }

        // Prepare update data. Only include mediaUrl if it changed (new file or explicit removal)
        const data: any = { text };
        if (mediaUrl !== undefined) {
            data.mediaUrl = mediaUrl;
        }

        const answer = await prisma.answer.update({
            where: { id },
            data,
        });
        return NextResponse.json(answer);
    } catch (error) {
        console.error('Update answer error:', error);
        return NextResponse.json({ error: 'Failed to update answer' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.answer.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete answer' }, { status: 500 });
    }
}
