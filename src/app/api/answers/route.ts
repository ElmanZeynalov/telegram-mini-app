import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { put } from '@vercel/blob';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const text = formData.get('text') as string;
        const questionId = formData.get('questionId') as string;
        const file = formData.get('file') as File;

        let mediaUrl = null;

        if (file) {
            const blob = await put(file.name, file, { access: 'public' });
            mediaUrl = blob.url;
        }

        const answer = await prisma.answer.create({
            data: {
                text,
                questionId,
                mediaUrl
            },
        });
        return NextResponse.json(answer);
    } catch (error) {
        console.error('Answer creation error:', error);
        return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
    }
}
