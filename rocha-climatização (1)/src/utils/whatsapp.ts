import { SiteSettings } from '../types/index.ts';

/**
 * Sanitizes and formats any phone string into a valid WhatsApp international number.
 * Automatically adds Brazilian country code 55 if missing (e.g. 11999998888 -> 5511999998888).
 */
export function cleanWhatsAppNumber(phone?: string, phoneRaw?: string): string {
  const input = (phone && phone.trim()) || (phoneRaw && phoneRaw.trim()) || '5511999685162';
  const digits = input.replace(/\D/g, '');

  if (!digits) return '5511999685162';

  // If Brazilian number with DDD (10 or 11 digits, e.g. 11999998888 or 1188887777), add country code 55
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Returns the designated principal WhatsApp number to receive quotes across the site.
 * Honors the primaryWhatsapp setting ('phone1' or 'phone2'), defaulting to phone1.
 */
export function getPrimaryWhatsAppNumber(settings?: Partial<SiteSettings>): string {
  if (!settings) return '5511999685162';

  if (settings.primaryWhatsapp === 'phone2') {
    return cleanWhatsAppNumber(settings.phone2, settings.phone2Raw);
  }

  return cleanWhatsAppNumber(settings.phone1, settings.phone1Raw);
}

export function buildWhatsAppUrl(
  settings: SiteSettings,
  customMessage?: string
): string {
  const cleanNumber = getPrimaryWhatsAppNumber(settings);

  const defaultMsg =
    customMessage ||
    `Olá! Acessei o site da ${settings.companyName || 'ROCHA CLIMATIZAÇÃO'} e gostaria de solicitar um orçamento para ar-condicionado. Poderia me passar mais informações?`;

  const encoded = encodeURIComponent(defaultMsg);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

export function buildServiceWhatsAppUrl(
  settings: SiteSettings,
  serviceName: string,
  extraDetails?: string
): string {
  const cleanNumber = getPrimaryWhatsAppNumber(settings);

  let text = `Olá! Acessei o site da ${settings.companyName || 'ROCHA CLIMATIZAÇÃO'} e gostaria de solicitar um orçamento para *${serviceName}*.`;
  if (extraDetails) {
    text += ` ${extraDetails}`;
  }
  text += ` Poderia me informar os valores e disponibilidade de atendimento?`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
