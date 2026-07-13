import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchBackendTransactions } from '../store/paymentSlice';
import { RootContainer } from '../../../components/RootContainer';
import { COLORS, SPACING, FONTS, SHADOWS, GLOBAL_STYLES } from '../../../theme/theme';
import { scale, moderateScale } from '../../../utils/responsive';

interface HistoryScreenProps {
  onNavigate: (screen: 'PAYMENT' | 'STATUS' | 'HISTORY') => void;
  onNavigateToProducts?: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onNavigate, onNavigateToProducts }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { transactions, loading } = useAppSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchBackendTransactions());
  }, [dispatch]);

  // Formateador de Moneda según idioma
  const formatCurrency = (val: number) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const approvedTotal = transactions
    .filter((tx) => tx.status === 'APPROVED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: COLORS.secondary, label: t('history.approved') };
      case 'PENDING':
        return { color: COLORS.warning, label: t('history.pending') };
      default:
        return { color: COLORS.danger, label: t('history.declined') };
    }
  };

  return (
    <RootContainer scrollEnabled={false} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={GLOBAL_STYLES.headerTitle}>{t('history.title')}</Text>
        <Text style={GLOBAL_STYLES.headerSubtitle}>{t('history.subtitle')}</Text>
      </View>

      {/* Resumen de Historial */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('history.approved_total')}</Text>
          <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
            {formatCurrency(approvedTotal)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('history.transactions_count')}</Text>
          <Text style={styles.summaryValue}>{transactions.length}</Text>
        </View>
      </View>

      {/* Listado */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => dispatch(fetchBackendTransactions())}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('history.empty_message')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusStyle(item.status);
          return (
            <View style={styles.txCard}>
              <View style={styles.txHeader}>
                <Text style={styles.txReference}>{item.reference}</Text>
                <Text style={[styles.txStatus, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
              
              <View style={styles.txBody}>
                <View>
                  <Text style={styles.txHolder}>{item.cardHolder}</Text>
                  <Text style={styles.txCardNumber}>{item.cardMaskedNumber}</Text>
                </View>
                <View style={styles.alignRight}>
                  <Text style={styles.txAmount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.txDate}>
                    {new Date(item.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-CO')}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Botón de Regreso */}
      <TouchableOpacity
        style={GLOBAL_STYLES.button}
        onPress={() => {
          if (onNavigateToProducts) {
            onNavigateToProducts();
          } else {
            onNavigate('PAYMENT');
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={GLOBAL_STYLES.buttonText}>{t('btn_back')}</Text>
      </TouchableOpacity>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(12),
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md + 2,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(60),
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  txCard: {
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(10),
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: SPACING.xs,
  },
  txReference: {
    color: COLORS.text,
    fontWeight: FONTS.weights.semibold,
    fontSize: FONTS.sizes.sm,
  },
  txStatus: {
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.sm,
  },
  txBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  txHolder: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
  },
  txCardNumber: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  txAmount: {
    color: COLORS.text,
    fontWeight: FONTS.weights.bold,
    fontSize: FONTS.sizes.md,
  },
  txDate: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});
export default HistoryScreen;
