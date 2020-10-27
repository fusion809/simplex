/**
 * Convert specified fraction string to decimal.
 * 
 * @param str      A string containing the fraction to convert to a number.
 * @return         Decimal.
 */
function fracToDecimal(str) {
    var fraction = math.fraction(str);
    return fraction.s * fraction.n/fraction.d;
}

function sign(number) {
    return Math.sign(number).toString().replace(/\d/, '');
}

/**
 * Convert a decimal to a fraction or integer string.
 * 
 * @param number Number to express.
 * @return       String integer/fraction representation of number.
 */
function decimalToFrac(number) {
    var numberFrac = math.fraction(number);
    if (numberFrac.d != 1) {
        return katex.renderToString(sign(numberFrac.s) + "\\dfrac{" + (numberFrac.n) + "}{" + numberFrac.d + "}");
    } else {
        return katex.renderToString("" + (numberFrac.s * numberFrac.n));
    }
}
