import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const merchantId = formData.get("merchant_id") as string;
  const orderId = formData.get("order_id") as string;
  const paymentId = formData.get("payment_id") as string;
  const amount = formData.get("payhere_amount") as string;
  const currency = formData.get("payhere_currency") as string;
  const statusCode = formData.get("status_code") as string;
  const md5sig = formData.get("md5sig") as string;

  // Verify PayHere signature
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
  const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const expected = crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${amount}${currency}${statusCode}${secretHash}`)
    .digest("hex")
    .toUpperCase();

  if (md5sig !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (statusCode === "2") {
    // Payment successful
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        payhereOrderId: paymentId,
      },
    });
  } else if (statusCode === "-1" || statusCode === "-2" || statusCode === "-3") {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "FAILED" },
    });
  }

  return NextResponse.json({ status: "ok" });
}
