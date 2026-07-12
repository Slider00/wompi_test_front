import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RootContainer } from '../../../components/RootContainer';
import { GLOBAL_STYLES, COLORS, SPACING, FONTS } from '../../../theme/theme';
import { scale } from '../../../utils/responsive';

export const ProductsScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RootContainer scrollEnabled={true} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={GLOBAL_STYLES.headerTitle}>{t('products.title')}</Text>
        <Text style={GLOBAL_STYLES.headerSubtitle}>{t('products.subtitle')}</Text>
      </View>

      <View style={[GLOBAL_STYLES.card, styles.placeholderCard]}>
        <Text style={styles.placeholderText}>
          {t('products.placeholder_desc')}
        </Text>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(60),
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    backgroundColor: 'transparent',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: scale(20),
  },
});

export default ProductsScreen;
