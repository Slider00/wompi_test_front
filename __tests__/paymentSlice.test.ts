import paymentReducer, {
  setActiveTransaction,
  clearError,
  loadTransactions,
  saveNewTransaction,
  PaymentState,
  Transaction,
} from '../src/features/payment/store/paymentSlice';
import { configureStore } from '@reduxjs/toolkit';
import { Security } from '../src/utils/security';

// Mock de AsyncStorage
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
  };
});

describe('Payment Redux Slice Tests', () => {
  const initialState: PaymentState = {
    transactions: [],
    activeTransaction: null,
    loading: false,
    error: null,
  };

  const sampleTx: Transaction = {
    id: 'tx-123',
    amount: 15000,
    currency: 'COP',
    cardHolder: 'Carlos Gomez',
    cardMaskedNumber: '**** **** **** 4321',
    reference: 'WMP-987654321',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return the initial state', () => {
    expect(paymentReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setActiveTransaction', () => {
    const nextState = paymentReducer(initialState, setActiveTransaction(sampleTx));
    expect(nextState.activeTransaction).toEqual(sampleTx);
  });

  test('should handle clearError', () => {
    const errorState: PaymentState = { ...initialState, error: 'Hubo un error' };
    const nextState = paymentReducer(errorState, clearError());
    expect(nextState.error).toBeNull();
  });

  describe('loadTransactions thunk', () => {
    test('should load empty transactions list when storage is empty', async () => {
      const store = configureStore({ reducer: { payment: paymentReducer } });
      
      // Aseguramos que el storage no tenga datos
      await Security.removeSecureItem('secure_transactions_data');
      
      await store.dispatch(loadTransactions());
      
      const state = store.getState().payment;
      expect(state.transactions).toEqual([]);
      expect(state.loading).toBe(false);
    });

    test('should load transactions successfully when storage contains encrypted data', async () => {
      const store = configureStore({ reducer: { payment: paymentReducer } });
      const mockList = [sampleTx];
      
      // Guardar lista encriptada en AsyncStorage
      await Security.saveSecureItem('secure_transactions_data', mockList);
      
      await store.dispatch(loadTransactions());
      
      const state = store.getState().payment;
      expect(state.transactions).toEqual(mockList);
      expect(state.loading).toBe(false);
    });

    test('should handle loadTransactions failure', async () => {
      const store = configureStore({ reducer: { payment: paymentReducer } });
      
      // Forzamos error en Security
      const spy = jest.spyOn(Security, 'getSecureItem').mockRejectedValueOnce(new Error('Fallo de lectura'));
      
      await store.dispatch(loadTransactions());
      
      const state = store.getState().payment;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Error al cargar transacciones seguras');
      
      spy.mockRestore();
    });
  });

  describe('saveNewTransaction thunk', () => {
    test('should add new transaction to the list and save it securely', async () => {
      const store = configureStore({ reducer: { payment: paymentReducer } });
      
      const newTxData = {
        amount: 25000,
        currency: 'COP',
        cardHolder: 'Maria Torres',
        cardMaskedNumber: '**** **** **** 9999',
        reference: 'WMP-1122334455',
        status: 'PENDING' as const,
      };

      const result = await store.dispatch(saveNewTransaction(newTxData));
      
      // Validamos que se cumplió el thunk
      expect(saveNewTransaction.fulfilled.match(result)).toBe(true);

      const state = store.getState().payment;
      expect(state.transactions.length).toBe(1);
      expect(state.transactions[0].amount).toBe(25000);
      expect(state.transactions[0].status).toBe('PENDING');
      expect(state.transactions[0].id).toBeDefined();
      expect(state.transactions[0].createdAt).toBeDefined();
      
      // Validamos que se cargó como la transacción activa
      expect(state.activeTransaction).toEqual(state.transactions[0]);

      // Validamos persistencia segura (recuperando y validando)
      const persistedData = await Security.getSecureItem<Transaction[]>('secure_transactions_data');
      expect(persistedData).toBeDefined();
      expect(persistedData?.length).toBe(1);
      expect(persistedData?.[0].reference).toBe('WMP-1122334455');
    });

    test('should handle saveNewTransaction failure', async () => {
      const store = configureStore({ reducer: { payment: paymentReducer } });
      
      const newTxData = {
        amount: 25000,
        currency: 'COP',
        cardHolder: 'Maria Torres',
        cardMaskedNumber: '**** **** **** 9999',
        reference: 'WMP-1122334455',
        status: 'PENDING' as const,
      };

      // Forzamos error al guardar
      const spy = jest.spyOn(Security, 'saveSecureItem').mockRejectedValueOnce(new Error('Fallo de guardado'));
      
      await store.dispatch(saveNewTransaction(newTxData));
      
      const state = store.getState().payment;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Error al guardar la transacción de forma segura');
      
      spy.mockRestore();
    });
  });
});
