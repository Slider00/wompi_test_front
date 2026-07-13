import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/locales/i18n';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTransactions } from './src/features/payment/store/paymentSlice';
import { ProductsNavigator } from './src/features/products/navigation/ProductsNavigator';
import { PaymentNavigator, PaymentSubScreen } from './src/features/payment/navigation/PaymentNavigator';
import { AuthNavigator } from './src/features/auth/navigation/AuthNavigator';
import { OnboardingNavigator } from './src/features/onboarding/navigation/OnboardingNavigator';
import { BottomTabBar } from './src/components/BottomTabBar';
import { SplashScreen } from './src/components/SplashScreen';
import { GLOBAL_STYLES } from './src/theme/theme';

import { Security } from './src/utils/security';

import { Header } from './src/components/Header';

type Tab = 'PRODUCTS' | 'PAYMENT' | 'HISTORY';

function AppContent() {
  const dispatch = useAppDispatch();
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authInitialScreen, setAuthInitialScreen] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activeTab, setActiveTab] = useState<Tab>('PRODUCTS');
  const [paymentScreen, setPaymentScreen] = useState<PaymentSubScreen>('PAYMENT');

  const { t } = useTranslation();
  const isAppUnlocked = isAuthenticated || isGuest;

  // Verificar si ya completó el Onboarding y si tiene sesión activa
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const onboardingValue = await AsyncStorage.getItem('has_completed_onboarding');
        if (onboardingValue === 'true') {
          setHasCompletedOnboarding(true);
        }

        const token = await Security.getSecureItem('auth_token');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('[App] Error al inicializar la aplicación:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    bootstrapAsync();
  }, []);

  // Carga inicial del historial cifrado tras autenticación exitosa
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadTransactions());
    }
  }, [dispatch, isAuthenticated]);

  const handleTabChange = (tab: 'PRODUCTS' | 'PAYMENT' | 'STATUS' | 'HISTORY') => {
    if (tab === 'STATUS') {
      return;
    }
    if (isGuest && (tab === 'PAYMENT' || tab === 'HISTORY')) {
      setAuthInitialScreen('REGISTER');
      setIsGuest(false);
      Alert.alert(
        t('auth.register_required_to_buy') || 'Registro Requerido',
        t('auth.register_required_to_buy') || 'Debes registrarte o iniciar sesión para acceder a esta sección.'
      );
      return;
    }
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'PRODUCTS':
        return (
          <ProductsNavigator
            onNavigateToPayment={() => {
              if (isGuest) {
                setAuthInitialScreen('REGISTER');
                setIsGuest(false);
                Alert.alert(
                  t('auth.register_required_to_buy') || 'Registro Requerido',
                  t('auth.register_required_to_buy') || 'Debes registrarte o iniciar sesión para realizar una compra.'
                );
                return;
              }
              setActiveTab('PAYMENT');
            }}
          />
        );
      case 'PAYMENT':
        return (
          <PaymentNavigator
            initialScreen="PAYMENT"
            onScreenChange={setPaymentScreen}
            onNavigateToProducts={() => setActiveTab('PRODUCTS')}
          />
        );
      case 'HISTORY':
        return (
          <PaymentNavigator
            initialScreen="HISTORY"
            onScreenChange={setPaymentScreen}
            onNavigateToProducts={() => setActiveTab('PRODUCTS')}
          />
        );
      default:
        return (
          <ProductsNavigator
            onNavigateToPayment={() => {
              if (isGuest) {
                setAuthInitialScreen('REGISTER');
                setIsGuest(false);
                Alert.alert(
                  t('auth.register_required_to_buy') || 'Registro Requerido',
                  t('auth.register_required_to_buy') || 'Debes registrarte o iniciar sesión para realizar una compra.'
                );
                return;
              }
              setActiveTab('PAYMENT');
            }}
          />
        );
    }
  };

  const shouldHideTabBar = activeTab === 'PAYMENT' && paymentScreen === 'STATUS';
  const currentMenuHighlight = activeTab === 'PAYMENT' && paymentScreen === 'HISTORY' ? 'HISTORY' : activeTab;

  const renderContent = () => {
    if (checkingOnboarding) {
      return <View style={GLOBAL_STYLES.container} />;
    }

    if (!hasCompletedOnboarding) {
      const handleOnboardingComplete = async () => {
        try {
          await AsyncStorage.setItem('has_completed_onboarding', 'true');
          setHasCompletedOnboarding(true);
        } catch (error) {
          console.error('[App] Error al guardar onboarding:', error);
          setHasCompletedOnboarding(true); // Permitir continuar en caso de error
        }
      };
      return <OnboardingNavigator onComplete={handleOnboardingComplete} />;
    }

    if (!isAppUnlocked) {
      return (
        <AuthNavigator 
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setIsGuest(false);
          }} 
          onEnterAsGuest={() => {
            setIsGuest(true);
          }}
          initialScreen={authInitialScreen}
        />
      );
    }

    return (
      <View style={GLOBAL_STYLES.container}>
        {/* Header global de la aplicación */}
        <Header 
          onLogout={() => {
            setIsAuthenticated(false);
            setIsGuest(false);
            setAuthInitialScreen('LOGIN');
          }} 
        />

        {/* Contenido principal de la pantalla */}
        <View style={{ flex: 1 }}>
          {renderActiveTab()}
        </View>
        
        {/* Menú inferior global */}
        {!shouldHideTabBar && (
          <BottomTabBar currentScreen={currentMenuHighlight} onNavigate={handleTabChange} />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      {showSplash && (
        <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
