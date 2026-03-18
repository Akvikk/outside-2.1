/**
 * Baccarat Configuration
 * Stores constants, payouts, and pattern definitions.
 * NO state or logic lives here.
 */

export const PATTERN_CONFIG = [
    { key: 'FLOW', label: 'Flow' },
    { key: 'ZIG-ZAG', label: 'Zig-Zag' },
    { key: 'FALSE BREAK', label: 'False Break' },
    { key: '1-2-3', label: '1-2-3 Build' },
    { key: '3-2-1', label: '3-2-1 Mirror' },
    { key: '1-1-3', label: '1-1-3 Burst' },
    { key: '3-1-1 DOWN', label: '3-1-1 Down' }
];

export const PAYOUT_RATES = {
    BANKER_COMMISSION: 0.95,
    DEFAULT: 1.00
};