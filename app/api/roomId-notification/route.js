import { NextResponse } from "next/server";

import { connectDB } from "@/lib/connectDB";
import Tokens from "@/models/Tokens";
import { fcm } from "@/lib/firebaseAdmin";
import matches from "@/models/matches";

const FIXED_TITLE = "Rush Arena";
const MAX_TOKENS_PER_BATCH = 500;

export async function POST(request) {
  try {
    const { message, matchId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // 1. Get match & players
    const match = await matches.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const playerIds = match.joinedPlayers.map((player) => player.authId);

    // 2. Get tokens for match players
    const tokenDocs = await Tokens.find({
      userId: { $in: playerIds },
    });

    const tokens = tokenDocs.map((item) => item.token).filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json({ error: "No tokens found" }, { status: 404 });
    }

    // 3. Notification payload
    const payload = {
      notification: {
        title: FIXED_TITLE,
        body: message,
      },
    };

    let totalSuccess = 0;
    let totalFailure = 0;

    // 4. Send in batches of 500
    for (let i = 0; i < tokens.length; i += MAX_TOKENS_PER_BATCH) {
      const batchTokens = tokens.slice(i, i + MAX_TOKENS_PER_BATCH);

      const response = await fcm.sendEachForMulticast({
        tokens: batchTokens,
        ...payload,
      });

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    }

    return NextResponse.json({
      success: true,
      totalTokens: tokens.length,
      sent: totalSuccess,
      failed: totalFailure,
    });
  } catch (err) {
    console.error("FCM error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
