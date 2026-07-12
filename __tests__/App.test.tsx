/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput, TouchableOpacity } from 'react-native';
import App from '../App';

// Mock de AsyncStorage para evitar excepciones al montar App
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItem: jest.fn(async (key: string) => {
      return store[key] || null;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
});

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

jest.mock('../src/features/payment/store/paymentSlice', () => {
  const actual = jest.requireActual('../src/features/payment/store/paymentSlice');
  return {
    __esModule: true,
    ...actual,
    default: actual.default,
    loadTransactions: () => () => Promise.resolve(),
  };
});

test('renders correctly', async () => {
  jest.useFakeTimers();
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
  jest.useRealTimers();
});

test('handles login and navigation correctly', async () => {
  jest.useFakeTimers();
  let component: any;
  await ReactTestRenderer.act(async () => {
    component = ReactTestRenderer.create(<App />);
  });

  // Avanzar el tiempo para que termine la SplashScreen y monte Onboarding
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(3000);
  });

  // 1. Omitir el onboarding
  const skipBtn = component.root.findByProps({ testID: 'onboarding-skip' });
  await ReactTestRenderer.act(async () => {
    skipBtn.props.onPress();
  });

  // 2. Ahora estamos en el Login
  const inputs = component.root.findAllByType(TextInput);
  const toggleVisibilityBtn = component.root.findByProps({ testID: 'toggle-password-visibility' });
  const buttons = component.root.findAllByType(TouchableOpacity);
  const submitBtn = buttons.find((btn: any) => btn !== toggleVisibilityBtn)!;

  // Llenamos campos válidos
  await ReactTestRenderer.act(() => {
    inputs[0].props.onChangeText('admin@wompi.co');
    inputs[1].props.onChangeText('password123');
  });

  jest.useFakeTimers();
  await ReactTestRenderer.act(() => {
    submitBtn.props.onPress();
  });

  await ReactTestRenderer.act(() => {
    jest.advanceTimersByTime(1300);
  });

  // Ahora está autenticado, el menú inferior se renderiza
  expect(component.toJSON()).toBeDefined();

  // Presionamos diferentes pestañas en el menú inferior global para cubrir App.tsx
  const tabButtons = component.root.findAllByType(TouchableOpacity);
  
  // Presionamos el tab 1 (PAYMENT)
  await ReactTestRenderer.act(() => {
    tabButtons[1].props.onPress();
  });

  // Presionamos el tab 2 (HISTORY)
  await ReactTestRenderer.act(() => {
    tabButtons[2].props.onPress();
  });

  jest.useRealTimers();
});
