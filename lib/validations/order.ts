import { z } from 'zod';

export const orderFormSchema = z.object({
  name: z.string()
    .min(2, 'Vardas turi būti bent 2 simbolių ilgio')
    .max(50, 'Vardas negali būti ilgesnis nei 50 simbolių')
    .regex(/^[a-zA-ZĄąČčĘęĖėĮįŠšŲųŪūŽž\s]+$/, 'Vardas gali turėti tik raides ir tarpus'),
  
  email: z.string()
    .email('Neteisingas el. pašto formatas')
    .min(5, 'El. paštas turi būti bent 5 simbolių ilgio')
    .max(100, 'El. paštas negali būti ilgesnis nei 100 simbolių'),
  
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    required_error: 'Pasirinkite dydį'
  }),
  
  quantity: z.number()
    .min(1, 'Minimalus kiekis yra 1')
    .max(100, 'Maksimalus kiekis yra 100')
    .int('Kiekis turi būti sveikasis skaičius'),
  
  comments: z.string()
    .max(500, 'Komentaras negali būti ilgesnis nei 500 simbolių')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;