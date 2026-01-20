"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { WorkCenterStatus } from "@prisma/client";

export async function getWorkCenters() {
  return await prisma.workCenter.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { workOrders: true } // See how many active jobs are here
      }
    }
  });
}

export async function createWorkCenter(formData: FormData) {
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const capacity = Number(formData.get("capacity"));
  const costPerHour = Number(formData.get("costPerHour"));

  await prisma.workCenter.create({
    data: {
      name,
      location,
      capacity,
      costPerHour,
      status: "AVAILABLE"
    }
  });

  revalidatePath("/work-centers");
  return { success: true };
}

export async function updateWorkCenterStatus(id: string, status: WorkCenterStatus) {
  await prisma.workCenter.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/work-centers");
}