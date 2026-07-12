import { Platform } from 'react-native';
import { ENV } from '../../../../env';

/**
 * Resuelve la dirección IP base del servidor en función del entorno y plataforma.
 */
const getBaseUrl = (): string => {
  if ((ENV as any).API_URL) {
    return (ENV as any).API_URL;
  }
  // En desarrollo local:
  // - iOS físico necesita la IP de red local de la Mac.
  // - Android Emulator mapea 10.0.2.2 a localhost de la Mac.
  // - iOS Simulator mapea localhost de la Mac directamente.
  const host = Platform.select({
    ios: '192.168.1.7', // IP local de la Mac en tu red WiFi actual
    android: '10.0.2.2',
    default: 'localhost',
  });
  return `http://${host}:3000`;
};

const BASE_URL = getBaseUrl();

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface OtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

/**
 * Servicio modular de consumo de API de Autenticación de Wompi.
 */
export const authService = {
  /**
   * Registrar un nuevo usuario.
   */
  async register(email: string, name: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Error en el registro');
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Iniciar sesión de usuario.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Credenciales inválidas');
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Generar y enviar el código OTP al correo.
   */
  async sendOtp(email: string): Promise<OtpResponse> {
    const response = await fetch(`${BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Error al enviar OTP');
      throw new Error(errorMsg);
    }
    return data;
  },

  /**
   * Verificar código OTP ingresado.
   */
  async verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
    const response = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Código OTP inválido o expirado');
      throw new Error(errorMsg);
    }
    return data;
  },
};

export default authService;
