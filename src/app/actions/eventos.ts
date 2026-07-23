"use server";

import prisma from "@/lib/prisma";
import { checkAuth } from "./auth";
import { revalidatePath } from "next/cache";

export async function updateAsignacion(id: string, monto: number) {
  if (!(await checkAuth())) throw new Error("Unauthorized");
  
  await prisma.asignacionMeta.update({
    where: { id },
    data: { monto }
  });
  
  revalidatePath("/eventos");
  revalidatePath("/pagos");
  revalidatePath("/");
}
