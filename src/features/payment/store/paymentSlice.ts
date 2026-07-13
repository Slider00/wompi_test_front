import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Security } from '../../../utils/security';
import { paymentService } from '../services/paymentService';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  cardHolder: string;
  cardMaskedNumber: string;
  reference: string;
  status: 'APPROVED' | 'PENDING' | 'DECLINED';
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface PaymentState {
  transactions: Transaction[];
  activeTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  pendingAmount: number | null;
  cart: CartItem[];
}

const initialState: PaymentState = {
  transactions: [],
  activeTransaction: null,
  loading: false,
  error: null,
  pendingAmount: null,
  cart: [],
};

const STORAGE_KEY = 'secure_transactions_data';

/**
 * Thunk asíncrono para cargar las transacciones guardadas y encriptadas.
 */
export const loadTransactions = createAsyncThunk(
  'payment/loadTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await Security.getSecureItem<Transaction[]>(STORAGE_KEY);
      return data || [];
    } catch (error) {
      return rejectWithValue('Error al cargar transacciones seguras');
    }
  }
);

export const saveNewTransaction = createAsyncThunk(
  'payment/saveNewTransaction',
  async (newTx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string; createdAt?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { payment: PaymentState };
      const currentList = state.payment.transactions;

      const transactionWithMeta: Transaction = {
        ...newTx,
        id: newTx.id || Math.random().toString(36).substring(2, 15),
        createdAt: newTx.createdAt || new Date().toISOString(),
      } as Transaction;

      const updatedList = [transactionWithMeta, ...currentList];
      
      // Guardar de forma encriptada en AsyncStorage
      await Security.saveSecureItem(STORAGE_KEY, updatedList);

      return transactionWithMeta;
    } catch (error) {
      return rejectWithValue('Error al guardar la transacción de forma segura');
    }
  }
);

/**
 * Thunk asíncrono para sincronizar las transacciones desde el backend de MongoDB.
 */
export const fetchBackendTransactions = createAsyncThunk(
  'payment/fetchBackendTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const list = await paymentService.getTransactions();
      // Guardar de forma encriptada en AsyncStorage local para persistencia offline
      await Security.saveSecureItem(STORAGE_KEY, list);
      return list;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al sincronizar transacciones');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setActiveTransaction(state, action: PayloadAction<Transaction | null>) {
      state.activeTransaction = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setPendingAmount(state, action: PayloadAction<number | null>) {
      state.pendingAmount = action.payload;
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.cart = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Carga de transacciones
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Guardar nueva transacción
      .addCase(saveNewTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveNewTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        state.transactions = [action.payload, ...state.transactions];
        state.activeTransaction = action.payload;
      })
      .addCase(saveNewTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sincronizar transacciones con backend
      .addCase(fetchBackendTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBackendTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchBackendTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTransaction, clearError, setPendingAmount, setCart } = paymentSlice.actions;
export default paymentSlice.reducer;
