import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, SPACING } from '../theme/theme';
import { scale, verticalScale } from '../utils/responsive';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

/**
 * SplashScreen animado premium en JavaScript puro.
 * Utiliza el Native Driver de React Native para animaciones fluidas a 60fps
 * sin añadir dependencias nativas de iOS o Android.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { t } = useTranslation();

  // Valores de animación
  const logoTranslateX = useRef(new Animated.Value(-width)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isTest = typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'test';
    const useNative = !isTest;

    // 1. Entrada del logo (de izquierda a centro con rebote)
    Animated.spring(logoTranslateX, {
      toValue: 0,
      tension: 10,
      friction: 4.5,
      useNativeDriver: useNative,
    }).start();

    // 2. Simulación de carga en la barra de progreso (0% a 100% en 3 segundos)
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // 3. Secuencia maestra de tiempo de espera antes de la salida suave
    Animated.sequence([
      Animated.delay(3200), // Mantiene la pantalla fija por 3.2 segundos mínimos
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 800, // Desvanecimiento extra suave de 0.8 segundos
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [logoTranslateX, progressWidth, containerOpacity, onAnimationComplete]);

  // Interpolación de la barra de progreso
  const animatedProgressWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]} testID="splash-container">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Círculos decorativos de fondo con difuminado suave */}
      <View style={styles.glowCircle1} />
      <View style={styles.glowCircle2} />

      <View style={styles.content}>
        {/* Contenedor del Logo Animado (Rebote desde la izquierda) */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ translateX: logoTranslateX }],
            },
          ]}
          testID="splash-logo-container"
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>W</Text>
          </View>
        </Animated.View>

        {/* Textos de Marca Animados */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.brandTitle}>{t('auth.brand_name')}</Text>
          <Text style={styles.brandSubtitle}>{t('auth.brand_slogan')}</Text>
        </Animated.View>
      </View>

      {/* Línea de carga premium en la base de la pantalla */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: animatedProgressWidth,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  logoCircle: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra premium
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoText: {
    fontSize: scale(48),
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  brandTitle: {
    fontSize: scale(28),
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
    marginTop: scale(6),
  },
  // Brillos de fondo premium
  glowCircle1: {
    position: 'absolute',
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: 'rgba(91, 33, 182, 0.12)', // Púrpura traslúcido
    top: '20%',
    left: '-10%',
  },
  glowCircle2: {
    position: 'absolute',
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: 'rgba(16, 185, 129, 0.08)', // Verde esmeralda traslúcido
    bottom: '15%',
    right: '-15%',
  },
  // Contenedor de barra de carga
  progressContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    width: width * 0.5,
    height: scale(4),
    backgroundColor: COLORS.surface,
    borderRadius: scale(2),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: scale(2),
  },
});

export default SplashScreen;
