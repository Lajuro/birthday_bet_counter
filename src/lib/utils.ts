import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número de telefone brasileiro
 * @param phone Número de telefone (com ou sem formatação)
 * @returns Número formatado como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Se o número estiver vazio, retorna vazio
  if (!cleaned) return '';
  
  // Se o número começar com +55 ou 55, remove
  const withoutCountry = cleaned.startsWith('55') ? cleaned.substring(2) : cleaned;
  
  // Se for um celular (com 9 dígitos após o DDD)
  if (withoutCountry.length === 11) {
    return withoutCountry.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  // Se for um telefone fixo (com 8 dígitos após o DDD)
  if (withoutCountry.length === 10) {
    return withoutCountry.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Se for apenas o DDD com o número sem o dígito 9
  if (withoutCountry.length === 9) {
    return withoutCountry.replace(/(\d{2})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  // Se o formato não for reconhecido, retorna como está
  return phone;
}
