"use server";

import prisma from "@/lib/prisma";
import { checkAuth } from "./auth";
import { revalidatePath } from "next/cache";

export async function editMiembro(id: string, nombre: string, apodo: string | null) {
  if (!(await checkAuth())) throw new Error("Unauthorized");
  
  await prisma.miembro.update({
    where: { id },
    data: { nombre, apodo: apodo || null }
  });
  
  revalidatePath("/miembros");
  revalidatePath("/pagos");
  revalidatePath("/eventos/[id]", "page");
}

export async function deleteMiembro(id: string) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  // Al eliminar un miembro de forma definitiva, eliminamos sus pagos y asignaciones
  await prisma.pago.deleteMany({ where: { miembroId: id } });
  await prisma.asignacionMeta.deleteMany({ where: { miembroId: id } });
  
  await prisma.miembro.delete({ where: { id } });

  revalidatePath("/miembros");
  revalidatePath("/pagos");
  revalidatePath("/");
}

export async function disableMiembro(id: string) {
  if (!(await checkAuth())) throw new Error("Unauthorized");
  
  await prisma.miembro.update({
    where: { id },
    data: { activo: false }
  });
  
  revalidatePath("/miembros");
  revalidatePath("/pagos");
}
