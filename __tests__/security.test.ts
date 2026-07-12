import { Security } from '../src/utils/security';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// Mock de AsyncStorage para asegurar que las pruebas unitarias funcionen de forma aislada
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItem: jest.fn(async (key: string) => {
      return store[key] || null;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
});

describe('Security Encryption & Persistence Tests', () => {
  const testObject = { name: 'Juan Perez', cardNumber: '4111222233334444' };
  const testString = 'Hola Mundo Wompi';

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  test('encrypt should produce a valid ciphertext string', () => {
    const ciphertext = Security.encrypt(testString);
    expect(typeof ciphertext).toBe('string');
    expect(ciphertext.length).toBeGreaterThan(0);
    expect(ciphertext).not.toBe(testString);
  });

  test('decrypt should correctly restore encrypted string', () => {
    const ciphertext = Security.encrypt(testString);
    const decrypted = Security.decrypt(ciphertext);
    expect(decrypted).toBe(testString);
  });

  test('decrypt should correctly restore encrypted object', () => {
    const ciphertext = Security.encrypt(testObject);
    const decrypted = Security.decrypt(ciphertext);
    expect(decrypted).toEqual(testObject);
  });

  test('saveSecureItem and getSecureItem should persist and retrieve encrypted data', async () => {
    const key = 'test_secure_key';
    
    // Guardar
    await Security.saveSecureItem(key, testObject);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);

    // Recuperar
    const retrieved = await Security.getSecureItem(key);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
    expect(retrieved).toEqual(testObject);
  });

  test('removeSecureItem should remove the key from storage', async () => {
    const key = 'test_remove_key';
    await Security.saveSecureItem(key, testString);
    
    // Remover
    await Security.removeSecureItem(key);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);

    // Comprobar que ya no existe
    const retrieved = await Security.getSecureItem(key);
    expect(retrieved).toBeNull();
  });

  // --- Pruebas para Manejo de Errores (Catch Blocks) ---

  test('encrypt should throw an error when serialization fails', () => {
    // Creamos un objeto circular para hacer que JSON.stringify falle
    const circularObj: any = {};
    circularObj.self = circularObj;

    expect(() => Security.encrypt(circularObj)).toThrow('Cifrado fallido');
  });

  test('decrypt should return null when decryption fails', () => {
    // Forzamos un fallo en CryptoJS haciendo que tire error
    const spy = jest.spyOn(CryptoJS.AES, 'decrypt').mockImplementationOnce(() => {
      throw new Error('Fallo simulado en AES');
    });

    const result = Security.decrypt('invalid_ciphertext');
    expect(result).toBeNull();
    spy.mockRestore();
  });

  test('saveSecureItem should throw an error when AsyncStorage fails', async () => {
    const mockError = new Error('Fallo de escritura en disco');
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(Security.saveSecureItem('test_key', 'some_value')).rejects.toThrow(mockError);
  });

  test('getSecureItem should return null when AsyncStorage fails', async () => {
    const mockError = new Error('Fallo de lectura en disco');
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await Security.getSecureItem('test_key');
    expect(result).toBeNull();
  });

  test('removeSecureItem should throw an error when AsyncStorage fails', async () => {
    const mockError = new Error('Fallo al borrar');
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(Security.removeSecureItem('test_key')).rejects.toThrow(mockError);
  });
});
