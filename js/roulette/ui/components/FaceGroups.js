export const FACE_GROUPS = {
    F1: {
        label: 'F1',
        name: 'Face 1',
        numbers: [1, 6, 10, 15, 24, 29, 33],
        color: '#32ADE6',
        border: 'rgba(50, 173, 230, 0.65)',
        background: 'rgba(50, 173, 230, 0.12)',
        glow: 'rgba(50, 173, 230, 0.12)'
    },
    F2: {
        label: 'F2',
        name: 'Face 2',
        numbers: [2, 7, 11, 16, 20, 24, 25, 29],
        color: '#FF9F0A',
        border: 'rgba(255, 159, 10, 0.65)',
        background: 'rgba(255, 159, 10, 0.12)',
        glow: 'rgba(255, 159, 10, 0.12)'
    },
    F3: {
        label: 'F3',
        name: 'Face 3',
        numbers: [3, 8, 12, 17, 21, 26, 30, 35],
        color: '#BF5AF2',
        border: 'rgba(191, 90, 242, 0.65)',
        background: 'rgba(191, 90, 242, 0.12)',
        glow: 'rgba(191, 90, 242, 0.12)'
    },
    F4: {
        label: 'F4',
        name: 'Face 4',
        numbers: [4, 9, 13, 18, 22, 27, 31, 36],
        color: '#FFD60A',
        border: 'rgba(255, 214, 10, 0.65)',
        background: 'rgba(255, 214, 10, 0.14)',
        glow: 'rgba(255, 214, 10, 0.14)'
    },
    F5: {
        label: 'F5',
        name: 'Face 5',
        numbers: [0, 5, 10, 14, 15, 19, 23, 28, 32],
        color: '#FF453A',
        border: 'rgba(255, 69, 58, 0.65)',
        background: 'rgba(255, 69, 58, 0.12)',
        glow: 'rgba(255, 69, 58, 0.12)'
    }
};

const FACE_LOOKUP = new Map();

Object.entries(FACE_GROUPS).forEach(([key, config]) => {
    config.numbers.forEach((num) => {
        if (!FACE_LOOKUP.has(num)) FACE_LOOKUP.set(num, []);
        FACE_LOOKUP.get(num).push(key);
    });
});

export function getFaceGroupsForNumber(value) {
    const keys = FACE_LOOKUP.get(Number(value)) || [];
    return keys.map((key) => ({ key, ...FACE_GROUPS[key] }));
}

export function renderFaceBadges(value) {
    const faces = getFaceGroupsForNumber(value);

    if (faces.length === 0) {
        return `
            <div class="flex items-center justify-center w-full h-full">
                <span class="text-xs font-bold text-gray-500">-</span>
            </div>
        `;
    }

    if (faces.length === 1) {
        const face = faces[0];
        return `
            <div class="flex items-center justify-center w-full">
                <div
                    class="w-full rounded-xl border px-2 py-2 text-sm font-black uppercase tracking-wider"
                    style="color:#f8fafc; border-color:${face.border}; background:linear-gradient(135deg, ${face.background} 0%, rgba(18,12,24,0.72) 100%); box-shadow:inset 0 1px 0 rgba(255,255,255,0.06), 0 0 18px ${face.glow}; text-shadow:0 1px 2px rgba(0,0,0,0.45);">
                    ${face.label}
                </div>
            </div>
        `;
    }

    return `
        <div class="grid grid-cols-2 gap-1 w-full">
            ${faces.map((face) => `
                <span
                    class="inline-flex items-center justify-center rounded-lg border px-1 py-2 text-xs font-black uppercase tracking-wide"
                    style="color:#f8fafc; border-color:${face.border}; background:linear-gradient(135deg, ${face.background} 0%, rgba(18,12,24,0.72) 100%); box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px ${face.glow}; white-space:nowrap; text-shadow:0 1px 2px rgba(0,0,0,0.45);"
                    title="${face.name}">
                    ${face.label}
                </span>
            `).join('')}
        </div>
    `;
}

export default FACE_GROUPS;
