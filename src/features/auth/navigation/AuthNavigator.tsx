import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

interface AuthNavigatorProps {
  onLoginSuccess: () => void;
  onEnterAsGuest: () => void;
  initialScreen?: 'LOGIN' | 'REGISTER';
}

type AuthRoute = 'LOGIN' | 'REGISTER';

/**
 * Navegador/Router modular del módulo de Autenticación.
 * Encapsula la lógica de acceso de usuarios de forma independiente.
 */
export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ 
  onLoginSuccess, 
  onEnterAsGuest, 
  initialScreen = 'LOGIN' 
}) => {
  const [currentScreen, setCurrentScreen] = useState<AuthRoute>(initialScreen);

  useEffect(() => {
    setCurrentScreen(initialScreen);
  }, [initialScreen]);

  const handleRegisterSuccess = (email: string) => {
    Alert.alert(
      'Registro Exitoso',
      'Tu cuenta ha sido creada. Ya puedes iniciar sesión con tu correo y contraseña.',
      [{ text: 'Aceptar' }]
    );
    setCurrentScreen('LOGIN');
  };

  switch (currentScreen) {
    case 'LOGIN':
      return (
        <LoginScreen
          onLoginSuccess={onLoginSuccess}
          onGoToRegister={() => setCurrentScreen('REGISTER')}
          onEnterAsGuest={onEnterAsGuest}
        />
      );
    case 'REGISTER':
      return (
        <RegisterScreen
          onGoToLogin={() => setCurrentScreen('LOGIN')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    default:
      return (
        <LoginScreen
          onLoginSuccess={onLoginSuccess}
          onGoToRegister={() => setCurrentScreen('REGISTER')}
          onEnterAsGuest={onEnterAsGuest}
        />
      );
  }
};

export default AuthNavigator;
