import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { TextInput, TouchableOpacity } from 'react-native';
import { store } from '../src/store';
import { RootContainer } from '../src/components/RootContainer';
import { PaymentScreen } from '../src/features/payment/screens/PaymentScreen';
import { StatusScreen } from '../src/features/payment/screens/StatusScreen';
import { HistoryScreen } from '../src/features/payment/screens/HistoryScreen';
import { setActiveTransaction, saveNewTransaction } from '../src/features/payment/store/paymentSlice';
import { ProductsScreen } from '../src/features/products/screens/ProductsScreen';
import { ProductsNavigator } from '../src/features/products/navigation/ProductsNavigator';
import { PaymentNavigator } from '../src/features/payment/navigation/PaymentNavigator';
import { LoginScreen } from '../src/features/auth/screens/LoginScreen';
import { RegisterScreen } from '../src/features/auth/screens/RegisterScreen';
import { OtpScreen } from '../src/features/auth/screens/OtpScreen';
import { AuthNavigator } from '../src/features/auth/navigation/AuthNavigator';
import { OnboardingScreen } from '../src/features/onboarding/screens/OnboardingScreen';
import { OnboardingNavigator } from '../src/features/onboarding/navigation/OnboardingNavigator';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { TabBarIcon } from '../src/components/TabBarIcon';
import { SplashScreen } from '../src/components/SplashScreen';
import { Header } from '../src/components/Header';

// Mock del servicio de autenticación para evitar peticiones HTTP reales en los tests
jest.mock('../src/features/auth/services/authService', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({
      access_token: 'mocked_token',
      user: { id: '1', email: 'test@wompi.com', name: 'Test User' },
    }),
    register: jest.fn().mockResolvedValue({
      id: '1',
      email: 'test@wompi.com',
      name: 'Test User',
    }),
    sendOtp: jest.fn().mockResolvedValue({
      message: 'OTP sent',
    }),
    verifyOtp: jest.fn((email, code) => {
      if (code === '999999') {
        return Promise.reject(new Error('Código OTP inválido o expirado'));
      }
      return Promise.resolve({ success: true, message: 'OTP verificado' });
    }),
  },
}));

// Mock de FlatList para evitar temporizadores asíncronos de la lista virtualizada nativa en los tests
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');
  const MockFlatList = ({ data, renderItem, keyExtractor, ListEmptyComponent }: any) => {
    if (!data || data.length === 0) {
      return <ScrollView>{ListEmptyComponent || null}</ScrollView>;
    }
    return (
      <ScrollView>
        {data.map((item: any, index: number) => {
          const element = renderItem({ item, index });
          return React.cloneElement(element, {
            key: keyExtractor ? keyExtractor(item, index) : index.toString(),
          });
        })}
      </ScrollView>
    );
  };
  return {
    __esModule: true,
    default: MockFlatList,
  };
});

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const storeData: Record<string, string> = {};
  return {
    setItem: jest.fn(async (key: string, value: string) => {
      storeData[key] = value;
    }),
    getItem: jest.fn(async (key: string) => {
      return storeData[key] || null;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete storeData[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(storeData).forEach((key) => delete storeData[key]);
    }),
  };
});

// Mock de react-native-safe-area-context para evitar que SafeAreaProvider retorne null en los tests
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children, style }: any) => <View style={style}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  };
});

// Mock de react-i18next para traducción en tests
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'es',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

describe('UI Component Render Tests', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('RootContainer renders correctly with children', () => {
    const component = ReactTestRenderer.create(
      <RootContainer scrollEnabled={true}>
        <React.Fragment />
      </RootContainer>
    );
    expect(component.toJSON()).toBeDefined();
  });

  test('RootContainer renders correctly without scroll', () => {
    const component = ReactTestRenderer.create(
      <RootContainer scrollEnabled={false}>
        <React.Fragment />
      </RootContainer>
    );
    expect(component.toJSON()).toBeDefined();
  });

  test('Header renders correctly and triggers logout callback', async () => {
    const mockLogout = jest.fn();
    let component: any;

    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(<Header onLogout={mockLogout} />);
    });
    
    expect(component.toJSON()).toBeDefined();
    
    // Buscar botón de cerrar sesión
    const logoutBtn = component.root.findByProps({ testID: 'header-logout-btn' });
    expect(logoutBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await logoutBtn.props.onPress();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('PaymentScreen renders correctly', async () => {
    let component: any;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <PaymentScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('PaymentScreen form validation failures', async () => {
    let component: any;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <PaymentScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });

    const buttons = component.root.findAllByType(TouchableOpacity);
    const payButton = buttons[0]; // "Pagar con Wompi"
    
    await ReactTestRenderer.act(async () => {
      payButton.props.onPress();
    });

    // No debe haber navegado por validaciones fallidas
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('PaymentScreen form submission, formatting, and success navigation', async () => {
    let component: any;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <PaymentScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });

    const inputs = component.root.findAllByType(TextInput);
    
    // Inputs: 0: amount, 1: email, 2: cardholder, 3: cardnumber, 4: expiry, 5: cvv
    await ReactTestRenderer.act(() => {
      inputs[0].props.onChangeText('50000');
      inputs[1].props.onChangeText('test@wompi.com');
      inputs[2].props.onChangeText('JUAN PEREZ');
      inputs[3].props.onChangeText('4111222233334444');
      inputs[4].props.onChangeText('1228'); // MM/AA
      inputs[5].props.onChangeText('123');
    });

    const buttons = component.root.findAllByType(TouchableOpacity);
    const payButton = buttons[0]; // "Pagar con Wompi"

    await ReactTestRenderer.act(async () => {
      payButton.props.onPress();
    });

    // Debe haber navegado a la pantalla de recibo
    expect(mockNavigate).toHaveBeenCalledWith('STATUS');
  });

  test('StatusScreen renders correctly when no active transaction', async () => {
    let component: any;
    await ReactTestRenderer.act(() => {
      store.dispatch(setActiveTransaction(null));
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <StatusScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('StatusScreen renders correctly with APPROVED transaction', async () => {
    let component: any;
    const tx = {
      id: 'tx-111',
      amount: 12000,
      currency: 'COP',
      cardHolder: 'Diana Prince',
      cardMaskedNumber: '**** **** **** 1111',
      reference: 'WMP-APPROVED',
      status: 'APPROVED' as const,
      createdAt: new Date().toISOString(),
    };

    await ReactTestRenderer.act(() => {
      store.dispatch(setActiveTransaction(tx));
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <StatusScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('StatusScreen renders correctly with PENDING transaction', async () => {
    let component: any;
    const tx = {
      id: 'tx-112',
      amount: 12000,
      currency: 'COP',
      cardHolder: 'Diana Prince',
      cardMaskedNumber: '**** **** **** 1111',
      reference: 'WMP-PENDING',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    await ReactTestRenderer.act(() => {
      store.dispatch(setActiveTransaction(tx));
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <StatusScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('StatusScreen renders correctly with DECLINED transaction', async () => {
    let component: any;
    const tx = {
      id: 'tx-113',
      amount: 12000,
      currency: 'COP',
      cardHolder: 'Diana Prince',
      cardMaskedNumber: '**** **** **** 1111',
      reference: 'WMP-DECLINED',
      status: 'DECLINED' as const,
      createdAt: new Date().toISOString(),
    };

    await ReactTestRenderer.act(() => {
      store.dispatch(setActiveTransaction(tx));
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <StatusScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('HistoryScreen renders correctly with empty and non-empty transactions', async () => {
    let component: any;

    // 1. Renderizar vacía
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <HistoryScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();

    // 2. Agregar transacciones (Aprobadas, Pendientes y Declinadas) y renderizar nuevamente
    const tx1 = {
      amount: 15000,
      currency: 'COP',
      cardHolder: 'Diana Prince',
      cardMaskedNumber: '**** **** **** 1111',
      reference: 'WMP-TX-1',
      status: 'APPROVED' as const,
    };
    const tx2 = {
      amount: 25000,
      currency: 'COP',
      cardHolder: 'Clark Kent',
      cardMaskedNumber: '**** **** **** 2222',
      reference: 'WMP-TX-2',
      status: 'DECLINED' as const,
    };

    await ReactTestRenderer.act(async () => {
      await store.dispatch(saveNewTransaction(tx1));
      await store.dispatch(saveNewTransaction(tx2));
    });

    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <HistoryScreen onNavigate={mockNavigate} />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('BottomTabBar renders correctly and navigates on tab press', () => {
    let component: any;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <BottomTabBar currentScreen="PAYMENT" onNavigate={mockNavigate} />
      );
    });
    expect(component.toJSON()).toBeDefined();

    const buttons = component.root.findAllByType(TouchableOpacity);
    ReactTestRenderer.act(() => {
      buttons[0].props.onPress(); // Ir a PRODUCTS
    });
    expect(mockNavigate).toHaveBeenCalledWith('PRODUCTS');
  });

  test('TabBarIcon renders card, history and products states correctly', () => {
    let cardActive: any;
    let cardInactive: any;
    let historyActive: any;
    let historyInactive: any;
    let productsActive: any;
    let productsInactive: any;

    ReactTestRenderer.act(() => {
      cardActive = ReactTestRenderer.create(<TabBarIcon name="card" active={true} />);
      cardInactive = ReactTestRenderer.create(<TabBarIcon name="card" active={false} />);
      historyActive = ReactTestRenderer.create(<TabBarIcon name="history" active={true} />);
      historyInactive = ReactTestRenderer.create(<TabBarIcon name="history" active={false} />);
      productsActive = ReactTestRenderer.create(<TabBarIcon name="products" active={true} />);
      productsInactive = ReactTestRenderer.create(<TabBarIcon name="products" active={false} />);
    });
    
    expect(cardActive.toJSON()).toBeDefined();
    expect(cardInactive.toJSON()).toBeDefined();
    expect(historyActive.toJSON()).toBeDefined();
    expect(historyInactive.toJSON()).toBeDefined();
    expect(productsActive.toJSON()).toBeDefined();
    expect(productsInactive.toJSON()).toBeDefined();
  });

  test('ProductsScreen and ProductsNavigator render correctly', () => {
    let screen: any;
    let navigator: any;
    const mockNavigate = jest.fn();
    ReactTestRenderer.act(() => {
      screen = ReactTestRenderer.create(
        <Provider store={store}>
          <ProductsScreen onNavigateToPayment={mockNavigate} />
        </Provider>
      );
      navigator = ReactTestRenderer.create(
        <Provider store={store}>
          <ProductsNavigator onNavigateToPayment={mockNavigate} />
        </Provider>
      );
    });
    expect(screen.toJSON()).toBeDefined();
    expect(navigator.toJSON()).toBeDefined();
  });

  test('PaymentNavigator renders correctly', async () => {
    let component: any;
    await ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <Provider store={store}>
          <PaymentNavigator initialScreen="PAYMENT" />
        </Provider>
      );
    });
    expect(component.toJSON()).toBeDefined();
  });

  test('LoginScreen and AuthNavigator render correctly and handle submit flows', async () => {
    const mockSuccess = jest.fn();
    let component: any;
    
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<AuthNavigator onLoginSuccess={mockSuccess} />);
    });
    expect(component.toJSON()).toBeDefined();

    const inputs = component.root.findAllByType(TextInput);
    const toggleVisibilityBtn = component.root.findByProps({ testID: 'toggle-password-visibility' });
    const buttons = component.root.findAllByType(TouchableOpacity);
    const submitBtn = buttons.find((btn: any) => btn !== toggleVisibilityBtn)!;

    // 1. Probar alternar visibilidad de contraseña
    expect(inputs[1].props.secureTextEntry).toBe(true);
    ReactTestRenderer.act(() => {
      toggleVisibilityBtn.props.onPress();
    });
    expect(inputs[1].props.secureTextEntry).toBe(false);
    ReactTestRenderer.act(() => {
      toggleVisibilityBtn.props.onPress();
    });
    expect(inputs[1].props.secureTextEntry).toBe(true);

    // 2. Submit sin datos (errores)
    await ReactTestRenderer.act(async () => {
      await submitBtn.props.onPress();
    });
    expect(component.toJSON()).toBeDefined();

    // 3. Llenar email y clave inválidos
    ReactTestRenderer.act(() => {
      inputs[0].props.onChangeText('invalid-email');
      inputs[1].props.onChangeText('123'); // muy corta
    });
    await ReactTestRenderer.act(async () => {
      await submitBtn.props.onPress();
    });

    // 4. Llenar email y clave válidos y simular login
    ReactTestRenderer.act(() => {
      inputs[0].props.onChangeText('admin@wompi.co');
      inputs[1].props.onChangeText('password123');
    });

    await ReactTestRenderer.act(async () => {
      await submitBtn.props.onPress();
    });
    
    expect(mockSuccess).toHaveBeenCalled();
  });

  test('OnboardingScreen and OnboardingNavigator render correctly and handle next/skip flows', () => {
    const mockComplete = jest.fn();
    let component: any;
    
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<OnboardingNavigator onComplete={mockComplete} />);
    });
    expect(component.toJSON()).toBeDefined();

    // 1. Probar hacer click en "Siguiente" para recorrer las páginas
    const nextBtn = component.root.findByProps({ testID: 'onboarding-action' });

    ReactTestRenderer.act(() => {
      nextBtn.props.onPress(); // Ir a Página 2
    });
    ReactTestRenderer.act(() => {
      nextBtn.props.onPress(); // Ir a Página 3
    });

    ReactTestRenderer.act(() => {
      nextBtn.props.onPress(); // Completar (en página 3 el texto cambia a "Comenzar")
    });
    expect(mockComplete).toHaveBeenCalledTimes(1);

    // 2. Probar hacer click en "Omitir" desde el inicio
    const mockComplete2 = jest.fn();
    let component2: any;
    ReactTestRenderer.act(() => {
      component2 = ReactTestRenderer.create(<OnboardingNavigator onComplete={mockComplete2} />);
    });
    const skipBtn = component2.root.findByProps({ testID: 'onboarding-skip' });

    ReactTestRenderer.act(() => {
      skipBtn.props.onPress();
    });
    expect(mockComplete2).toHaveBeenCalledTimes(1);
  });

  test('RegisterScreen renders correctly and handles error and success validation flows', async () => {
    const mockGoToLogin = jest.fn();
    const mockRegisterSuccess = jest.fn();
    let component: any;

    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <RegisterScreen onGoToLogin={mockGoToLogin} onRegisterSuccess={mockRegisterSuccess} />
      );
    });
    expect(component.toJSON()).toBeDefined();

    const inputs = component.root.findAllByType(TextInput);
    const submitBtn = component.root.findByProps({ testID: 'register-submit' });
    const linkBtn = component.root.findByProps({ testID: 'already-have-account' });

    // 1. Alternar visibilidad de contraseña
    const togglePassBtn = component.root.findByProps({ testID: 'toggle-password-visibility' });
    const toggleConfirmPassBtn = component.root.findByProps({ testID: 'toggle-confirm-password-visibility' });
    
    expect(inputs[2].props.secureTextEntry).toBe(true);
    ReactTestRenderer.act(() => {
      togglePassBtn.props.onPress();
    });
    expect(inputs[2].props.secureTextEntry).toBe(false);

    expect(inputs[3].props.secureTextEntry).toBe(true);
    ReactTestRenderer.act(() => {
      toggleConfirmPassBtn.props.onPress();
    });
    expect(inputs[3].props.secureTextEntry).toBe(false);

    // 2. Click en link a Login
    ReactTestRenderer.act(() => {
      linkBtn.props.onPress();
    });
    expect(mockGoToLogin).toHaveBeenCalled();

    // 3. Registrarse con campos vacíos (error)
    await ReactTestRenderer.act(async () => {
      await submitBtn.props.onPress();
    });
    expect(component.toJSON()).toBeDefined();

    // 4. Llenar campos inválidos (email malo, claves diferentes)
    ReactTestRenderer.act(() => {
      inputs[0].props.onChangeText('Julian');
      inputs[1].props.onChangeText('bademail');
      inputs[2].props.onChangeText('123456');
      inputs[3].props.onChangeText('1234567');
    });
    await ReactTestRenderer.act(async () => {
      await submitBtn.props.onPress();
    });

    // 5. Llenar campos válidos y simular registro
    ReactTestRenderer.act(() => {
      inputs[0].props.onChangeText('Julian Perez');
      inputs[1].props.onChangeText('newuser@example.com');
      inputs[2].props.onChangeText('validpassword');
      inputs[3].props.onChangeText('validpassword');
    });

    // Ejecutar registro asíncrono
    await ReactTestRenderer.act(async () => {
      await submitBtn.props.onPress();
    });
    // Forzar resolución de promesas pendientes
    expect(mockRegisterSuccess).toHaveBeenCalledWith('newuser@example.com');
  });

  test('OtpScreen renders correctly and handles verify, resend and digits focus switching', async () => {
    const mockVerifySuccess = jest.fn();
    const mockGoBack = jest.fn();
    let component: any;

    jest.useFakeTimers();

    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <OtpScreen
          onVerifySuccess={mockVerifySuccess}
          targetEmail="test@example.com"
          flowType="REGISTER"
          onGoBack={mockGoBack}
        />
      );
    });
    expect(component.toJSON()).toBeDefined();

    const inputs = component.root.findAllByType(TextInput);
    const backBtn = component.root.findByProps({ testID: 'otp-back' });
    const verifyBtn = component.root.findByProps({ testID: 'otp-submit' });

    // 1. Click en volver
    ReactTestRenderer.act(() => {
      backBtn.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();

    // 2. Click en verificar incompleto
    await ReactTestRenderer.act(async () => {
      await verifyBtn.props.onPress();
    });
    expect(component.toJSON()).toBeDefined();

    // 3. Escribir en inputs (validar números y autofoco)
    const mockFocus = jest.fn();
    inputs[1].props.ref = { current: { focus: mockFocus } };
    ReactTestRenderer.act(() => {
      inputs[0].props.onChangeText('1');
    });

    // Simular borrar con Backspace
    ReactTestRenderer.act(() => {
      inputs[1].props.onKeyPress({ nativeEvent: { key: 'Backspace' } });
    });

    // 4. Llenar OTP incorrecto '999999' y verificar
    ReactTestRenderer.act(() => { inputs[0].props.onChangeText('9'); });
    ReactTestRenderer.act(() => { inputs[1].props.onChangeText('9'); });
    ReactTestRenderer.act(() => { inputs[2].props.onChangeText('9'); });
    ReactTestRenderer.act(() => { inputs[3].props.onChangeText('9'); });
    ReactTestRenderer.act(() => { inputs[4].props.onChangeText('9'); });
    ReactTestRenderer.act(() => { inputs[5].props.onChangeText('9'); });
    
    await ReactTestRenderer.act(async () => {
      await verifyBtn.props.onPress();
    });
    expect(mockVerifySuccess).not.toHaveBeenCalled();

    // Avanzar el tiempo 60 segundos para terminar el contador del OTP y mostrar el botón de Reenvío
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(60000);
    });

    const resendBtn = component.root.findByProps({ testID: 'otp-resend' });

    // 5. Reenviar OTP
    const originalAlert = (globalThis as any).alert;
    (globalThis as any).alert = jest.fn();
    await ReactTestRenderer.act(async () => {
      await resendBtn.props.onPress();
    });
    expect((globalThis as any).alert).toHaveBeenCalled();
    (globalThis as any).alert = originalAlert;

    // Al reenviar, se reinicia el temporizador a 60, por lo que el botón se oculta de nuevo.
    // Avanzamos 60 segundos otra vez para que vuelva a aparecer y nos permita re-llenar/verificar.
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(60000);
    });

    // 6. Llenar OTP correcto '123456' y verificar
    ReactTestRenderer.act(() => { inputs[0].props.onChangeText('1'); });
    ReactTestRenderer.act(() => { inputs[1].props.onChangeText('2'); });
    ReactTestRenderer.act(() => { inputs[2].props.onChangeText('3'); });
    ReactTestRenderer.act(() => { inputs[3].props.onChangeText('4'); });
    ReactTestRenderer.act(() => { inputs[4].props.onChangeText('5'); });
    ReactTestRenderer.act(() => { inputs[5].props.onChangeText('6'); });

    await ReactTestRenderer.act(async () => {
      await verifyBtn.props.onPress();
    });
    expect(mockVerifySuccess).toHaveBeenCalledWith('123456');
    
    component.unmount();
    jest.useRealTimers();
  });

  test('AuthNavigator handles complete register-to-otp-to-success navigation flow', async () => {
    const mockSuccess = jest.fn();
    let component: any;

    jest.useFakeTimers();

    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<AuthNavigator onLoginSuccess={mockSuccess} />);
    });
    expect(component.toJSON()).toBeDefined();

    // 1. Navegar de Login a Registro
    const toRegisterLink = component.root.findByProps({ testID: 'go-to-register' });
    ReactTestRenderer.act(() => {
      toRegisterLink.props.onPress();
    });
    expect(component.root.findByType(RegisterScreen)).toBeDefined();

    // 2. Navegar de Registro de vuelta a Login
    const toLoginLink = component.root.findByProps({ testID: 'already-have-account' });
    ReactTestRenderer.act(() => {
      toLoginLink.props.onPress();
    });
    expect(component.root.findByType(LoginScreen)).toBeDefined();

    // 3. Volver a Registro para continuar
    const toRegisterLink2 = component.root.findByProps({ testID: 'go-to-register' });
    ReactTestRenderer.act(() => {
      toRegisterLink2.props.onPress();
    });

    // 4. Completar Registro válido en RegisterScreen para transitar a OTP
    const regInputs = component.root.findAllByType(TextInput);
    const regSubmitBtn = component.root.findByProps({ testID: 'register-submit' });

    ReactTestRenderer.act(() => {
      regInputs[0].props.onChangeText('Julian Perez');
      regInputs[1].props.onChangeText('newuser@example.com');
      regInputs[2].props.onChangeText('password123');
      regInputs[3].props.onChangeText('password123');
    });

    await ReactTestRenderer.act(async () => {
      await regSubmitBtn.props.onPress();
    });

    expect(component.root.findByType(OtpScreen)).toBeDefined();

    // 5. Probar botón "Volver" en OtpScreen
    const otpBackBtn = component.root.findByProps({ testID: 'otp-back' });
    ReactTestRenderer.act(() => {
      otpBackBtn.props.onPress();
    });
    expect(component.root.findByType(RegisterScreen)).toBeDefined();

    // Volver a enviar el registro para regresar a OTP
    const regInputsRemounted = component.root.findAllByType(TextInput);
    ReactTestRenderer.act(() => {
      regInputsRemounted[0].props.onChangeText('Julian Perez');
      regInputsRemounted[1].props.onChangeText('newuser@example.com');
      regInputsRemounted[2].props.onChangeText('password123');
      regInputsRemounted[3].props.onChangeText('password123');
    });

    const regSubmitBtnRemounted = component.root.findByProps({ testID: 'register-submit' });
    await ReactTestRenderer.act(async () => {
      await regSubmitBtnRemounted.props.onPress();
    });
    expect(component.root.findByType(OtpScreen)).toBeDefined();

    // 6. Completar OTP válido en OtpScreen para gatillar onLoginSuccess
    const otpInputs = component.root.findAllByType(TextInput);
    const otpVerifyBtn = component.root.findByProps({ testID: 'otp-submit' });

    ReactTestRenderer.act(() => { otpInputs[0].props.onChangeText('1'); });
    ReactTestRenderer.act(() => { otpInputs[1].props.onChangeText('2'); });
    ReactTestRenderer.act(() => { otpInputs[2].props.onChangeText('3'); });
    ReactTestRenderer.act(() => { otpInputs[3].props.onChangeText('4'); });
    ReactTestRenderer.act(() => { otpInputs[4].props.onChangeText('5'); });
    ReactTestRenderer.act(() => { otpInputs[5].props.onChangeText('6'); });

    await ReactTestRenderer.act(async () => {
      await otpVerifyBtn.props.onPress();
    });

    expect(mockSuccess).toHaveBeenCalled();
    
    // Cleanup de temporizadores y desmonte de componentes
    component.unmount();
    jest.useRealTimers();
  });

  test('SplashScreen renders correctly and fires onAnimationComplete callback', () => {
    const mockComplete = jest.fn();
    let component: any;

    jest.useFakeTimers();
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<SplashScreen onAnimationComplete={mockComplete} />);
    });
    
    expect(component.toJSON()).toBeDefined();
    
    // Avanzar el tiempo para completar las secuencias de Animated (3000ms entrada + 1200ms hold + 600ms fadeOut)
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(mockComplete).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
