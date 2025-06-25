import { create } from "zustand";
import type { ServiceResult } from "../../lib/types/shipping";
import type { FormData } from "../../components/shipping-form";

interface ShippingState {
  selectedService: ServiceResult | null;
  setSelectedService: (service: ServiceResult) => void;
  clearSelectedService: () => void;
}

export const useShippingStore = create<ShippingState>((set) => ({
  selectedService: null,
  setSelectedService: (service) => set({ selectedService: service }),
  clearSelectedService: () => set({ selectedService: null }),
}));

// Helper functions for SessionStorage
export const saveFormDataToSession = (formData: FormData) => {
  sessionStorage.setItem("shippingFormData", JSON.stringify(formData));
};

export const loadFormDataFromSession = (): FormData | null => {
  const data = sessionStorage.getItem("shippingFormData");
  return data ? JSON.parse(data) : null;
};

export const clearFormDataFromSession = () => {
  sessionStorage.removeItem("shippingFormData");
};
