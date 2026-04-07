import { catchError } from "@/lib/healperFunc";
import { connectDB } from "@/lib/connectDB";
import cookie from "cookie";
import Admin from "@/models/admins";

import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { email, password } = body;

    // ✅ Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or missing input field!",
        }),
        { status: 400 },
      );
    }

    // ✅ Find user
    const user = await Admin.findOne({ email }).select("+password");

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email or password!!",
        }),
        { status: 401 },
      );
    }

    // ✅ Compare password (IMPORTANT)
    // const isMatch = await bcrypt.compare(password, user.password);

    if (user.password !== password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email or password!",
        }),
        { status: 401 },
      );
    }

    // ✅ Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: "admin", // you can expand later
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
    );

    // ✅ Cookies (optional for web)
    const cookies = [
      cookie.serialize("access_token", token, {
        httpOnly: false, // true if only server needed
        path: "/",
        sameSite: "lax",
      }),
    ];

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          email: user.email,
        },
        token, // 🔥 for Capacitor storage
      }),
      {
        headers: {
          "Set-Cookie": cookies,
        },
        status: 200,
      },
    );
  } catch (error) {
    return catchError(error);
  }
}
