/**
 * Magsil Móveis — Single source of truth para dados do negócio.
 *
 * Toda informação institucional, de contato, endereço, horário e redes sociais
 * deve ser consumida deste arquivo. Trocar um número de telefone, uma URL ou
 * uma linha de copy aqui propaga para todo o site (Header, Footer, ChatWidget,
 * WhatsAppButton, contato.astro, páginas legais, JSON-LD, etc.).
 *
 * Helpers de WhatsApp ficam no final do arquivo.
 */

export const business = {
  // ── Identidade ──────────────────────────────────────────────────────────
  name: 'Magsil Móveis',
  legalName: 'Magsil Móveis Artesanais Ltda.',
  cnpj: '32.792.105/0001-17',
  foundingDate: '2017',
  foundingYear: 2017,
  tagline: 'Móveis artesanais em fibra sintética e corda náutica',

  // ── Descrições (SEO / marketing) ────────────────────────────────────────
  // Curta: ~155 chars, ideal para meta description.
  description:
    'Móveis artesanais em fibra sintética UV e corda náutica. Design autoral desde 2017. Peças exclusivas para varandas, jardins e áreas de lazer.',
  // Longa: institucional, footer e about.
  descriptionLong:
    'Fabricante de móveis artesanais em fibra sintética e corda náutica. Peças exclusivas para varandas, jardins e áreas de lazer. Atendemos AL, SE, PE e todo o Nordeste.',

  // ── Contato ─────────────────────────────────────────────────────────────
  email: 'contato@magsilmoveis.com.br',
  phone: {
    /** Apenas dígitos com DDI (E.164 sem '+'). Use em URLs do wa.me. */
    raw: '5582999022950',
    /** E.164 completo. Use no atributo `telephone` do JSON-LD LocalBusiness. */
    e164: '+5582999022950',
    /** Formato visual brasileiro. Use em UI. */
    formatted: '(82) 99902-2950',
    /** Pronto para `<a href={...}>`. */
    tel: 'tel:+5582999022950',
    /** Formato schema.org com hífens. */
    schema: '+55-82-99902-2950',
  },

  // ── Endereço ────────────────────────────────────────────────────────────
  address: {
    street: 'Rua São Gabriel, 32',
    neighborhood: 'Canafístula',
    city: 'Arapiraca',
    state: 'AL',
    postalCode: '57302-792',
    country: 'BR',
    /** Linha única, separadores em ponto-meio. */
    full: 'Rua São Gabriel, 32 — Canafístula · Arapiraca/AL · CEP 57302-792',
    /** 3 linhas, para uso em <address> com <br />. */
    multiline: ['Rua São Gabriel, 32', 'Canafístula · Arapiraca/AL', 'CEP 57302-792'] as const,
    geo: { latitude: -9.7516, longitude: -36.6608 },
    mapsUrl:
      'https://maps.google.com/?q=Rua+S%C3%A3o+Gabriel,+32,+Canaf%C3%ADstula,+Arapiraca,+AL',
  },

  // ── Horário de atendimento ──────────────────────────────────────────────
  hours: {
    /** String para humanos. Use em UI. */
    display: 'Seg–Sex: 08h–11h30 e 13h–17h30\nSáb: 08h–11h30',
    /** Forma estruturada para JSON-LD `openingHoursSpecification`. */
    schema: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '11:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '13:00',
        closes: '17:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '11:30',
      },
    ],
  },

  // ── Redes sociais ───────────────────────────────────────────────────────
  social: {
    instagram: 'https://www.instagram.com/magsilmoveis/',
    facebook: 'https://www.facebook.com/magsilmoveis/',
    tiktok: 'https://www.tiktok.com/@magsilmoveis',
  },

  // ── Schema.org ──────────────────────────────────────────────────────────
  /** Faixa de preço schema.org. '$$$' = premium artesanal. */
  priceRange: '$$$',
} as const;

// ────────────────────────────────────────────────────────────────────────
// WHATSAPP HELPERS
// ────────────────────────────────────────────────────────────────────────

/**
 * Mensagens pré-definidas para abertura de conversa via WhatsApp.
 * Centralizadas para evitar typos espalhados pelo código e para facilitar
 * testes A/B de copy futuramente.
 */
export const whatsappMessages = {
  default: 'Olá! Vim pelo site e gostaria de mais informações.',
  quote: 'Olá! Vim pelo site e gostaria de solicitar um orçamento.',
  quoteCustom:
    'Olá! Vim pelo site e gostaria de solicitar um orçamento personalizado.',
  catalog: 'Olá! Vim pelo site e quero conhecer os produtos da Magsil.',
  custom: 'Olá! Tenho interesse em um projeto sob medida da Magsil.',
  faq: 'Olá! Tenho uma dúvida sobre os produtos da Magsil.',
} as const;

export type WhatsappMessageKey = keyof typeof whatsappMessages;

/**
 * Gera uma URL `wa.me` com mensagem opcional pré-preenchida.
 *
 * @example
 * whatsappLink()                              // https://wa.me/5582999022950
 * whatsappLink(whatsappMessages.quote)        // ...?text=Ol%C3%A1...
 * whatsappLink('Olá, tenho uma dúvida.')      // string custom também aceita
 */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${business.phone.raw}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/**
 * Conveniência: dado uma chave de `whatsappMessages`, retorna a URL.
 *
 * @example
 * whatsappLinkFor('quote') // = whatsappLink(whatsappMessages.quote)
 */
export function whatsappLinkFor(key: WhatsappMessageKey): string {
  return whatsappLink(whatsappMessages[key]);
}