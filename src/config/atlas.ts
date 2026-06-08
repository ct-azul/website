/** Proyecto Atlas — convocatoria activa. */
export const ATLAS = {
  active: true,
  name: 'Proyecto Atlas',
  tagline: 'Transformación digital para pymes de Azul y la región',
  programAlumnos: 'Más allá del Código',
  convocatoriaAlumnos: {
    apertura: '1 de junio de 2026',
    cierreInscripcion: '17 de julio de 2026',
    inicioCurso: 'Agosto 2026',
  },
  /** La asesoría a empresas sigue abierta después del cierre de inscripción de alumnos. */
  convocatoriaEmpresas: {
    disponibilidad: 'De forma continua',
    nota: 'Las empresas pueden sumarse aunque cierre la inscripción de alumnos.',
  },
  forms: {
    alumnos: 'https://forms.gle/EWLtD7FB6ZkGNvGTA',
    empresas: 'https://forms.gle/Vg9EErNdJkfJoVwS7',
  },
  referente: 'Nicolas Cirigliano',
} as const;

export function isAtlasFormReady(url: string): boolean {
  return Boolean(url) && !/TODO/i.test(url);
}
