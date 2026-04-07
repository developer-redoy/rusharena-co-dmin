import { connectDB } from "@/lib/connectDB";
import Matches from "@/models/matches";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { data } = await req.json(); // matches frontend body

    // Ensure startTime is Date

    const createMatch = await Matches.create(data);

    return NextResponse.json(
      { success: true, message: "Match created", data: createMatch },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Match",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
