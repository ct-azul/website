/** Single source of truth for form `<select>` options (UI, API allowlists, email labels). */

export interface FormOption {
  readonly value: string;
  readonly label: string;
}

function defineOptions<const T extends readonly FormOption[]>(items: T) {
  const allowed = new Set(items.map((o) => o.value));
  return {
    options: items,
    allowed,
    label(slug: string): string {
      return items.find((o) => o.value === slug)?.label ?? slug;
    },
  };
}

export const ASUNTO = defineOptions([
  { value: 'informacion', label: 'Información general' },
  { value: 'colaboracion', label: 'Propuesta de colaboración' },
  { value: 'evento', label: 'Organizar un evento' },
  { value: 'prensa', label: 'Prensa / medios' },
  { value: 'otro', label: 'Otro' },
] as const);

export const ROL = defineOptions([
  { value: 'desarrollador', label: 'Desarrollador/a de software' },
  { value: 'diseniador', label: 'Diseñador/a UX/UI' },
  { value: 'data', label: 'Data / IA / ML' },
  { value: 'emprendedor', label: 'Emprendedor/a tech' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente / investigador/a' },
  { value: 'otro', label: 'Otro' },
] as const);

export const COMO = defineOptions([
  { value: 'redes', label: 'Redes sociales' },
  { value: 'amigo', label: 'Un amigo / colega' },
  { value: 'evento', label: 'Evento o charla' },
  { value: 'github', label: 'GitHub' },
  { value: 'otro', label: 'Otro' },
] as const);

export const CATEGORIA = defineOptions([
  { value: 'automatizacion', label: 'Automatización de procesos internos' },
  { value: 'asistentes-ia', label: 'Asistentes con IA' },
  { value: 'integracion', label: 'Integración de herramientas de IA' },
  { value: 'analisis-datos', label: 'Análisis de datos e inteligencia de negocio' },
  { value: 'capacitacion', label: 'Capacitación del equipo' },
  { value: 'no-se', label: 'No sé por dónde empezar' },
] as const);

export const asuntoLabel = ASUNTO.label;
export const rolLabel = ROL.label;
export const comoLabel = COMO.label;
export const categoriaLabel = CATEGORIA.label;
