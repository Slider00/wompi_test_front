import React from 'react';
import { OnboardingScreen } from '../screens/OnboardingScreen';

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

/**
 * Navegador/Router modular del módulo de Onboarding.
 * Encapsula la lógica de presentación inicial de la app de forma independiente.
 */
export const OnboardingNavigator: React.FC<OnboardingNavigatorProps> = ({ onComplete }) => {
  return <OnboardingScreen onComplete={onComplete} />;
};

export default OnboardingNavigator;
