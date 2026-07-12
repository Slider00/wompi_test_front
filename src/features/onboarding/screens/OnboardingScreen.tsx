import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { RootContainer } from '../../../components/RootContainer';
import { COLORS, SPACING, FONTS, GLOBAL_STYLES, SHADOWS } from '../../../theme/theme';
import { scale, verticalScale } from '../../../utils/responsive';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: t('onboarding.page1_title'),
      description: t('onboarding.page1_desc'),
      renderIllustration: () => (
        <View style={styles.illustrationContainer}>
          {/* Ilustración CSS: Catálogo de Productos */}
          <View style={styles.catalogBase}>
            <View style={styles.catalogHeader} />
            <View style={styles.catalogGrid}>
              <View style={[styles.catalogItem, { backgroundColor: COLORS.primary }]} />
              <View style={styles.catalogItem} />
              <View style={styles.catalogItem} />
              <View style={[styles.catalogItem, { backgroundColor: COLORS.secondary }]} />
            </View>
          </View>
        </View>
      ),
    },
    {
      title: t('onboarding.page2_title'),
      description: t('onboarding.page2_desc'),
      renderIllustration: () => (
        <View style={styles.illustrationContainer}>
          {/* Ilustración CSS: Teléfono con Tarjeta de Pago */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <View style={styles.creditCardWireframe}>
              <View style={styles.cardStripe} />
              <View style={styles.cardChip} />
            </View>
            <View style={styles.successBadge}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: t('onboarding.page3_title'),
      description: t('onboarding.page3_desc'),
      renderIllustration: () => (
        <View style={styles.illustrationContainer}>
          {/* Ilustración CSS: Escudo de Seguridad Encriptado */}
          <View style={styles.shieldContainer}>
            <View style={styles.shieldOutline}>
              <View style={styles.shieldLock}>
                <View style={styles.lockShackle} />
                <View style={styles.lockBody} />
              </View>
            </View>
            <View style={styles.keyDecoration} />
          </View>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <RootContainer scrollEnabled={false} edges={['top', 'bottom', 'left', 'right']}>
      {/* Botón Omitir en la cabecera */}
      <View style={styles.header}>
        {currentPage < pages.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} testID="onboarding-skip">
            <Text style={styles.skipText}>{t('onboarding.btn_skip')}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/* Contenido del Slide */}
      <View style={styles.slideContainer}>
        {pages[currentPage].renderIllustration()}

        <View style={styles.textContainer}>
          <Text style={styles.title}>{pages[currentPage].title}</Text>
          <Text style={styles.description}>{pages[currentPage].description}</Text>
        </View>
      </View>

      {/* Pie de página: Indicador de puntos y botón siguiente */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[GLOBAL_STYLES.button, styles.actionButton]}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="onboarding-action"
        >
          <Text style={GLOBAL_STYLES.buttonText}>
            {currentPage === pages.length - 1
              ? t('onboarding.btn_start')
              : t('onboarding.btn_next')}
          </Text>
        </TouchableOpacity>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: verticalScale(40),
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  illustrationContainer: {
    height: verticalScale(200),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: scale(22),
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: verticalScale(30),
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  dot: {
    height: scale(8),
    borderRadius: scale(4),
    marginHorizontal: scale(4),
  },
  activeDot: {
    width: scale(20),
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: scale(8),
    backgroundColor: COLORS.border,
  },
  actionButton: {
    width: '100%',
  },

  /* --- Ilustración 1: Catálogo --- */
  catalogBase: {
    width: scale(140),
    height: scale(160),
    backgroundColor: COLORS.surface,
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: scale(12),
    ...SHADOWS.medium,
  },
  catalogHeader: {
    height: scale(12),
    backgroundColor: COLORS.border,
    borderRadius: scale(3),
    width: '60%',
    marginBottom: scale(16),
  },
  catalogGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catalogItem: {
    width: '46%',
    height: '38%',
    backgroundColor: COLORS.border,
    borderRadius: scale(6),
    marginBottom: '8%',
  },

  /* --- Ilustración 2: Teléfono & Tarjeta --- */
  phoneFrame: {
    width: scale(95),
    height: scale(170),
    backgroundColor: COLORS.surface,
    borderRadius: scale(16),
    borderWidth: 3,
    borderColor: COLORS.border,
    padding: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.medium,
  },
  phoneNotch: {
    width: scale(40),
    height: scale(8),
    backgroundColor: COLORS.border,
    borderBottomLeftRadius: scale(4),
    borderBottomRightRadius: scale(4),
    position: 'absolute',
    top: 0,
  },
  creditCardWireframe: {
    width: scale(110),
    height: scale(68),
    backgroundColor: COLORS.primary,
    borderRadius: scale(8),
    borderWidth: 1.5,
    borderColor: COLORS.white,
    position: 'absolute',
    top: scale(40),
    zIndex: 2,
    padding: scale(6),
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  cardStripe: {
    height: scale(10),
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '120%',
    marginLeft: scale(-6),
  },
  cardChip: {
    width: scale(12),
    height: scale(10),
    borderRadius: scale(2),
    backgroundColor: COLORS.warning,
  },
  successBadge: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: scale(20),
    borderWidth: 2,
    borderColor: COLORS.surface,
    zIndex: 3,
  },
  successCheck: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: scale(14),
  },

  /* --- Ilustración 3: Escudo --- */
  shieldContainer: {
    width: scale(120),
    height: scale(140),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shieldOutline: {
    width: scale(100),
    height: scale(120),
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderBottomLeftRadius: scale(50),
    borderBottomRightRadius: scale(50),
    borderTopLeftRadius: scale(10),
    borderTopRightRadius: scale(10),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  shieldLock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockShackle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: 3,
    borderColor: COLORS.secondary,
    marginBottom: scale(-8),
  },
  lockBody: {
    width: scale(32),
    height: scale(26),
    backgroundColor: COLORS.secondary,
    borderRadius: scale(4),
  },
  keyDecoration: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'absolute',
    bottom: scale(10),
    right: scale(10),
  },
});

export default OnboardingScreen;
