# Trotamundos · Frontend (Expo / React Native)

App móvil para viajeros: globo 3D (Cesium) para elegir país, feed de publicaciones por país/ciudad,
wizard de publicación en 6 pasos (ubicación → alojamiento → comidas → recomendaciones → fotos → confirmar),
perfil, recuperación de contraseña y panel de administración.

## Requisitos

- Node 20+
- Backend `Trotamundos` (.NET) corriendo en `http://localhost:5200` (ver carpeta `../Trotamundos`)
- Expo Go en el celular (Android/iOS) o un navegador para la versión web

## Correr

```bash
npm install
npx expo start          # abre el menú: w = web, a = Android, i = iOS, o escaneá el QR con Expo Go
```

Backend (en otra terminal):

```bash
cd ../Trotamundos && dotnet run --project Trotamundos --urls http://localhost:5200
```

### URL del backend

`src/constants/config.js` la detecta sola:

- **Web** → `http://localhost:5200`
- **Expo Go en el celular** → usa la IP de tu PC (la misma que sirve el bundle), puerto 5200.
  Tu PC y el celular tienen que estar en la misma red Wi‑Fi.
- Para forzarla: crear `.env` con `EXPO_PUBLIC_API_URL=http://192.168.x.x:5200` (ver `.env.example`).

### Cesium

El globo carga Cesium desde CDN dentro de un WebView (nativo) o un iframe (web). No necesita token:
usa la imagen Natural Earth II incluida en Cesium. Si querés imágenes satelitales de mejor calidad,
poné `EXPO_PUBLIC_CESIUM_ION_TOKEN` en `.env`.

Al tocar un país, el globo devuelve el código ISO (`ISO_A2` del GeoJSON de Natural Earth) y la app
lo resuelve contra `GET /api/mapas/paises/iso/{codigo}`.

## Estructura

```
src/
├── api/            Cliente axios (token + 401) y un módulo por recurso del backend + geocoding (Nominatim)
├── components/     common/ (Button, Input, SelectorPais, SelectorImagen…), globe/, mapa/, publicacion/, wizard/
├── constants/      colors.js, config.js
├── context/        AuthContext (sesión), WizardContext (borrador de la publicación)
├── hooks/          useAuth, usePaises, usePublicaciones, useWizard
├── navigation/     AppNavigator (auth vs app), AuthStack, MainTabNavigator, PublicacionStack, AdminStack
├── screens/        auth/, main/, publicaciones/, wizard/, admin/
└── utils/          storage (SecureStore / localStorage), formatters, dialogos
```

## Primer administrador

El usuario que se registre con el email configurado en `Admin:Email` del backend
(`admin@trotamundos.com` por defecto) queda como admin y ve la pestaña **Admin**.
