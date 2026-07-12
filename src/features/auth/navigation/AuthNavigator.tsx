import React, { useState } from 'react';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OtpScreen } from '../screens/OtpScreen';

interface AuthNavigatorProps {
  onLoginSuccess: () => void;
}

type AuthRoute = 'LOGIN' | 'REGISTER' | 'OTP';

/**
 * Navegador/Router modular del módulo de Autenticación.
 * Encapsula la lógica de acceso de usuarios de forma independiente.
 */
export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onLoginSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<AuthRoute>('LOGIN');
  const [targetEmail, setTargetEmail] = useState('');
  const [flowType, setFlowType] = useState<'REGISTER' | 'RECOVERY'>('REGISTER');

  const handleRegisterSuccess = (email: string) => {
    setTargetEmail(email);
    setFlowType('REGISTER');
    setCurrentScreen('OTP');
  };

  const handleVerifySuccess = (code: string) => {
    if (flowType === 'REGISTER') {
      onLoginSuccess();
    }
  };

  switch (currentScreen) {
    case 'LOGIN':
      return (
        <LoginScreen
          onLoginSuccess={onLoginSuccess}
          onGoToRegister={() => setCurrentScreen('REGISTER')}
        />
      );
    case 'REGISTER':
      return (
        <RegisterScreen
          onGoToLogin={() => setCurrentScreen('LOGIN')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    case 'OTP':
      return (
        <OtpScreen
          targetEmail={targetEmail}
          flowType={flowType}
          onVerifySuccess={handleVerifySuccess}
          onGoBack={() => setCurrentScreen(flowType === 'REGISTER' ? 'REGISTER' : 'LOGIN')}
        />
      );
    default:
      return (
        <LoginScreen
          onLoginSuccess={onLoginSuccess}
          onGoToRegister={() => setCurrentScreen('REGISTER')}
        />
      );
  }
};

export default AuthNavigator;
