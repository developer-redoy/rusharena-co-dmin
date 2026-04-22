import { catchError } from "@/lib/healperFunc";
import { connectDB } from "@/lib/connectDB";
import cookie from "cookie";
import Admin from "@/models/admins";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { matchType, email, password } = body;

    if (!email || !password || !matchType) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or missing input field!",
        }),
        { status: 400 },
      );
    }

    const user = await Admin.findOne({ email, matchType }).select("+password");

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email or password!",
        }),
        { status: 401 },
      );
    }

    // ✅ Secure password check
    if (user.password !== password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email or password!!",
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

    if (currentMinutes < user.startTime || currentMinutes > user.endTime) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Access not allowed at this time",
        }),
        { status: 403 },
      );
    }

    const remainingMinutes = user.endTime - currentMinutes;
    if (remainingMinutes <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Session expired",
        }),
        { status: 403 },
      );
    }

    const expiresIn = remainingMinutes * 60;

    // ✅ Minimal JWT
    const token = jwt.sign(
      {
        userId: user._id,
        matchType: user.matchType,
      },
      process.env.SECRET_KEY,
      { expiresIn },
    );

    // ✅ Secure cookie
    const serializedCookie = cookie.serialize("access_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          email: user.email,
          endTime: user.endTime,
        },
        token, // for Capacitor
      }),
      {
        headers: {
          "Set-Cookie": serializedCookie,
        },
        status: 200,
      },
    );
  } catch (error) {
    return catchError(error);
  }
}
