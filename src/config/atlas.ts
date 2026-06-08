/** Proyecto Atlas — convocatoria activa. Actualizá los form URLs cuando estén listos. */
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
  /** Reemplazá con los links reales de Google Forms cuando los crees */
  forms: {
    alumnos: 'https://forms.gle/TODO_ALUMNOS',
    empresas: 'https://forms.gle/TODO_EMPRESAS',
  },
  referente: 'Nicolas Cirigliano',
} as const;

export function isAtlasFormReady(url: string): boolean {
  return Boolean(url) && !/TODO/i.test(url);
}
