export const FACE_GROUPS = {
    F1: {
        label: 'F1',
        name: 'Face 1',
        numbers: [1, 6, 10, 15, 24, 29, 33],
        color: '#32ADE6',
        fill: 'rgba(50, 173, 230, 0.42)',
        border: 'rgba(50, 173, 230, 0.65)',
        background: 'rgba(50, 173, 230, 0.12)',
        glow: 'rgba(50, 173, 230, 0.12)'
    },
    F2: {
        label: 'F2',
        name: 'Face 2',
        numbers: [2, 7, 11, 16, 20, 24, 25, 29, 34],
        color: '#FF9F0A',
        fill: 'rgba(255, 159, 10, 0.4)',
        border: 'rgba(255, 159, 10, 0.65)',
        background: 'rgba(255, 159, 10, 0.12)',
        glow: 'rgba(255, 159, 10, 0.12)'
    },
    F3: {
        label: 'F3',
        name: 'Face 3',
        numbers: [3, 8, 12, 17, 21, 26, 30, 35],
        color: '#BF5AF2',
        fill: 'rgba(191, 90, 242, 0.38)',
        border: 'rgba(191, 90, 242, 0.65)',
        background: 'rgba(191, 90, 242, 0.12)',
        glow: 'rgba(191, 90, 242, 0.12)'
    },
    F4: {
        label: 'F4',
        name: 'Face 4',
        numbers: [4, 9, 13, 18, 22, 27, 31, 36],
        color: '#FFD60A',
        fill: 'rgba(255, 214, 10, 0.38)',
        border: 'rgba(255, 214, 10, 0.65)',
        background: 'rgba(255, 214, 10, 0.14)',
        glow: 'rgba(255, 214, 10, 0.14)'
    },
    F5: {
        label: 'F5',
        name: 'Face 5',
        numbers: [0, 5, 10, 14, 15, 19, 23, 28, 32],
        color: '#FF453A',
        fill: 'rgba(255, 69, 58, 0.4)',
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

export function getFaceCellPresentation(value) {
    const faces = getFaceGroupsForNumber(value);

    if (faces.length === 0) {
        return {
            html: '<span class="text-xs font-bold text-gray-500">-</span>',
            style: ''
        };
    }

    if (faces.length === 1) {
        const face = faces[0];
        return {
            html: `<span class="text-white font-black tracking-wider">${face.label}</span>`,
            style: `background:linear-gradient(135deg, ${face.fill} 0%, rgba(32, 12, 24, 0.88) 100%); border-color:${face.border}; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px ${face.glow};`
        };
    }

    const [faceA, faceB] = faces;
    return {
        html: `
            <div class="flex items-center justify-center gap-2 w-full">
                <span class="text-white font-black tracking-wider">${faceA.label}</span>
                <span class="text-white/45 text-xs">/</span>
                <span class="text-white font-black tracking-wider">${faceB.label}</span>
            </div>
        `,
        style: `background:linear-gradient(135deg, ${faceA.fill} 0%, rgba(34, 14, 28, 0.92) 48%, rgba(34, 14, 28, 0.92) 52%, ${faceB.fill} 100%); border-color:rgba(255,255,255,0.1); box-shadow:inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px ${faceA.glow}, 0 0 18px ${faceB.glow};`
    };
}

export default FACE_GROUPS;
