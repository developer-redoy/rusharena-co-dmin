import { connectDB } from "@/lib/connectDB";

import Matches from "@/models/matches";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { data } = body || {};

    // Validate input
    if (!data || !data.matchId) {
      return NextResponse.json(
        { success: false, message: "matchId is required" },
        { status: 400 }
      );
    }

    if (!data.roomId || !data.roomPass) {
      return NextResponse.json(
        { success: false, message: "roomId and roomPass are required" },
        { status: 400 }
      );
    }

    // Find match
    const match = await Matches.findById(data.matchId);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404 }
      );
    }

    // Update room details
    match.roomId = data.roomId;
    match.roomPass = data.roomPass;

    await match.save();

    return NextResponse.json(
      {
        success: true,
        message: "Room details updated successfully",
        data: {
          matchId: match._id,
          roomDetail: match.roomDetail,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating room details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while updating room details",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
