import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { order: 'asc' },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        answers: {
                            orderBy: { createdAt: 'asc' },
                        },
                        subQuestions: {
                            include: {
                                answers: true,
                                subQuestions: true, // Need careful recursion or flat list
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
