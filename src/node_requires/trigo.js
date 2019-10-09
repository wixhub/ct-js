// Mainly copied from ct.js itself
const trigo = {
    // lengthdir_x
    ldx(l, d) {
        return l * Math.cos(d * Math.PI / -180);
    },
    // lengthdir_y
    ldy(l, d) {
        return l * Math.sin(d * Math.PI / -180);
    },
    // Point-point DirectioN
    pdn(x1, y1, x2, y2) {
        return (Math.atan2(y2 - y1, x2 - x1) * -180 / Math.PI + 360) % 360;
    },
    // Point-point DirectioN
    pdnRad(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    // Point-point DistanCe
    pdc(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    degToRad(deg) {
        return deg * Math.PI / -180;
    },
    radToDeg(rad) {
        return rad / Math.PI * -180;
    },
    /**
     * Rotates a vector (x; y) by deg around (0; 0)
     * @param {Number} x The x component
     * @param {Number} y The y component
     * @param {Number} deg The degree to rotate by
     * @returns {Array} A pair of new `x` and `y` parameters.
     */
    rotate(x, y, deg) {
        return trigo.rotateRad(x, y, trigo.degToRad(deg));
    },
    rotateRad(x, y, rad) {
        const sin = Math.sin(rad),
              cos = Math.cos(rad);
        return [
            cos * x - sin * y,
            cos * y + sin * x
        ];
    },
    // From https://stackoverflow.com/a/52847244
    rotationFromMatrix(matrix) {
        return -Math.atan2(matrix.b, matrix.a);
    },
    deltaDir(dir1, dir2) {
        dir1 = ((dir1 % 360) + 360) % 360;
        dir2 = ((dir2 % 360) + 360) % 360;
        var t = dir1,
            h = dir2,
            ta = h - t;
        if (ta > 180) {
            ta -= 360;
        }
        if (ta < -180) {
            ta += 360;
        }
        return ta;
    },
    deltaDirRad(dir1, dir2) {
        dir1 = ((dir1 % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
        dir2 = ((dir2 % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
        var t = dir1,
            h = dir2,
            ta = h - t;
        if (ta > Math.PI) {
            ta -= Math.PI*2;
        }
        if (ta < -Math.PI) {
            ta += Math.PI*2;
        }
        return ta;
    }
};

module.exports = trigo;
