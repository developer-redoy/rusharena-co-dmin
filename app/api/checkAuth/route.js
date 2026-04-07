import { catchError } from "@/lib/healperFunc";
import { connectDB } from "@/lib/connectDB";
import Admin from "@/models/admins";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("accessToken");

    // ❌ No token
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized access!",
        }),
        { status: 401 },
      );
    }

    let decoded;

    try {
      // ✅ Verify JWT
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

    // ✅ Get user from DB
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

    // ✅ Optional: check role
    if (decoded.role !== "admin") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Access denied!",
        }),
        { status: 403 },
      );
    }

    // ✅ SUCCESS
    return new Response(
      JSON.stringify({
        success: true,
        message: "Authorized",
        data: {
          userId: user._id,
          email: user.email,
        },
      }),
      { status: 200 },
    );
  } catch (error) {
    return catchError(error);
  }
}
