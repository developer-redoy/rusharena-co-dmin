import { connectDB } from "@/lib/connectDB";
import matches from "@/models/matches";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { success: false, message: "matchId is required" },
        { status: 400 }
      );
    }

    // Find the match
    const existingMatch = await matches.findById(matchId);
    if (!existingMatch) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404 }
      );
    }

    const joinedPlayers = existingMatch.joinedPlayers || [];
    const entryFee = existingMatch.entryFee || 0;

    // Check all players exist before refunding
    for (const player of joinedPlayers) {
      if (player?.authId) {
        const foundUser = await User.findById(player.authId);

        // If any player not found, stop process and respond
        if (!foundUser) {
          return NextResponse.json(
            {
              success: false,
              message: `User not found: ${
                player.username || player.authId
              }. Match deletion cancelled.`,
            },
            { status: 404 }
          );
        }
      }
    }

    // Refund entry fee to all joined players
    for (const player of joinedPlayers) {
      if (player?.authId) {
        await User.findByIdAndUpdate(
          player.authId,
          { $inc: { dipositbalance: entryFee } },
          { new: true }
        );
      }
    }

    // Delete the match after successful refunds
    await matches.findByIdAndDelete(matchId);

    return NextResponse.json({
      success: true,
      message: "Match deleted and refunds processed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/deleteMatch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
