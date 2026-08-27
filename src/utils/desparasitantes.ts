import desparasitantes from '../data/desparasitantes_chile.json';

import type { Producto, TratamientoTipo } from '@/types/desparasitante';

interface DesparasitantesJson {
  productos: Producto[];
}

const catalogo = desparasitantes as DesparasitantesJson;

export function getAllProductos(): Producto[] {
  return catalogo.productos;
}

export function getProductosByTipo(tipo: TratamientoTipo): Producto[] {
  return getAllProductos().filter((producto) => producto.tipo.includes(tipo));
}
