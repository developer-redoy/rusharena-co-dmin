import { connectDB } from "@/lib/connectDB";
import Withdraw from "@/models/Withdraw";
import Tokens from "@/models/Tokens";
import { fcm } from "@/lib/firebaseAdmin";

const FIXED_TITLE = "Rush Arena";

export async function startWithdrawListener() {
  await connectDB();

  console.log("✅ Withdraw change stream started");

  const changeStream = Withdraw.watch();

  changeStream.on("change", async (change) => {
    try {
      // Only react to NEW inserts
      if (change.operationType !== "insert") return;

      const withdrawData = change.fullDocument;

      console.log("💰 New withdraw request:", withdrawData);

      // 1. Get all device tokens
      const records = await Tokens.find({});
      const tokens = records.map((t) => t.token).filter(Boolean);

      if (!tokens.length) return;

      // 2. Prepare FCM payload
      const payload = {
        notification: {
          title: FIXED_TITLE,
          body: `New withdraw request: ৳${withdrawData.amount}`,
        },
      };

      // 3. Send notification
      const response = await fcm.sendEachForMulticast({
        tokens,
        ...payload,
      });

      console.log(
        `📤 Sent: ${response.successCount}, Failed: ${response.failureCount}`
      );
    } catch (err) {
      console.error("❌ Withdraw listener error:", err);
    }
  });
}
