export function getStyle(t) {
    if (t === 'R' || t === 'C1') return 'card-style style-red';
    if (t === 'B' || t === 'C2') return 'card-style style-black';
    if (t === 'H') return 'card-style style-orange';
    if (t === 'L') return 'card-style style-blue';
    if (t === 'O') return 'card-style style-purple';
    if (t === 'E') return 'card-style style-pink';
    if (t === 'D1') return 'card-style style-cyan';
    if (t === 'D2') return 'card-style style-gray';
    if (t === 'D3' || t === 'C3') return 'card-style style-yellow';
    return 'card-style style-gray';
}

export function getName(categoryName, t) {
    if (categoryName === 'Color') return t === 'R' ? 'RED' : 'BLACK';
    if (categoryName === 'High/Low') return t === 'H' ? 'HIGH' : 'LOW';
    if (categoryName === 'Odd/Even') return t === 'O' ? 'ODD' : 'EVEN';
    return t;
}