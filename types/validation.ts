import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki')
    .max(100, 'Imię i nazwisko jest zbyt długie'),
  company: z.string().max(150, 'Nazwa firmy jest zbyt długa').optional().or(z.literal('')),
  email: z.string().email('Nieprawidłowy adres e-mail').min(5, 'Adres e-mail jest zbyt krótki'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length >= 9, {
      message: 'Numer telefonu musi mieć co najmniej 9 cyfr',
    })
    .refine((val) => !val || /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(val), {
      message: 'Nieprawidłowy format numeru telefonu',
    }),
  message: z
    .string()
    .max(2000, 'Wiadomość nie może przekraczać 2000 znaków')
    .optional()
    .or(z.literal('')),
  privacy: z.boolean().refine((val) => val === true, {
    message: 'Zgoda na przetwarzanie danych jest wymagana',
  }),
  // Optional/Dynamic fields
  website: z
    .string()
    .url('Nieprawidłowy format adresu URL (pamiętaj o https://)')
    .optional()
    .or(z.literal('')),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  goal: z.string().optional(),
  assets: z.string().optional(),
  traffic: z.string().optional(),
  scope: z.string().optional(),
  integrations: z.string().optional(),
  history: z.string().optional(),
  tech: z.string().optional(),
  features: z.string().optional(),
  users: z.string().optional(),
  process: z.string().optional(),
  area: z.string().optional(),
  appStage: z.string().optional(),
  auditScope: z.string().optional(),
  package_name: z.string().optional(),
});

export type ContactSchema = z.infer<typeof contactSchema>;
