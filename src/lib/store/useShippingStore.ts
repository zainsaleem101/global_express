import { create } from "zustand";
import type { ServiceResult } from "../../lib/types/shipping";
import type { FormData } from "../../components/shipping-form";

interface ShippingState {
  selectedService: ServiceResult | null;
  measurementUnit: "kg/cm" | "lb/inches";
  setSelectedService: (service: ServiceResult) => void;
  clearSelectedService: () => void;
  setMeasurementUnit: (unit: "kg/cm" | "lb/inches") => void;
}

export const useShippingStore = create<ShippingState>((set) => ({
  selectedService: null,
  measurementUnit: "kg/cm", // Default to metric
  setSelectedService: (service) => set({ selectedService: service }),
  clearSelectedService: () => set({ selectedService: null }),
  setMeasurementUnit: (unit) => set({ measurementUnit: unit }),
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

// Weight conversion utilities
export const convertKgToLb = (kg: number): number => {
  return Number((kg * 2.20462).toFixed(2));
};

export const convertLbToKg = (lb: number): number => {
  return Number((lb / 2.20462).toFixed(2));
};

export const formatWeight = (
  weightInKg: number,
  measurementUnit: "kg/cm" | "lb/inches"
): string => {
  if (measurementUnit === "lb/inches") {
    const weightInLb = convertKgToLb(weightInKg);
    return `${weightInLb} lb`;
  }
  return `${weightInKg} kg`;
};
