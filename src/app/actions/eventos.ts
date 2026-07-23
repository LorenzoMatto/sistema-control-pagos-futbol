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

export async function deleteEvento(id: string) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  // Eliminar pagos relacionados primero (por FK constraint)
  await prisma.pago.deleteMany({ where: { eventoId: id } });
  // Eliminar asignaciones
  await prisma.asignacionMeta.deleteMany({ where: { eventoId: id } });
  // Eliminar el evento
  await prisma.evento.delete({ where: { id } });

  revalidatePath("/eventos");
  revalidatePath("/pagos");
  revalidatePath("/");
}

export async function editEvento(id: string, descripcion: string, montoBase: number) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  await prisma.evento.update({
    where: { id },
    data: { descripcion, montoEsperado: montoBase }
  });

  revalidatePath("/eventos");
  revalidatePath("/pagos");
}

export async function renovarMeta(eventoOrigenId: string, nuevoMonto?: number) {
  if (!(await checkAuth())) throw new Error("Unauthorized");

  const eventoOrigen = await prisma.evento.findUnique({
    where: { id: eventoOrigenId },
    include: { asignaciones: { include: { miembro: true } } }
  });

  if (!eventoOrigen) throw new Error("Meta no encontrada");

  // El nuevo ciclo empieza hoy
  const hoy = new Date();
  const montoBase = nuevoMonto ?? eventoOrigen.montoEsperado;

  // Calcular la proporción de cada asignación respecto al monto base anterior
  // Si el monto cambia, ajustar proporcionalmente
  const asignacionesData = eventoOrigen.asignaciones
    .filter(a => a.miembro.activo)
    .map(a => {
      const ratio = eventoOrigen.montoEsperado > 0 
        ? a.monto / eventoOrigen.montoEsperado 
        : 1;
      return {
        miembroId: a.miembroId,
        monto: nuevoMonto ? Math.round(nuevoMonto * ratio) : a.monto
      };
    });

  // Generar nombre automático (siguiente mes)
  const fechaOrigen = eventoOrigen.fecha;
  const mesSiguiente = new Date(fechaOrigen);
  mesSiguiente.setMonth(mesSiguiente.getMonth() + 1);
  const descripcion = eventoOrigen.descripcion.replace(
    /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\d{4})\b/gi,
    (_) => {
      const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
      return meses[mesSiguiente.getMonth()] + " " + mesSiguiente.getFullYear();
    }
  );

  await prisma.evento.create({
    data: {
      descripcion: descripcion !== eventoOrigen.descripcion 
        ? descripcion 
        : `${eventoOrigen.descripcion} (Renovado)`,
      fecha: hoy,
      montoEsperado: montoBase,
      asignaciones: {
        create: asignacionesData
      }
    }
  });

  // Cerrar el evento origen
  await prisma.evento.update({
    where: { id: eventoOrigenId },
    data: { cerrado: true }
  });

  revalidatePath("/eventos");
  revalidatePath("/pagos");
  revalidatePath("/");
}


