import { z } from 'zod';

// Formų validacijos schema
export const orderFormSchema = z.object({
  name: z.string().min(2, { message: "Vardas turi būti bent 2 simbolių ilgio" }),
  email: z.string().email({ message: "Neteisingas el. pašto formatas" }),
  phone: z.string().optional(),
  size: z.string().min(1, { message: "Pasirinkite dydį" }),
  quantity: z.number().min(1, { message: "Kiekis turi būti bent 1" }).max(1000),
  comments: z.string().optional(),
});

/**
 * Validuoja užsakymo duomenis
 * @param data Užsakymo duomenys
 * @returns Validuoti duomenys
 * @throws z.ZodError jei duomenys neteisingi
 */
export function validateOrderData(data: unknown) {
  return orderFormSchema.parse(data);
}
