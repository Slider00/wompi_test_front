# Wompi Checkout - Mobile Front-End (React Native)

Aplicación móvil desarrollada con **React Native (CLI)** puro para el flujo de pagos e integración con Wompi Checkout. No utiliza Expo ni frameworks similares.

---

## 🚀 Arquitectura y Organización

El proyecto sigue una estructura basada en **Capas y Características (Feature-Based & Layered Architecture)**:
- **src/components**: Componentes visuales responsivos compartidos.
- **src/features**: Módulos funcionales de la aplicación (Auth, Onboarding, Payment/Checkout, Products).
- **src/store**: Configuración centralizada de Redux Toolkit (patrón Flux).
- **src/theme**: Paleta de colores, márgenes, sombras y fuentes de diseño responsivo.
- **src/utils**: Helpers de escala responsiva y cifrado de almacenamiento local.

---

## 📦 Características Principales

1. **Diseño Responsivo**: Fuentes y contenedores adaptables para evitar desbordamientos, optimizados desde pantallas pequeñas (como iPhone SE) en adelante.
2. **Estado con Redux**: Manejo global de flujos de carrito, transacciones y sesiones de usuario a través de Redux Toolkit.
3. **Almacenamiento Seguro (Cifrado AES)**: Los datos de transacciones locales en AsyncStorage están encriptados con AES (usando la clave secreta provista por el entorno).
4. **Manejo de Variables de Entorno**: Script automático (`scripts/load-env.js`) para cargar configuraciones `.env.test` o `.env.prod` generando un archivo tipado `env.ts`.
5. **Sincronización en Tiempo Real**: Actualización automática (polling) cada 5 segundos al estar en la pantalla de estado de una transacción pendiente.
6. **Modo Invitado**: Permite explorar el catálogo y restringe los accesos a compras o historial solicitando registro.

---

## 🛠️ Instalación y Uso

### Prerrequisitos
Tener configurado el entorno de desarrollo nativo de iOS (Xcode/Cocoapods) y/o Android (Android Studio/SDK).

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Instalar dependencias de iOS (solo macOS):
   ```bash
   cd ios && pod install && cd ..
   ```

3. Levantar el bundler (Metro):
   ```bash
   npm run start
   ```

4. Ejecutar en emulador/dispositivo:
   - **iOS**: `npm run ios`
   - **Android**: `npm run android`

---

## 🧪 Pruebas Unitarias

Ejecutar las pruebas unitarias y de renderizado:
```bash
npm run test
```

Generar reporte de cobertura (supera el 90%):
```bash
npm run test -- --coverage
```
