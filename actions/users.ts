"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateUserRole(userId: string, formData: FormData) {
  const role = formData.get("role") as UserRole;
  
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  
  revalidatePath("/users");
}