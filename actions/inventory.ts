"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      stockEntries: {
        orderBy: { createdAt: "desc" },
        take: 1, // Get the latest balance
      },
    },
  });
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const category = formData.get("category") as string;
  const initialStock = Number(formData.get("initialStock") || 0);

  // 1. Create Product
  const product = await prisma.product.create({
    data: {
      name,
      sku,
      category,
      stock: initialStock, // Denormalized current stock
    },
  });

  // 2. Create Initial Stock Entry (Ledger)
  if (initialStock > 0) {
    await prisma.stockEntry.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: initialStock,
        balanceAfter: initialStock,
        note: "Initial Stock",
      },
    });
  }

  revalidatePath("/inventory");
  return { success: true };
}
