"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema for validation
const createWorkOrderSchema = z.object({
  productName: z.string().min(1),
  quantity: z.coerce.number().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  deadline: z.string().optional(),
});

export async function createWorkOrder(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/auth");

  // 1. Validate Input
  const rawData = {
    productName: formData.get("productName"),
    quantity: formData.get("quantity"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
  };

  const validated = createWorkOrderSchema.parse(rawData);

  // 2. Database Transaction
  // Find or Create Product
  let product = await prisma.product.findFirst({
    where: { name: validated.productName },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        name: validated.productName,
        sku: `SKU-${Math.floor(Math.random() * 10000)}`,
        category: "Generative",
        stock: 0,
      },
    });
  }

  // 3. Create the Manufacturing Order (Parent)
  const mo = await prisma.manufacturingOrder.create({
    data: {
      orderNo: `MO-${Date.now()}`,
      // FIX: Added the required 'name' field
      name: `Order for ${validated.productName}`, 
      productId: product.id,
      quantity: validated.quantity,
      state: "PLANNED",
      createdAt: new Date(),
      deadline: validated.deadline ? new Date(validated.deadline) : undefined,
    },
  });

  // 4. Create the Work Order (Child task)
  await prisma.workOrder.create({
    data: {
      moId: mo.id,
      status: "PENDING",
      priority: validated.priority as "LOW" | "MEDIUM" | "HIGH",
      assignedToId: session.user.id,
      title: `Assemble ${validated.productName}`,
    },
  });
  
  // 5. Real-time Broadcast
  const io = (global as any).io;
  if (io) {
    io.emit("work-order:created", { 
      message: `New Order for ${validated.productName}`,
      id: mo.id 
    });
  }

  revalidatePath("/work-orders");
  return { success: true };
}

export async function getWorkOrders() {
  const session = await auth();
  if (!session) return [];

  return await prisma.workOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mo: {
        include: {
          product: true,
        },
      },
      assignedTo: {
        select: { name: true, email: true }, 
      },
    },
  });
}

export async function updateWorkOrderStatus(workOrderId: string, newStatus: "IN_PROGRESS" | "COMPLETED") {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // 1. Fetch the Order with all necessary details (Product + BOM)
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: {
      mo: {
        include: {
          product: {
            include: {
              boms: { 
                include: {
                  components: true 
                }
              }
            }
          }
        }
      }
    }
  });

  if (!workOrder) throw new Error("Work Order not found");

  const product = workOrder.mo.product;
  const quantityToMake = workOrder.mo.quantity;
  
  const activeBom = product.boms[0]; 

  // 2. LOGIC: If Completing, we must consume materials
  if (newStatus === "COMPLETED" && workOrder.status !== "COMPLETED") {
    
    await prisma.$transaction(async (tx) => {
      
      // A. Consume Raw Materials (Loop through BOM)
      if (activeBom?.components) {
        for (const component of activeBom.components) {
          const requiredQty = component.qtyPerUnit * quantityToMake; 
          
          const currentStock = await tx.product.findUnique({ where: { id: component.materialId }});
          
          if (!currentStock || currentStock.stock < requiredQty) {
            throw new Error(`Insufficient stock for component ID: ${component.materialId}`);
          }

          // Decrement Stock
          await tx.product.update({
            where: { id: component.materialId },
            data: { stock: { decrement: requiredQty } }
          });

          // Ledger Entry
          await tx.stockEntry.create({
            data: {
              productId: component.materialId,
              type: "OUT",
              quantity: requiredQty,
              change: -requiredQty,
              balanceAfter: currentStock.stock - requiredQty,
              notes: `Consumed for WO #${workOrder.mo.orderNo}` 
            }
          });
        }
      }

      // B. Add Finished Good
      const finishedGood = await tx.product.update({
        where: { id: product.id },
        data: { stock: { increment: quantityToMake } }
      });

      await tx.stockEntry.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: quantityToMake,
          change: quantityToMake,
          balanceAfter: finishedGood.stock,
          notes: `Produced via WO #${workOrder.mo.orderNo}`
        }
      });

      // C. Update Status
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: { status: "COMPLETED" }
      });
    });
  } else {
    // Simple status update
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { 
        status: newStatus === "IN_PROGRESS" ? "STARTED" : "COMPLETED" 
      }
    });
  }

  const io = (global as any).io;
  if (io) {
    io.emit("work-order:updated", { 
      message: `Order completed & Inventory updated`,
      id: workOrderId,
      status: newStatus
    });
  }

  revalidatePath("/work-orders");
  revalidatePath("/inventory"); 
  return { success: true };
}