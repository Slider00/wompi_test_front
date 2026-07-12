import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store';
import { saveNewTransaction, setPendingAmount } from '../store/paymentSlice';
import { RootContainer } from '../../../components/RootContainer';
import { COLORS, SPACING, FONTS, SHADOWS, GLOBAL_STYLES } from '../../../theme/theme';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';
import { useEffect } from 'react';

interface PaymentScreenProps {
  onNavigate: (screen: 'PAYMENT' | 'STATUS' | 'HISTORY') => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { pendingAmount, loading, error } = useAppSelector((state) => state.payment);

  // Estados del formulario
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (pendingAmount !== null) {
      setAmount(pendingAmount.toString());
      dispatch(setPendingAmount(null));
    }
  }, [pendingAmount, dispatch]);
  const [email, setEmail] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados de errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Formateador de Número de Tarjeta (grupos de 4)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.substring(0, 19));
  };

  // Formateador de Fecha de Expiración (MM/AA)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    setExpiry(formatted.substring(0, 5));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = t('validation.amount_error');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = t('validation.email_error');
    }
    if (!cardHolder.trim()) {
      newErrors.cardHolder = t('validation.holder_error');
    }
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 16) {
      newErrors.cardNumber = t('validation.card_error');
    }
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiry || !expiryRegex.test(expiry)) {
      newErrors.expiry = t('validation.expiry_error');
    } else {
      const [month, year] = expiry.split('/');
      const expiryDate = new Date(2000 + Number(year), Number(month) - 1);
      if (expiryDate < new Date()) {
        newErrors.expiry = t('validation.expiry_past');
      }
    }
    if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = t('validation.cvv_error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const cleanCard = cardNumber.replace(/\s/g, '');
    const maskedNumber = `**** **** **** ${cleanCard.slice(-4)}`;

    const statuses: ('APPROVED' | 'DECLINED' | 'PENDING')[] = ['APPROVED', 'APPROVED', 'DECLINED', 'PENDING'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const paymentData = {
      amount: Number(amount),
      currency: 'COP',
      cardHolder,
      cardMaskedNumber: maskedNumber,
      reference: `WMP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: randomStatus,
    };

    const resultAction = await dispatch(saveNewTransaction(paymentData));
    if (saveNewTransaction.fulfilled.match(resultAction)) {
      onNavigate('STATUS');
    }
  };

  return (
    <RootContainer edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={GLOBAL_STYLES.headerTitle}>{t('checkout')}</Text>
        <Text style={GLOBAL_STYLES.headerSubtitle}>{t('simulated_payment')}</Text>
      </View>

      {/* Tarjeta de Crédito Visual */}
      <View style={styles.cardPreview}>
        <View style={styles.cardChip} />
        <Text style={styles.cardPreviewNumber}>
          {cardNumber || '•••• •••• •••• ••••'}
        </Text>
        <View style={styles.cardPreviewRow}>
          <View>
            <Text style={styles.cardPreviewLabel}>{t('cardholder_label')}</Text>
            <Text style={styles.cardPreviewText}>
              {cardHolder.toUpperCase() || 'NOMBRE APELLIDO'}
            </Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.cardPreviewLabel}>{t('expires_label')}</Text>
            <Text style={styles.cardPreviewText}>{expiry || 'MM/AA'}</Text>
          </View>
        </View>
      </View>

      {/* Formulario */}
      <View style={GLOBAL_STYLES.card}>
        {/* Campo de Monto */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('amount_label')}</Text>
          <TextInput
            placeholder="Ej. 50000"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={[GLOBAL_STYLES.input, errors.amount ? GLOBAL_STYLES.inputError : null]}
          />
          {errors.amount && <Text style={GLOBAL_STYLES.errorText}>{errors.amount}</Text>}
        </View>

        {/* Campo de Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('email_label')}</Text>
          <TextInput
            placeholder="usuario@correo.com"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={[GLOBAL_STYLES.input, errors.email ? GLOBAL_STYLES.inputError : null]}
          />
          {errors.email && <Text style={GLOBAL_STYLES.errorText}>{errors.email}</Text>}
        </View>

        {/* Campo del Tarjetahabiente */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('card_holder_name_label')}</Text>
          <TextInput
            placeholder="COMO APARECE EN LA TARJETA"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            value={cardHolder}
            onChangeText={setCardHolder}
            style={[GLOBAL_STYLES.input, errors.cardHolder ? GLOBAL_STYLES.inputError : null]}
          />
          {errors.cardHolder && (
            <Text style={GLOBAL_STYLES.errorText}>{errors.cardHolder}</Text>
          )}
        </View>

        {/* Campo del Número de Tarjeta */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('card_number_label')}</Text>
          <TextInput
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            style={[GLOBAL_STYLES.input, errors.cardNumber ? GLOBAL_STYLES.inputError : null]}
          />
          {errors.cardNumber && (
            <Text style={GLOBAL_STYLES.errorText}>{errors.cardNumber}</Text>
          )}
        </View>

        {/* Fila Expiración + CVV */}
        <View style={GLOBAL_STYLES.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>{t('expiry_label')}</Text>
            <TextInput
              placeholder="MM/AA"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={expiry}
              onChangeText={handleExpiryChange}
              style={[GLOBAL_STYLES.input, errors.expiry ? GLOBAL_STYLES.inputError : null]}
            />
            {errors.expiry && <Text style={GLOBAL_STYLES.errorText}>{errors.expiry}</Text>}
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>{t('cvv_label')}</Text>
            <TextInput
              placeholder="123"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              value={cvv}
              onChangeText={setCvv}
              style={[GLOBAL_STYLES.input, errors.cvv ? GLOBAL_STYLES.inputError : null]}
            />
            {errors.cvv && <Text style={GLOBAL_STYLES.errorText}>{errors.cvv}</Text>}
          </View>
        </View>

        {error && <Text style={styles.globalError}>{error}</Text>}

        {/* Botón de Envío */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
          style={GLOBAL_STYLES.button}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={GLOBAL_STYLES.buttonText}>{t('btn_pay')}</Text>
          )}
        </TouchableOpacity>

        {/* Botón para ver historial */}
        <TouchableOpacity
          onPress={() => onNavigate('HISTORY')}
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>{t('btn_history')}</Text>
        </TouchableOpacity>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardPreview: {
    height: verticalScale(180),
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(16),
    padding: SPACING.lg,
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardChip: {
    width: scale(45),
    height: verticalScale(32),
    backgroundColor: '#D97706',
    borderRadius: moderateScale(6),
  },
  cardPreviewNumber: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    letterSpacing: 2,
    marginVertical: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewLabel: {
    fontSize: FONTS.sizes.xs - 2,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  cardPreviewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: FONTS.weights.semibold,
    marginTop: 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING.xs,
  },
  globalError: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontSize: FONTS.sizes.sm,
  },
  halfWidth: {
    width: '48%',
  },
  linkButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  linkButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    textDecorationLine: 'underline',
  },
});
export default PaymentScreen;
