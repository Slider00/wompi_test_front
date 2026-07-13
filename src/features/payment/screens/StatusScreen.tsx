import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../store';
import { setActiveTransaction } from '../store/paymentSlice';
import { RootContainer } from '../../../components/RootContainer';
import { COLORS, SPACING, FONTS, SHADOWS, GLOBAL_STYLES } from '../../../theme/theme';
import { scale, moderateScale } from '../../../utils/responsive';

interface StatusScreenProps {
  onNavigate: (screen: 'PAYMENT' | 'STATUS' | 'HISTORY') => void;
  onNavigateToProducts?: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({ onNavigate, onNavigateToProducts }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const activeTx = useAppSelector((state) => state.payment.activeTransaction);

  const handleBack = () => {
    dispatch(setActiveTransaction(null));
    if (onNavigateToProducts) {
      onNavigateToProducts();
    } else {
      onNavigate('PAYMENT');
    }
  };

  if (!activeTx) {
    return (
      <RootContainer edges={['bottom', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('status.no_active_tx')}</Text>
          <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleBack}>
            <Text style={GLOBAL_STYLES.buttonText}>{t('btn_back')}</Text>
          </TouchableOpacity>
        </View>
      </RootContainer>
    );
  }

  const isApproved = activeTx.status === 'APPROVED';
  const isPending = activeTx.status === 'PENDING';

  let statusTitle = t('status.declined_title');
  let statusColor = COLORS.danger;
  let statusDescription = t('status.declined_desc');

  if (isApproved) {
    statusTitle = t('status.approved_title');
    statusColor = COLORS.secondary;
    statusDescription = t('status.approved_desc');
  } else if (isPending) {
    statusTitle = t('status.pending_title');
    statusColor = COLORS.warning;
    statusDescription = t('status.pending_desc');
  }

  // Formateador de Moneda según idioma
  const formatCurrency = (val: number) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <RootContainer edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Ícono de Estado Simulado */}
        <View style={[styles.iconCircle, { borderColor: statusColor }]}>
          <Text style={[styles.iconText, { color: statusColor }]}>
            {isApproved ? '✓' : isPending ? '⏳' : '✗'}
          </Text>
        </View>

        <Text style={[styles.statusTitle, { color: statusColor }]}>
          {statusTitle}
        </Text>
        <Text style={styles.statusDescription}>{statusDescription}</Text>

        {/* Detalle de la Transacción */}
        <View style={GLOBAL_STYLES.card}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{t('status.receipt_wompi_ref')}</Text>
            <Text style={styles.receiptValue}>{activeTx.reference}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{t('status.receipt_total')}</Text>
            <Text style={styles.receiptValue}>{formatCurrency(activeTx.amount)}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{t('status.receipt_card')}</Text>
            <Text style={styles.receiptValue}>{activeTx.cardMaskedNumber}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{t('status.receipt_holder')}</Text>
            <Text style={styles.receiptValue}>{activeTx.cardHolder}</Text>
          </View>

          <View style={[styles.receiptRow, styles.lastRow]}>
            <Text style={styles.receiptLabel}>{t('status.receipt_date')}</Text>
            <Text style={styles.receiptValue}>
              {new Date(activeTx.createdAt).toLocaleString(i18n.language === 'en' ? 'en-US' : 'es-CO')}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleBack}>
            <Text style={GLOBAL_STYLES.buttonText}>{t('status.btn_another_payment')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onNavigate('HISTORY')}
          >
            <Text style={styles.secondaryButtonText}>{t('status.btn_full_history')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  iconCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  iconText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
  },
  statusTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  receiptLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  receiptValue: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
export default StatusScreen;
