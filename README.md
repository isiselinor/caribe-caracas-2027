# Caribe Caracas 2027

Página del festival de arte urbano Caribe Caracas 2027 para compartir con el equipo y el comité: ruta sobre la Línea 1, cronograma, calendario de pintura, programa, merch, organigrama, riesgos y solicitud del deck.

## Publicar con Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elegir este repositorio.
2. No hace falta comando de build. La carpeta de publicación es la raíz (`.`), ya definida en `netlify.toml`.

## Solicitudes del deck (Google Sheets + Apps Script)

El formulario envía cada solicitud a una Google Sheet mediante el script `apps-script/Code.gs`.

1. Crea una Google Sheet nueva y abre **Extensiones → Apps Script**.
2. Pega el contenido de `apps-script/Code.gs` y completa `CONFIG`: `CORREO_AVISO` (tu correo) y `DECK_URL` (enlace al deck).
3. Ejecuta la función `instalar` y acepta los permisos.
4. **Implementar → Nueva implementación → Aplicación web.** Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
5. Copia la URL que termina en `/exec` y pégala en `SCRIPT_URL` dentro de `index.html`.

Cada solicitud llega a la hoja **Solicitudes** con estado "Pendiente" y te avisa por correo. Para aprobar, cambia el estado a **Aprobado**: el deck se envía solo y la columna **Enviado** guarda la fecha. Si una fila aprobada no se envió (por ejemplo, porque faltaba el enlace del deck), ejecuta `enviarAprobadosPendientes`.

## Editar

Todo el sitio está en `index.html`. Para no gastar créditos de deploy, editar en la rama `develop` y pasar a `main` con un Pull Request cuando esté listo.
