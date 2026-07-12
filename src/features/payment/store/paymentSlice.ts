import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Security } from '../../../utils/security';

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

export interface PaymentState {
  transactions: Transaction[];
  activeTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  pendingAmount: number | null;
}

const initialState: PaymentState = {
  transactions: [],
  activeTransaction: null,
  loading: false,
  error: null,
  pendingAmount: null,
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

/**
 * Thunk asíncrono para crear una nueva transacción, guardarla de forma encriptada
 * y actualizar el estado de Redux.
 */
export const saveNewTransaction = createAsyncThunk(
  'payment/saveNewTransaction',
  async (newTx: Omit<Transaction, 'id' | 'createdAt'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { payment: PaymentState };
      const currentList = state.payment.transactions;

      const transactionWithMeta: Transaction = {
        ...newTx,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
      };

      const updatedList = [transactionWithMeta, ...currentList];
      
      // Guardar de forma encriptada en AsyncStorage
      await Security.saveSecureItem(STORAGE_KEY, updatedList);

      return transactionWithMeta;
    } catch (error) {
      return rejectWithValue('Error al guardar la transacción de forma segura');
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
      });
  },
});

export const { setActiveTransaction, clearError, setPendingAmount } = paymentSlice.actions;
export default paymentSlice.reducer;
