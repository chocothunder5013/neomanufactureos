"use server";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  // 1. Order Status Counts
  const orderStats = await prisma.manufacturingOrder.groupBy({
    by: ['state'],
    _count: { id: true },
  });

  // 2. Inventory Value (Simple calculation: stock * price (mocked as 10 if null))
  const products = await prisma.product.findMany({
    select: { stock: true, price: true }
  });
  const totalInventoryValue = products.reduce((acc, curr) => {
    return acc + (curr.stock * (curr.price || 10)); 
  }, 0);

  // 3. Work Order Performance (Estimated vs Actual)
  // Only completed orders where we tracked time
  const completedWorkOrders = await prisma.workOrder.findMany({
    where: { 
      status: "COMPLETED",
      actualTime: { not: null },
      estimatedTime: { not: null }
    },
    take: 10,
    orderBy: { updatedAt: 'desc' },
    select: {
      taskName: true,
      estimatedTime: true,
      actualTime: true
    }
  });

  return {
    orderStats,
    totalInventoryValue,
    performance: completedWorkOrders
  };
}