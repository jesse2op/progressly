import { NextResponse } from 'next/server';

const EXERCISE_LIBRARY = [
    "Bench Press (Barbell)",
    "Bench Press (Dumbbell)",
    "Incline Bench Press (Barbell)",
    "Incline Bench Press (Dumbbell)",
    "Overhead Press (Barbell)",
    "Overhead Press (Dumbbell)",
    "Lateral Raise (Dumbbell)",
    "Lateral Raise (Cable)",
    "Front Raise",
    "Tricep Pushdown",
    "Tricep Extension (Dumbbell)",
    "Skullcrushers",
    "Bicep Curl (Barbell)",
    "Bicep Curl (Dumbbell)",
    "Hammer Curl",
    "Squat (Barbell)",
    "Leg Press",
    "Leg Extension",
    "Leg Curl",
    "Deadlift (Barbell)",
    "Romanian Deadlift",
    "Lunges",
    "Pull Up",
    "Lat Pulldown",
    "Seated Row",
    "Bent Over Row (Barbell)",
    "One Arm Row (Dumbbell)",
    "Plank",
    "Crunches",
    "Leg Raise",
    "Push Ups",
    "Dips",
    "Chin Ups",
    "Face Pulls",
    "Calf Raise",
    "Hip Thrust",
    "Box Jump",
    "Burpees",
    "Mountain Climbers",
    "Kettlebell Swing",
    "Snatch",
    "Clean and Jerk",
    "Front Squat",
    "Goblet Squat",
    "Turkish Get Up",
    "Arnold Press",
    "Reverse Flys",
    "Bulgarian Split Squat",
    "Preacher Curl",
    "Concentration Curl"
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query) {
        return NextResponse.json([]);
    }

    const matches = EXERCISE_LIBRARY.filter(ex =>
        ex.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results

    return NextResponse.json(matches);
}
