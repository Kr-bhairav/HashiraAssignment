const fs = require('fs');

function decodeBigIntValue(baseStr, valueStr) {
    const base = BigInt(parseInt(baseStr, 10));
    let result = 0n;
    let digits = valueStr.toLowerCase();

    const charToDigit = c => {
        if ('0' <= c && c <= '9') return BigInt(c.charCodeAt(0) - '0'.charCodeAt(0));
        else return BigInt(c.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
    };

    for (let i = 0; i < digits.length; i++) {
        let d = charToDigit(digits[i]);
        if (d >= base) throw new Error(`Digit ${digits[i]} out of range for base ${baseStr}`);
        result = result * base + d;
    }
    return result;
}

function lagrangeInterpolationAtZero(points) {
    let result = 0n;
    const k = points.length;

    for (let j = 0; j < k; j++) {
        const { x: xj, y: yj } = points[j];
        let numerator = 1n;
        let denominator = 1n;

        for (let m = 0; m < k; m++) {
            if (m !== j) {
                const xm = points[m].x;
                numerator *= -xm;
                denominator *= (xj - xm);
            }
        }

        const termNumerator = yj * numerator;

        if (termNumerator % denominator !== 0n) {
            throw new Error('Non-integer division encountered in interpolation');
        }

        result += termNumerator / denominator;
    }

    if (result < 0n) {
        // Should not be negative per assignment but just in case
        throw new Error('Negative secret found, check input');
    }

    return result;
}

function processInput(jsonData) {
    const n = jsonData.keys.n;
    const k = jsonData.keys.k;

    const points = [];

    for (const key in jsonData) {
        if (key === 'keys') continue;
        const x = BigInt(key);
        const { base, value } = jsonData[key];
        const y = decodeBigIntValue(base, value);
        points.push({ x, y });
    }

    // Use first k points to interpolate
    const selectedPoints = points.slice(0, k);

    return lagrangeInterpolationAtZero(selectedPoints);
}

// Main runner
try {
    const input1 = JSON.parse(fs.readFileSync('testcase1.json', 'utf8'));
    const input2 = JSON.parse(fs.readFileSync('testcase2.json', 'utf8'));

    const secret1 = processInput(input1);
    const secret2 = processInput(input2);

    console.log('Secret for Testcase 1:', secret1.toString());
    console.log('Secret for Testcase 2:', secret2.toString());
} catch (error) {
    console.error('Error:', error.message);
}
