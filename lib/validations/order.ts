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

  phone: z.string()
    .min(8, 'Telefono numeris turi būti bent 8 simbolių')
    .max(15, 'Telefono numeris negali būti ilgesnis nei 15 simbolių')
    .regex(/^[+]?[\d\s-()]+$/, 'Neteisingas telefono numerio formatas')
    .optional(),
  
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'], {
    required_error: 'Pasirinkite dydį'
  }),
  
  quantity: z.number()
    .min(1, 'Minimalus kiekis yra 1')
    .max(1000, 'Maksimalus kiekis yra 1000')
    .int('Kiekis turi būti sveikasis skaičius'),

  printAreas: z.array(z.string()).min(1, 'Pasirinkite bent vieną spausdinimo vietą'),
  
  comments: z.string()
    .max(500, 'Komentaras negali būti ilgesnis nei 500 simbolių')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
