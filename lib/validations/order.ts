import { z } from 'zod'

export const orderFormSchema = z.object({
  name: z.string()
    .min(2, 'Vardas turi būti bent 2 simbolių ilgio')
    .max(50, 'Vardas negali būti ilgesnis nei 50 simbolių'),
  email: z.string()
    .email('Neteisingas el. pašto formatas'),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    required_error: 'Pasirinkite dydį'
  }),
  quantity: z.number()
    .min(1, 'Minimalus kiekis yra 1')
    .max(100, 'Maksimalus kiekis yra 100'),
  comments: z.string()
    .max(500, 'Komentaras negali būti ilgesnis nei 500 simbolių')
    .optional(),
})

export type OrderFormData = z.infer<typeof orderFormSchema>