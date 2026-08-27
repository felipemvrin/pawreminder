import desparasitantes from '@/data/desparasitantes_chile.json';

import type { Presentacion, Producto } from '@/types/desparasitante';

interface ProductoJson {
  marca: string;
  laboratorio: string;
  principio_activo: string;
  formato: string;
  frecuencia_dias: number;
  frecuencia_texto: string;
  presentaciones: Presentacion[];
}

interface DesparasitantesJson {
  antiparasitarios_externos: ProductoJson[];
  antiparasitarios_internos: ProductoJson[];
}

const catalogo = desparasitantes as DesparasitantesJson;

export function getAllProductos(): Producto[] {
  return [
    ...catalogo.antiparasitarios_externos.map((producto) => ({
      ...producto,
      tipo: 'externo' as const
    })),
    ...catalogo.antiparasitarios_internos.map((producto) => ({
      ...producto,
      tipo: 'interno' as const
    }))
  ];
}
