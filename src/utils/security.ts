import './crypto-polyfill';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../../env';

// Utiliza la variable del entorno como clave de cifrado.
// Si no existe, recurre a una clave por defecto para evitar errores.
const SECRET_KEY = ENV.TEST_VAR || 'Wompi_Default_Secret_Key_2026';

export const Security = {
  /**
   * Cifra cualquier valor (objeto, array, string) y lo devuelve como string cifrado en AES.
   */
  encrypt(value: any): string {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
    } catch (error) {
      console.error('[Security] Error al cifrar datos:', error);
      throw new Error('Cifrado fallido');
    }
  },

  /**
   * Descifra un string cifrado en AES y lo retorna a su formato original.
   */
  decrypt(ciphertext: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // Intentamos parsear a JSON si es posible, de lo contrario retornamos el string.
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('[Security] Error al descifrar datos:', error);
      return null;
    }
  },

  /**
   * Guarda de forma segura y cifrada en AsyncStorage.
   */
  async saveSecureItem(key: string, value: any): Promise<void> {
    try {
      const encryptedValue = this.encrypt(value);
      await AsyncStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`[Security] Error al guardar datos seguros para la clave: ${key}`, error);
      throw error;
    }
  },

  /**
   * Recupera y descifra un valor desde AsyncStorage.
   */
  async getSecureItem<T = any>(key: string): Promise<T | null> {
    try {
      const encryptedValue = await AsyncStorage.getItem(key);
      if (!encryptedValue) {
        return null;
      }
      return this.decrypt(encryptedValue) as T;
    } catch (error) {
      console.error(`[Security] Error al obtener datos seguros para la clave: ${key}`, error);
      return null;
    }
  },

  /**
   * Elimina un registro de AsyncStorage.
   */
  async removeSecureItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Security] Error al remover datos para la clave: ${key}`, error);
      throw error;
    }
  }
};
