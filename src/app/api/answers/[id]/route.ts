import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('API: Received PUT request for answer', { id: await params });
        const { id } = await params;
        const formData = await request.formData();
        const text = formData.get('text') as string;
        const file = formData.get('file') as File;
        const removeFile = formData.get('removeFile') === 'true';

        console.log('API: Form data parsed', { text, filePresent: !!file, fileName: file?.name, fileSize: file?.size, removeFile });

        let mediaUrl;

        if (file) {
            console.log('API: Starting Vercel Blob upload for update...');
            const blob = await put(file.name, file, { access: 'public' });
            console.log('API: Blob uploaded successfully', blob);
            mediaUrl = blob.url;
        } else if (removeFile) {
            console.log('API: Removing file from answer');
            mediaUrl = null;
        }

        // Prepare update data. Only include mediaUrl if it changed (new file or explicit removal)
        const data: any = { text };
        if (mediaUrl !== undefined) {
            data.mediaUrl = mediaUrl;
        }

        console.log('API: Updating answer in DB', { id, data });
        const answer = await prisma.answer.update({
            where: { id },
            data,
        });
        console.log('API: Answer updated in DB', answer);
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
