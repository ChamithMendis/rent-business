import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePayhereHash, formatAmount } from "@/lib/payhere";
import { z } from "zod";
import { auth } from "@/lib/auth";

const orderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY"]),
  notes: z.string().optional(),
  totalAmount: z.number().positive(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      name: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const { name, email, phone, address, city, postalCode, paymentMethod, notes, totalAmount, items } = parsed.data;

    // Validate stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 });
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id ?? null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        city,
        postalCode,
        paymentMethod,
        notes,
        totalAmount,
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (paymentMethod === "CARD") {
      const merchantId = process.env.PAYHERE_MERCHANT_ID!;
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
      const amount = formatAmount(totalAmount);
      const currency = "LKR";
      const hash = generatePayhereHash(merchantId, order.id, amount, currency, merchantSecret);

      const payhereUrl = new URL(
        process.env.PAYHERE_SANDBOX === "true"
          ? "https://sandbox.payhere.lk/pay/checkout"
          : "https://www.payhere.lk/pay/checkout"
      );

      const params = new URLSearchParams({
        merchant_id: merchantId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notify`,
        order_id: order.id,
        items: items.map((i) => i.name).join(", "),
        currency,
        amount,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || "-",
        email,
        phone,
        address,
        city,
        country: "Sri Lanka",
        hash,
      });

      return NextResponse.json({ orderId: order.id, payhereUrl: `${payhereUrl}?${params}` });
    }

    return NextResponse.json({ orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
