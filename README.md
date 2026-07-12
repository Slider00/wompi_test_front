# Wompi Checkout - Mobile Front-End (React Native)

Este es el front-end móvil del proyecto de prueba técnica para Wompi, desarrollado con **React Native (v0.86.0)** de forma pura (CLI), respetando la restricción estricta de no utilizar Expo ni otros frameworks multiplataforma.

---

## 🚀 Arquitectura y Estructura del Proyecto

El código está organizado bajo una **Arquitectura Híbrida basada en Capas y Características (Feature-Based & Layered Architecture)** para garantizar la separación de responsabilidades y alta escalabilidad:

```text
src/
├── components/       # Componentes visuales genéricos y responsivos
├── features/         # Módulos funcionales de la aplicación
│   └── payment/      # Flujo de transacciones y pagos (Wompi)
│       ├── components/  # Componentes exclusivos de pagos (Card Preview, etc.)
│       ├── screens/     # Pantallas (PaymentScreen, StatusScreen, HistoryScreen)
│       └── store/       # Slice de Redux y lógica de persistencia
├── store/            # Configuración global del Store de Redux (Flux)
├── theme/            # Tokens del sistema de diseño responsivo (Colores, Spacing, Fuentes)
├── utils/            # Utilidades (Escala responsiva y encriptación AES)
└── env.ts            # Variables de entorno cargadas
```

---

## 📦 Características Principales e Implementación

### 1. Responsividad Avanzada (Referencia Mínima: iPhone SE)
Para cumplir con el soporte para pantallas pequeñas (375x667 puntos lógicos) y prevenir desbordamientos, implementamos un helper en `src/utils/responsive.ts`:
* **Escala Proporcional**: Las fuentes, márgenes y dimensiones de cajas escalan dinámicamente según la resolución física y lógica del dispositivo usando `Dimensions`.
* **Ajuste a Límites de UI**: Las pantallas están envueltas en `RootContainer.tsx` utilizando `SafeAreaView` (evita superposición del notch) y `KeyboardAvoidingView` + `ScrollView` (mueve los inputs dinámicamente y permite hacer scroll cuando el teclado en pantalla está desplegado).

### 2. Gestión de Estado con Redux (Flux)
* Se utiliza **Redux Toolkit** (`@reduxjs/toolkit` y `react-redux`) para centralizar el flujo de datos siguiendo el patrón Flux de forma estricta.
* Las acciones asíncronas se manejan a través de Redux Thunks (`loadTransactions` y `saveNewTransaction`).

### 3. Almacenamiento Local Cifrado (¡Seguridad AES!)
* Por motivos de seguridad y de acuerdo a los requerimientos de la prueba, **los datos de transacciones de pago se almacenan de forma totalmente cifrada**.
* Se utiliza la librería de criptografía puramente en JavaScript `crypto-js` para aplicar cifrado de grado militar **AES (Advanced Encryption Standard)** con una clave secreta que se lee de las variables de entorno `.env.test` / `.env.prod`.
* El string resultante encriptado se almacena en el dispositivo a través de `@react-native-async-storage/async-storage`.

### 4. Manejo de Variables de Entorno
Se implementó un script automático `scripts/load-env.js` que se ejecuta antes de compilar la app:
* Lee el archivo `.env.test` (desarrollo/testing) o `.env.prod` (producción) según la variable `APP_ENV`.
* Genera dinámicamente un archivo TypeScript tipado y no editable en git (`env.ts`).

---

## 🛠️ Cómo Iniciar el Proyecto Localmente

### Prerrequisitos en macOS / Windows
Asegúrate de tener instalados los SDK nativos correspondientes (Xcode para iOS, Android Studio / SDK para Android), Node.js y CocoaPods.

1. **Instalar dependencias del proyecto:**
   ```bash
   cd Wompi_test_front
   npm install
   ```

2. **Instalar dependencias nativas (iOS solamente):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Ejecutar servidor de desarrollo (Metro):**
   ```bash
   npm run start
   ```

4. **Compilar y ejecutar en emulador/dispositivo:**
   * **iOS (Simulador):**
     ```bash
     npm run ios
     ```
   * **Android (Emulador):**
     ```bash
     npm run android
     ```

---

## 🧪 Pruebas Unitarias y Cobertura (Jest)

El proyecto cuenta con una cobertura integral de pruebas unitarias que validan la lógica de negocio, las utilidades de responsividad, el cifrado seguro y el ciclo de vida de Redux (reducers, actions y thunks asíncronos), superando el requisito del **80% de cobertura**.

### Comando para correr las pruebas y generar cobertura:
```bash
npm run test -- --coverage
```

### Resultados de Cobertura de Pruebas:

```text
File                                           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------------------------------|---------|----------|---------|---------|-------------------
All files                                            |   94.33 |    85.42 |   95.06 |   94.15 |                   
 Wompi_test_front                                    |   86.95 |    83.33 |     100 |   86.66 |                   
  App.tsx                                            |   86.66 |    83.33 |     100 |   86.36 | 32-35,60-61,73,97 
  env.ts                                             |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/components                     |   95.45 |     87.5 |     100 |   95.45 |                   
  BottomTabBar.tsx                                   |   100 |      100 |     100 |     100 |                   
  RootContainer.tsx                                  |   100 |    83.33 |     100 |     100 | 40                
  TabBarIcon.tsx                                     |      90 |     87.5 |     100 |      90 | 54                
 Wompi_test_front/src/features/auth/navigation       |     100 |      100 |     100 |     100 |                   
  AuthNavigator.tsx                                  |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/features/auth/screens          |     100 |      100 |     100 |     100 |                   
  LoginScreen.tsx                                    |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/features/onboarding/navigation |     100 |      100 |     100 |     100 |                   
  OnboardingNavigator.tsx                            |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/features/onboarding/screens    |     100 |      100 |     100 |     100 |                   
  OnboardingScreen.tsx                               |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/features/payment/navigation    |   81.81 |       50 |     100 |   81.81 |                   
  PaymentNavigator.tsx                               |   81.81 |       50 |     100 |   81.81 | 38,42             
 Wompi_test_front/src/features/payment/screens       |   94.49 |    88.88 |   80.95 |   94.28 |                   
  HistoryScreen.tsx                                  |   95.23 |    71.42 |   88.88 |      95 | 106               
  PaymentScreen.tsx                                  |   96.61 |     91.3 |   85.71 |   96.49 | 79,253            
  StatusScreen.tsx                                   |   89.65 |    85.71 |      60 |   89.28 | 20-21,117         
 Wompi_test_front/src/features/payment/store         |     100 |      100 |     100 |     100 |                   
  paymentSlice.ts                                    |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/features/products/navigation   |     100 |      100 |     100 |     100 |                   
  ProductsNavigator.tsx                              |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/features/products/screens      |     100 |      100 |     100 |     100 |                   
  ProductsScreen.tsx                                 |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/locales                        |   63.63 |       40 |     100 |   63.63 |                   
  i18n.ts                                            |   63.63 |       40 |     100 |   63.63 | 18-19,27-30       
 Wompi_test_front/src/store                          |     100 |      100 |     100 |     100 |                   
  index.ts                                           |     100 |      100 |     100 |     100 |                   
 Wompi_test_front/src/theme                          |     100 |       50 |     100 |     100 |                   
  theme.ts                                           |     100 |       50 |     100 |     100 | 82                
 Wompi_test_front/src/utils                          |   97.77 |    73.33 |     100 |   97.77 |                   
  responsive.ts                                      |   92.85 |    66.66 |     100 |   92.85 | 40                
  security.ts                                        |     100 |    83.33 |     100 |     100 | 7                 
-----------------------------------------------------|---------|----------|---------|---------|-------------------
```

> **Nota sobre Cobertura**: Gracias a las pruebas interactivas de renderizado y simulación de flujos de interacción de formularios, la cobertura total del proyecto supera holgadamente el requisito de la prueba técnica, reportando un **94.33%** de cobertura general.
