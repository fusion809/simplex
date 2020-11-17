/**
 * Render equations.
 * 
 * @params    None.
 * @return    Nothing, writes to file.
 */
function renderEqns() {
    // Canonical matrix form
    str1 = "\\begin{aligned}\n";
    str1 += "&\\mathrm{Maximize\\hspace{0.1cm}z} &&= \\mathbf{c}^T \\mathbf{x}";
    str1 += "\\\\\n";
    str1 += "&\\mathrm{Subject\\hspace{0.1cm}to:}\\\\\n";
    str1 += "&A\\mathbf{x} &&= \\mathbf{b} \\\\\n";
    str1 += "&\\mathbf{x} &&\\geq 0\\\\\n";
    str1 += "\\end{aligned}";
    str1 = katex.renderToString(str1);
    document.getElementById("eqn1").innerHTML = str1;

    // Example problem
    str2 = "\\begin{aligned}\n";
    str2 += "&\\mathrm{Minimize\\hspace{0.1cm}G} &&= 200x_1 + 350x_2 + 430x_3";
    str2 += "\\\\\n";
    str2 += "&\\mathrm{Subject\\hspace{0.1cm}to:}\\\\\n";
    str2 += "&3x_1 + 5x_2 + 4x_3 &&\\geq 2500 \\\\\n";
    str2 += "&5x_1 + 4x_2 + 3x_3 &&\\geq 4800 \\\\\n";
    str2 += "&2x_1 + x_2 + 2x_3 &&\\leq 3500 \\\\\n";
    str2 += "&x_1 + x_2 + x_3 &&= 2000 \\\\\n";
    str2 += "&x_1, x_2, x_3 &&\\geq 0\n";
    str2 += "\\end{aligned}";
    str2 = katex.renderToString(str2);
    document.getElementById("eqn2").innerHTML = str2;
}