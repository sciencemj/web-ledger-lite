'use client';
import type { CurrencyCode, CurrencyOption } from './types';
import { CURRENCY_OPTIONS } from './consts';

export const getCurrencyConfig = (currencyCode: CurrencyCode): CurrencyOption => {
    return CURRENCY_OPTIONS.find(c => c.value === currencyCode) || CURRENCY_OPTIONS[0];
};

export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode,
  optionsOverride?: Intl.NumberFormatOptions
): string => {
  const config = getCurrencyConfig(currencyCode);

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
  };

  if (currencyCode === 'JPY' || currencyCode === 'KRW') {
    defaultOptions.minimumFractionDigits = 0;
    defaultOptions.maximumFractionDigits = 0;
  } else {
    defaultOptions.minimumFractionDigits = 2;
    defaultOptions.maximumFractionDigits = 2;
  }

  const finalOptions = { ...defaultOptions, ...optionsOverride };

  try {
    return new Intl.NumberFormat(config.defaultLocale, finalOptions).format(amount);
  } catch (e) {
    console.warn(`Currency formatting error for ${currencyCode}, falling back. Error: ${e}`);
    const symbol = config.symbol;
    const numStr = (currencyCode === 'JPY' || currencyCode === 'KRW') ? amount.toFixed(0) : amount.toFixed(2);
    return `${symbol}${numStr}`;
  }
};
