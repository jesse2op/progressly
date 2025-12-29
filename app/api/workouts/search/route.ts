import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query) {
        return NextResponse.json([]);
    }

    // Get coach profile
    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!coachProfile) {
        return NextResponse.json([]);
    }

    const workouts = await prisma.workout.findMany({
        where: {
            coachId: coachProfile.id,
            title: {
                contains: query
            }
        },
        select: {
            id: true,
            title: true
        },
        take: 10
    });

    return NextResponse.json(workouts);
}
