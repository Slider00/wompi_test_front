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
import { COLORS, SPACING, FONTS, GLOBAL_STYLES, SHADOWS } from '../../../theme/theme';
import { scale, verticalScale } from '../../../utils/responsive';
import packageJson from '../../../../package.json';

import { Security } from '../../../utils/security';
import { authService } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
  onEnterAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  onGoToRegister,
  onEnterAsGuest 
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      const response = await authService.login(email, password);
      // Guardar token JWT y datos de usuario de forma segura
      await Security.saveSecureItem('auth_token', response.access_token);
      await Security.saveSecureItem('user_info', response.user);
      
      onLoginSuccess();
    } catch (err: any) {
      setErrors({
        general: err.message || t('auth.error_invalid_credentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootContainer scrollEnabled={true} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.brandContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>W</Text>
        </View>
        <Text style={styles.brandTitle}>{t('auth.brand_name')}</Text>
        <Text style={styles.brandSubtitle}>{t('auth.brand_slogan')}</Text>
      </View>

      <View style={GLOBAL_STYLES.card}>
        <Text style={styles.cardTitle}>{t('auth.login_title')}</Text>

        {/* Input de Correo */}
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

        {errors.general ? (
          <Text style={[GLOBAL_STYLES.errorText, { textAlign: 'center', marginBottom: SPACING.md }]} testID="login-error">
            {errors.general}
          </Text>
        ) : null}

        {/* Botón de Ingreso */}
        <TouchableOpacity
          style={[GLOBAL_STYLES.button, styles.submitButton, loading ? styles.disabledButton : null]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={GLOBAL_STYLES.buttonText}>{t('auth.btn_login')}</Text>
          )}
        </TouchableOpacity>

        {/* Enlace a Registro */}
        <TouchableOpacity style={styles.linkContainer} onPress={onGoToRegister} activeOpacity={0.7} testID="go-to-register">
          <Text style={styles.linkText}>{t('auth.btn_go_to_register')}</Text>
        </TouchableOpacity>

        {/* Botón de Invitado */}
        <TouchableOpacity style={styles.guestButton} onPress={onEnterAsGuest} activeOpacity={0.7}>
          <Text style={styles.guestButtonText}>{t('auth.btn_enter_as_guest') || 'Explorar como Invitado'}</Text>
        </TouchableOpacity>

        {/* Versión de la Aplicación */}
        <Text style={styles.versionText}>v{packageJson.version}</Text>
      </View>
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(30),
  },
  logoCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
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
  submitButton: {
    marginTop: SPACING.md,
  },
  disabledButton: {
    opacity: 0.8,
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
  linkContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  guestButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  guestButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    textDecorationLine: 'underline',
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.lg,
    opacity: 0.6,
  },
});

export default LoginScreen;
