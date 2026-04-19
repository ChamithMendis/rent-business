import crypto from "crypto";

export function generatePayhereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string {
  const secretHash = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const raw = `${merchantId}${orderId}${amount}${currency}${secretHash}`;
  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}
