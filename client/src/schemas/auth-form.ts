import { z } from 'zod';

import { type TFunction } from '@/i18n';

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });
}

export function createRegisterSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t('validation.nameRequired')).max(100, t('validation.nameTooLong')),
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(8, t('validation.passwordMin')).max(128, t('validation.passwordMax')),
  });
}
