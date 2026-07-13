import { Platform } from 'react-native';
import { ENV } from '../../../../env';
import { Security } from '../../../utils/security';

const getBaseUrl = (): string => {
  if ('API_URL' in ENV) {
    return (ENV as any).API_URL;
  }
  const host = Platform.select({
    ios: '192.168.1.7', // IP local de la Mac
    android: '10.0.2.2',
    default: 'localhost',
  });
  return `http://${host}:3000`;
};

const BASE_URL = getBaseUrl();

export interface CreateTransactionPayload {
  amount: number;
  currency: string;
  cardHolder: string;
  cardMaskedNumber: string;
  reference: string;
  cart: { productId: string; quantity: number }[];
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export const paymentService = {
  /**
   * Crea una transacción pendiente en el backend.
   */
  createTransaction: async (payload: CreateTransactionPayload): Promise<any> => {
    const token = await Security.getSecureItem<string>('auth_token');

    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Error al iniciar la transacción');
      throw new Error(errorMsg);
    }

    return data;
  },

  /**
   * Actualiza el estado de la transacción en el backend.
   */
  updateTransactionStatus: async (transactionId: string, status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'FAILED'): Promise<any> => {
    const response = await fetch(`${BASE_URL}/transactions/${transactionId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Error al actualizar el estado');
      throw new Error(errorMsg);
    }

    return data;
  },

  /**
   * Obtiene el historial de transacciones del usuario logueado.
   */
  getTransactions: async (): Promise<any[]> => {
    const token = await Security.getSecureItem<string>('auth_token');

    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Error al obtener transacciones');
      throw new Error(errorMsg);
    }

    return data;
  },
};

export default paymentService;
