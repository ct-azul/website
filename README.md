# Cluster Tecnológico Azul — Website

Sitio web institucional del [Cluster Tecnológico Azul](https://github.com/clustertecnologicoazul).

> Impulsando la innovación tecnológica en Azul, Buenos Aires, Argentina 🚀

## Stack

- **[Astro](https://astro.build)** — framework estático/SSR
- **TypeScript** — tipado estricto
- **[Cloudflare Workers](https://workers.cloudflare.com)** — hosting y funciones serverless
- **[Resend](https://resend.com)** — envío de emails desde formularios

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build
```

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

| Variable         | Descripción                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `RESEND_API_KEY` | API key de [Resend](https://resend.com) para envío de emails            |
| `CONTACT_EMAIL`  | Email donde llegan los formularios de contacto y solicitudes de ingreso |

> Sin `RESEND_API_KEY`, los formularios funcionan igual pero los envíos se loguean
> a consola en lugar de enviarse por email.

## Deploy en Cloudflare

1. Conectá el repositorio en el [dashboard de Cloudflare](https://dash.cloudflare.com)
2. Configuración de build:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Agregá las variables en **Workers & Pages → website → Settings → Variables and Secrets**:
   - `RESEND_API_KEY` como **Secret** (encriptado)
   - `CONTACT_EMAIL` como Variable de texto
4. Para Resend, verificá tu dominio en [resend.com/domains](https://resend.com/domains)
   y actualizá el campo `from` en `src/pages/api/*.ts`

## Páginas

| Ruta             | Descripción                                          |
| ---------------- | ---------------------------------------------------- |
| `/`              | Landing page institucional                           |
| `/unirse`        | Formulario de solicitud de ingreso al cluster        |
| `/contacto`      | Formulario de contacto general                       |
| `/empresas`      | Solicitud de asesoría en IA para empresas de Azul    |
| `/api/unirse`    | Endpoint que procesa el formulario de ingreso        |
| `/api/contacto`  | Endpoint que procesa el formulario de contacto       |
| `/api/empresas`  | Endpoint que procesa la solicitud de asesoría        |

## Contribuir

¡Las contribuciones son bienvenidas! Abrí un issue o un pull request.
