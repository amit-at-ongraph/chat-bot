import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface FormState {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  success: boolean;
}

interface RegisterFormState extends FormState {
  name: string;
}

interface AuthState {
  loginForm: FormState;
  registerForm: RegisterFormState;
  setLoginField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  setRegisterField: <K extends keyof RegisterFormState>(
    field: K,
    value: RegisterFormState[K],
  ) => void;
  resetLoginForm: () => void;
  resetRegisterForm: () => void;
}

const initialFormState: FormState = {
  email: "",
  password: "",
  error: "",
  loading: false,
  success: false,
};

const initialRegisterState: RegisterFormState = {
  ...initialFormState,
  name: "",
};

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    loginForm: { ...initialFormState },
    registerForm: { ...initialRegisterState },

    setLoginField: (field, value) =>
      set((state) => {
        state.loginForm[field] = value;
      }),

    setRegisterField: (field, value) =>
      set((state) => {
        state.registerForm[field] = value;
      }),

    resetLoginForm: () =>
      set((state) => {
        state.loginForm = { ...initialFormState };
      }),

    resetRegisterForm: () =>
      set((state) => {
        state.registerForm = { ...initialRegisterState };
      }),
  })),
);
