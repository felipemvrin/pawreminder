export type TratamientoTipo = 'interno' | 'externo';

export interface Presentacion {
  peso_min_kg: number | null;
  peso_max_kg: number | null;
  mg?: number | null;
  comprimidos_por_envase?: number | null;
  precio_min: number;
  precio_max: number;
  nota?: string;
}

export interface Producto {
  marca: string;
  laboratorio: string;
  principio_activo: string;
  formato: string;
  frecuencia_dias: number;
  frecuencia_texto: string;
  presentaciones: Presentacion[];
  tipo: TratamientoTipo[];
}
