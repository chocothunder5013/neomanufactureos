import { prisma } from "@/lib/prisma";

export async function getCurrentStock(productId: string) {
  const stock = await prisma.stockEntry.aggregate({
    where: { productId },
    _sum: {
      quantity: true,
    },
  });
  return stock._sum.quantity || 0;
}

export async function createStockEntry(data: {
  productId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason?: string;
  userId?: string;
}) {
  // 1. Calculate new balance
  const current = await getCurrentStock(data.productId);
  const change = data.type === "IN" ? data.quantity : -data.quantity;
  const balanceAfter = current + change;

  // 2. Prevent negative stock if it's an OUT operation
  if (data.type === "OUT" && balanceAfter < 0) {
    throw new Error(`Insufficient stock for Product ${data.productId}. Current: ${current}, Required: ${data.quantity}`);
  }

  // 3. Record the entry
  return prisma.stockEntry.create({
    data: {
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      balanceAfter, // Snapshot of balance at this moment
      note: data.reason,
    },
  });
}
