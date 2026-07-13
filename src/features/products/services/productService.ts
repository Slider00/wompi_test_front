import { Platform } from 'react-native';
import { ENV } from '../../../../env';

const getBaseUrl = (): string => {
  if ('API_URL' in ENV) {
    return (ENV as any).API_URL;
  }
  const host = Platform.select({
    ios: '192.168.1.7',
    android: '10.0.2.2',
    default: 'localhost',
  });
  return `http://${host}:3000`;
};

export const BASE_URL = getBaseUrl();

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export const productService = {
  /**
   * Obtiene la lista de productos y su stock disponible desde el backend.
   */
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }

    return response.json();
  },

  /**
   * Descuenta las unidades compradas del stock de los productos en el backend.
   */
  decreaseStock: async (cart: CartItem[]): Promise<void> => {
    const response = await fetch(`${BASE_URL}/products/decrease-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el stock');
    }
  },
};
