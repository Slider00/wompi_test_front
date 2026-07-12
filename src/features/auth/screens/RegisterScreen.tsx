import React, { useState } from 'react';
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
import { COLORS, SPACING, FONTS, GLOBAL_STYLES } from '../../../theme/theme';
import { scale, verticalScale } from '../../../utils/responsive';
import { authService } from '../services/authService';

interface RegisterScreenProps {
  onGoToLogin: () => void;
  onRegisterSuccess: (email: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onGoToLogin,
  onRegisterSuccess,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = t('auth.error_name_empty');
    } else if (name.trim().length < 2) {
      newErrors.name = t('auth.error_name_length');
    }

    if (!email) {
      newErrors.email = t('auth.error_email_empty');
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('auth.error_email_invalid');
    }

    if (!password) {
      newErrors.password = t('auth.error_password_empty');
    } else if (password.length < 6) {
      newErrors.password = t('auth.error_password_length');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.error_confirm_password_empty');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.error_passwords_mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      // 1. Crear el usuario en la BD del backend
      await authService.register(email, name, password);

      // 2. Solicitar envío de código OTP
      await authService.sendOtp(email);

      // 3. Pasar al flujo de verificación OTP
      onRegisterSuccess(email);
    } catch (err: any) {
      setErrors({
        general: err.message || t('auth.error_generic_register'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootContainer>
      {/* Cabecera / Marca */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>W</Text>
        </View>
        <Text style={styles.brandTitle}>{t('auth.brand_name')}</Text>
        <Text style={styles.brandSubtitle}>{t('auth.brand_slogan')}</Text>
      </View>

      {/* Tarjeta de Formulario */}
      <View style={GLOBAL_STYLES.card}>
        <Text style={styles.cardTitle}>{t('auth.register_title')}</Text>

        {/* Input de Nombre Completo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.label_name')}</Text>
          <TextInput
            style={[GLOBAL_STYLES.input, errors.name ? GLOBAL_STYLES.inputError : null]}
            placeholder={t('auth.placeholder_name')}
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            autoCapitalize="words"
            autoCorrect={false}
            testID="register-name"
          />
          {errors.name ? (
            <Text style={GLOBAL_STYLES.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        {/* Input de Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.label_email')}</Text>
          <TextInput
            style={[GLOBAL_STYLES.input, errors.email ? GLOBAL_STYLES.inputError : null]}
            placeholder={t('auth.placeholder_email')}
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email ? (
            <Text style={GLOBAL_STYLES.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Input de Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.label_password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                GLOBAL_STYLES.input,
                styles.passwordInput,
                errors.password ? GLOBAL_STYLES.inputError : null,
              ]}
              placeholder={t('auth.placeholder_password')}
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              testID="toggle-password-visibility"
            >
              <View style={styles.eyeIcon}>
                <View style={styles.eyePupil} />
                {showPassword && <View style={styles.eyeSlash} />}
              </View>
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={GLOBAL_STYLES.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Input de Confirmación de Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.label_confirm_password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                GLOBAL_STYLES.input,
                styles.passwordInput,
                errors.confirmPassword ? GLOBAL_STYLES.inputError : null,
              ]}
              placeholder={t('auth.placeholder_confirm_password')}
              placeholderTextColor={COLORS.textSecondary}
              value={confirmPassword}
              onChangeText={(txt) => {
                setConfirmPassword(txt);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
              testID="toggle-confirm-password-visibility"
            >
              <View style={styles.eyeIcon}>
                <View style={styles.eyePupil} />
                {showConfirmPassword && <View style={styles.eyeSlash} />}
              </View>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={GLOBAL_STYLES.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {errors.general ? (
          <Text style={[GLOBAL_STYLES.errorText, { textAlign: 'center', marginBottom: SPACING.md }]} testID="register-error">
            {errors.general}
          </Text>
        ) : null}

        {/* Botón de Registro */}
        <TouchableOpacity
          style={[
            GLOBAL_STYLES.button,
            styles.submitButton,
            loading ? styles.disabledButton : null,
          ]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
          testID="register-submit"
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={GLOBAL_STYLES.buttonText}>{t('auth.btn_register')}</Text>
          )}
        </TouchableOpacity>

        {/* Enlace a Login */}
        <TouchableOpacity style={styles.linkContainer} onPress={onGoToLogin} activeOpacity={0.7} testID="already-have-account">
          <Text style={styles.linkText}>{t('auth.btn_already_have_account')}</Text>
        </TouchableOpacity>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(25),
  },
  logoBadge: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl + 4,
    fontWeight: FONTS.weights.bold,
  },
  brandTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  brandSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: scale(4),
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    marginBottom: scale(6),
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: scale(45),
  },
  eyeButton: {
    position: 'absolute',
    right: scale(12),
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: scale(16),
    height: scale(10),
    borderRadius: scale(5),
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eyePupil: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: COLORS.textSecondary,
  },
  eyeSlash: {
    position: 'absolute',
    width: scale(16),
    height: 1.5,
    backgroundColor: COLORS.textSecondary,
    transform: [{ rotate: '45deg' }],
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  disabledButton: {
    opacity: 0.8,
  },
  linkContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
});

export default RegisterScreen;
