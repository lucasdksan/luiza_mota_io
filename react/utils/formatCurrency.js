export function formatCurrency(
    value,
    locale = "pt-BR",
    currency = "BRL"
) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(value);
}