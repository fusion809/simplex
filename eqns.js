/**
 * Render equations.
 * 
 * @params    None.
 * @return    Nothing, writes to file.
 */
function renderEqns() {
    // Canonical matrix form
    str1 = "<span class=\"katex-display\"><br/>";
    texStr1 = "\\begin{aligned}\n";
    texStr1 += "&\\mathrm{Maximize\\hspace{0.1cm}z} &&= \\mathbf{c}^T \\mathbf{x}";
    texStr1 += "\\\\\n";
    texStr1 += "&\\mathrm{Subject\\hspace{0.1cm}to:}\\\\\n";
    texStr1 += "&A\\mathbf{x} &&= \\mathbf{b} \\\\\n";
    texStr1 += "&\\mathbf{x} &&\\geq 0\\\\\n";
    texStr1 += "\\end{aligned}";
    str1 += katex.renderToString(texStr1);
    str1 += "</span>";
    document.getElementById("eqn1").innerHTML = str1;

    // Example problem
    str2 = "<span class=\"katex-display\"><br/>";
    texStr2 = "\\begin{aligned}\n";
    texStr2 += "&\\mathrm{Minimize\\hspace{0.1cm}G} &&= 200x_1 + 350x_2 + 430x_3";
    texStr2 += "\\\\\n";
    texStr2 += "&\\mathrm{Subject\\hspace{0.1cm}to:}\\\\\n";
    texStr2 += "&3x_1 + 5x_2 + 4x_3 &&\\geq 2500 \\\\\n";
    texStr2 += "&5x_1 + 4x_2 + 3x_3 &&\\geq 4800 \\\\\n";
    texStr2 += "&2x_1 + x_2 + 2x_3 &&\\leq 3500 \\\\\n";
    texStr2 += "&x_1 + x_2 + x_3 &&= 2000 \\\\\n";
    texStr2 += "&x_1, x_2, x_3 &&\\geq 0\n";
    texStr2 += "\\end{aligned}";
    str2 += katex.renderToString(texStr2);
    str2 += "</span>";
    document.getElementById("eqn2").innerHTML = str2;
}