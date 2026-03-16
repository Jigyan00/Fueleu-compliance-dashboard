const GRAMS_PER_TONNE_CO2E = 1_000_000;

const TONNES_FORMATTER = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export function formatCbTonnes(value: number): string {
    return `${TONNES_FORMATTER.format(value / GRAMS_PER_TONNE_CO2E)} tCO₂e`;
}
