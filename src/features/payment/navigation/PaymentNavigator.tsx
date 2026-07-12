import React, { useEffect, useState } from 'react';
import { PaymentScreen } from '../screens/PaymentScreen';
import { StatusScreen } from '../screens/StatusScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

export type PaymentSubScreen = 'PAYMENT' | 'STATUS' | 'HISTORY';

interface PaymentNavigatorProps {
  initialScreen: PaymentSubScreen;
  onScreenChange?: (screen: PaymentSubScreen) => void;
}

/**
 * Navegador/Router modular del módulo de Pagos.
 * Encapsula la lógica de navegación entre el formulario de pago,
 * la pantalla de recibo (status) y el historial interno del módulo.
 */
export const PaymentNavigator: React.FC<PaymentNavigatorProps> = ({
  initialScreen,
  onScreenChange,
}) => {
  const [currentScreen, setCurrentScreen] = useState<PaymentSubScreen>(initialScreen);

  // Sincroniza la pantalla si el padre fuerza un cambio (ej. clics en la tab bar global)
  useEffect(() => {
    setCurrentScreen(initialScreen);
  }, [initialScreen]);

  // Informa al contenedor raíz sobre la pantalla activa (para poder ocultar/mostrar la tab bar)
  useEffect(() => {
    onScreenChange?.(currentScreen);
  }, [currentScreen, onScreenChange]);

  switch (currentScreen) {
    case 'PAYMENT':
      return <PaymentScreen onNavigate={setCurrentScreen} />;
    case 'STATUS':
      return <StatusScreen onNavigate={setCurrentScreen} />;
    case 'HISTORY':
      return <HistoryScreen onNavigate={setCurrentScreen} />;
    default:
      return <PaymentScreen onNavigate={setCurrentScreen} />;
  }
};

export default PaymentNavigator;
