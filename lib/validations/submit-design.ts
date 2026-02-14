import { z } from 'zod';

const productSchema = z.object({
  id: z.string().min(1, "Produkto ID privalomas"),
  name: z.string().min(1, "Produkto pavadinimas privalomas"),
  type: z.string().optional().default(""),
});

export const orderFormSchema = z.object({
  name: z.string().min(2, { message: "Vardas turi būti bent 2 simbolių ilgio" }),
  email: z.string().email({ message: "Neteisingas el. pašto formatas" }),
  phone: z.string().optional(),
  size: z.string().min(1, { message: "Pasirinkite dydį" }),
  quantity: z.number().min(1, { message: "Kiekis turi būti bent 1" }).max(1000),
  comments: z.string().optional(),

  // New validation fields
  product: productSchema,
  printAreas: z.array(z.string()).optional().default([]),
  designPreviews: z.record(z.string()).optional().default({}),
  designStates: z.record(z.any()).optional().default({}),
  totalPrice: z.number().min(0).default(0),
  uploadedImage: z.string().nullable().optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
