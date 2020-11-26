/**
 * Convert a decimal to a fraction or integer string.
 * 
 * @param number Number to express.
 * @return       String integer/fraction representation of number.
 */
function decimalToFrac(number) {
    var numberFrac = math.fraction(number);
    if (numberFrac.d != 1) {
        return katex.renderToString(sign(numberFrac.s) + "\\dfrac{" + 
        (numberFrac.n) + "}{" + numberFrac.d + "}");
    } else {
        return katex.renderToString("" + (numberFrac.s * numberFrac.n));
    }
}

/**
 * Convert specified fraction string to decimal.
 * 
 * @param str      A string containing the fraction to convert to a number.
 * @return         Decimal.
 */
function fracToDecimal(str) {
    // Extract fraction from string
    var fraction = math.fraction(str);

    // Extract number from fraction object
    return fraction.s * fraction.n/fraction.d;
}

/**
 * Determine the sign of the specified number.
 * 
 * @param number   Number whose sign is to be obtained.
 * @return         Either - or empty space.
 */
function sign(number) {
    return Math.sign(number).toString().replace(/\d/, '');
}
