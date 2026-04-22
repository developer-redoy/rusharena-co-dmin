import { catchError } from "@/lib/healperFunc";
import { connectDB } from "@/lib/connectDB";
import Admin from "@/models/admins";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connectDB();

    // ✅ Get token from header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized access!",
        }),
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or expired token!",
        }),
        { status: 401 },
      );
    }

    // ✅ Get user
    const user = await Admin.findById(decoded.userId);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found!",
        }),
        { status: 401 },
      );
    }

    // ✅ Bangladesh time (UTC+6)
    const now = new Date();
    const bdTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
    );
    const currentMinutes = bdTime.getHours() * 60 + bdTime.getMinutes();

    // ✅ Correct time validation (from DB)
    if (currentMinutes < user.startTime || currentMinutes > user.endTime) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Access denied!",
        }),
        { status: 403 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Authorized",
        data: {
          userId: user._id,
          email: user.email,
          matchType: user.matchType,
        },
      }),
      { status: 200 },
    );
  } catch (error) {
    return catchError(error);
  }
}
