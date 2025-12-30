"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addComponentSchema = z.object({
  parentId: z.string(),
  childId: z.string(),
  quantity: z.coerce.number().min(0.0001),
});

export async function addBOMComponent(formData: FormData) {
  const rawData = {
    parentId: formData.get("parentId"),
    childId: formData.get("childId"),
    quantity: formData.get("quantity"),
  };

  const validated = addComponentSchema.parse(rawData);

  // 1. Check if BOM entry already exists
  const existing = await prisma.bOM.findFirst({
    where: { productId: validated.parentId },
  });

  let bomId = existing?.id;

  // 2. Create BOM container if it doesn't exist
  if (!bomId) {
    const newBom = await prisma.bOM.create({
      data: { productId: validated.parentId },
    });
    bomId = newBom.id;
  }

  // 3. Add the Component
  await prisma.bOMComponent.create({
    data: {
      bomId: bomId,
      materialId: validated.childId, // Fixed: Use materialId
      qtyPerUnit: validated.quantity, // Fixed: Use qtyPerUnit
    },
  });

  revalidatePath(`/inventory/${validated.parentId}`);
  return { success: true };
}

export async function removeBOMComponent(componentId: string, productId: string) {
  await prisma.bOMComponent.delete({
    where: { id: componentId },
  });
  revalidatePath(`/inventory/${productId}`);
}