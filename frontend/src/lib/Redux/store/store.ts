// lib/Redux/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "./storage"; // Custom storage
import { combineReducers } from "redux";
// Import all your reducers

import   accountSlice  from "../features/account/accountSlice";
import  userSlice  from "../features/user/userSlice";
import  transactionSlice  from "../features/transactions/transactionsSlice";
import  chartDataSlice  from "../features/investmentSlice/investmentChartDataSlice";
import expenseReducer from "../features/expense/expenseSlice";
import incomeReducer from "../features/income/incomeSlices";
import investmentReducer from "../features/investmentSlice/investmentSlice";



const rootReducer = combineReducers({
  user: userSlice,
  account: accountSlice,
  transactions: transactionSlice,
  expenses: expenseReducer,
  income: incomeReducer,
  investments: investmentReducer,
  investmentChartData: chartDataSlice
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  // You might want to add whitelist/blacklist if needed
  // whitelist: ['account', 'transactions'] 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;