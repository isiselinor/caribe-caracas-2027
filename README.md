# Caribe Caracas 2027

Página del festival de arte urbano Caribe Caracas 2027 para compartir con el equipo y el comité: ruta sobre la Línea 1, cronograma, calendario de pintura, programa, merch, organigrama, riesgos y solicitud del deck.

## Publicar con Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elegir este repositorio.
2. No hace falta comando de build. La carpeta de publicación es la raíz (`.`), ya definida en `netlify.toml`.
3. Activar formularios: **Site configuration → Forms → Enable form detection** y volver a desplegar.

## Solicitudes del deck

El formulario final usa Netlify Forms con el nombre `solicitud-deck`.

- Las solicitudes aparecen en **Netlify → Forms → solicitud-deck**.
- Para recibir un aviso por correo: **Forms → Form notifications → Add notification → Email notification**.
- La aprobación es manual: revisar cada solicitud y enviar el deck por correo a las personas aprobadas.

## Editar

Todo el sitio está en `index.html`. Para no gastar créditos de deploy, editar en la rama `develop` y pasar a `main` con un Pull Request cuando esté listo.
