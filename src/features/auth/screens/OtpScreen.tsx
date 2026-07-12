import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { RootContainer } from '../../../components/RootContainer';
import { COLORS, SPACING, FONTS, GLOBAL_STYLES, SHADOWS } from '../../../theme/theme';
import { scale, verticalScale } from '../../../utils/responsive';
import { authService } from '../services/authService';

interface OtpScreenProps {
  onVerifySuccess: (code: string) => void;
  targetEmail: string;
  flowType: 'REGISTER' | 'RECOVERY';
  onGoBack: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  onVerifySuccess,
  targetEmail,
  flowType,
  onGoBack,
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  // Refs para manejar el foco de los 6 inputs de dígitos
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Efecto del temporizador de 60 segundos
  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Formatear segundos en formato MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Solo permitir números
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    setError('');

    // Si escribe un dígito, pasar foco al siguiente input
    if (cleanValue && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Si presiona borrar y el campo está vacío, regresar foco al anterior
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError(t('auth.error_otp_incomplete'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOtp(targetEmail, fullCode);
      onVerifySuccess(fullCode);
    } catch (err: any) {
      setError(err.message || t('auth.error_otp_invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    inputRefs[0].current?.focus();
    try {
      await authService.sendOtp(targetEmail);
      (globalThis as any).alert(t('auth.msg_otp_resent'));
      setTimeLeft(60); // Reiniciar el temporizador
    } catch (err: any) {
      setError(err.message || t('auth.error_otp_resend_failed'));
    }
  };

  return (
    <RootContainer scrollEnabled={false}>
      {/* Botón Volver */}
      <TouchableOpacity style={styles.backButton} onPress={onGoBack} activeOpacity={0.7} testID="otp-back">
        <Text style={styles.backButtonText}>← {t('auth.btn_back')}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>
          {flowType === 'REGISTER' ? t('auth.otp_title_register') : t('auth.otp_title_recovery')}
        </Text>
        <Text style={styles.subtitle}>
          {t('auth.otp_subtitle')} <Text style={styles.emailHighlight}>{targetEmail}</Text>
        </Text>

        {/* Inputs de 6 dígitos */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.otpInput,
                error ? styles.otpInputError : null,
                digit ? styles.otpInputActive : null,
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              testID={`otp-input-${index}`}
            />
          ))}
        </View>

        {error ? <Text style={[GLOBAL_STYLES.errorText, styles.errorText]}>{error}</Text> : null}

        {/* Botón de enviar */}
        <TouchableOpacity
          style={[
            GLOBAL_STYLES.button,
            styles.verifyButton,
            loading ? styles.disabledButton : null,
          ]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.8}
          testID="otp-submit"
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={GLOBAL_STYLES.buttonText}>{t('auth.btn_verify_otp')}</Text>
          )}
        </TouchableOpacity>

        {/* Reenviar código / Contador */}
        <View style={styles.resendContainer}>
          {timeLeft > 0 ? (
            <Text style={styles.timerText}>
              {t('auth.otp_expires_in')}: <Text style={styles.timerHighlight}>{formatTime(timeLeft)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7} testID="otp-resend">
              <Text style={styles.resendText}>{t('auth.btn_resend_otp')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: scale(10),
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  card: {
    ...GLOBAL_STYLES.card,
    marginHorizontal: SPACING.md,
    marginTop: verticalScale(20),
    paddingVertical: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: scale(18),
  },
  emailHighlight: {
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: scale(20),
    marginBottom: SPACING.md,
  },
  otpInput: {
    width: scale(40),
    height: scale(46),
    backgroundColor: COLORS.background,
    borderRadius: scale(8),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: FONTS.weights.bold,
  },
  otpInputActive: {
    borderColor: COLORS.primary,
  },
  otpInputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  verifyButton: {
    marginTop: SPACING.md,
  },
  disabledButton: {
    opacity: 0.8,
  },
  resendContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  timerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  timerHighlight: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});

export default OtpScreen;
