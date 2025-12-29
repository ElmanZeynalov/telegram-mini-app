import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { put } from '@vercel/blob';

export async function POST(request: Request) {
    try {
        console.log('API: Received POST request for answer');
        const formData = await request.formData();
        const text = formData.get('text') as string;
        const questionId = formData.get('questionId') as string;
        const file = formData.get('file') as File;

        console.log('API: Form data parsed', { text, questionId, filePresent: !!file, fileName: file?.name, fileSize: file?.size });

        let mediaUrl = null;

        if (file) {
            console.log('API: Starting Vercel Blob upload...');
            const blob = await put(file.name, file, { access: 'public' });
            console.log('API: Blob uploaded successfully', blob);
            mediaUrl = blob.url;
        }

        const answer = await prisma.answer.create({
            data: {
                text,
                questionId,
                mediaUrl
            },
        });
        console.log('API: Answer created in DB', answer);
        return NextResponse.json(answer);
    } catch (error) {
        console.error('Answer creation error:', error);
        return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
    }
}
