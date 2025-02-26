const puppeteer = require("puppeteer");
const fs = require("fs");

// Load JSON file with topics and URLs
const topics = JSON.parse(fs.readFileSync("topics_fresh.json", "utf-8")).slice(0, 4); // Limit to 84 topics

// ✅ CSS Styling for Extracted Pages & Index Page
const cssStyle = `
<style>
    
    body { 
        font-family: 'Times New Roman', serif; 
        line-height: 1.6; 
        margin: 30px; 
        padding: 20px; 
        background: #f9f9f9; 
        color: #333; 
        text-align: justify; /* ✅ Justify Text */
        hyphens: auto; /* ✅ Enable Hyphenation */
    }

    h1, h2 { color: #0073e6; text-align: center; }

    .content-section { 
        background: #fff; 
        padding: 20px; 
        border-radius: 8px; 
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        text-align: justify; /* ✅ Justify Content */
        hyphens: auto; /* ✅ Enable Hyphenation */
    }

    /* ✅ PDF Printing Styles */
    @media print {
    body { 
        margin: 5mm; /* Reduce margin space */
        border: 2px solid black; /* Ensure border on all sides */
        padding: 5mm; /* Reduce padding */
        text-align: justify; 
        hyphens: auto;
    }

    .download-container { 
        display: none !important; /* Hide Download Button in PDF */
    }

    table, th, td { 
        border: 1px solid black !important; /* Ensure table borders are black */
    }

    @page { 
        @page {
    margin: 5mm; /* Reduce margin */
    size: A4; /* Ensure proper A4 formatting */
    @top-left { content: none; } /* Remove headers */
    @bottom-left { content: none; } /* Remove footers */
}

    }
}



    /* ✅ Fixed Download Button at Top */
    .download-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        background: #0073e6;
        padding: 15px 0;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .download-button {
        padding: 12px 20px;
        font-size: 18px;
        background: white;
        color: #0073e6;
        text-align: center;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
        cursor: pointer;
        border: 2px solid #0073e6;
        transition: all 0.3s ease;
    }

    .download-button:hover {
        background: #0073e6;
        color: white;
    }

    /* ✅ Table Styling */
    table { width: 100%; border-collapse: collapse; margin: 20px 0; border-spacing: 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #0073e6; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }

    /* ✅ Math Expressions Styling */
    .math { font-family: "Courier New", monospace; font-size: 18px; color: #d9534f; }
    .katex-html { display: none; }

    /* ✅ Improved PDF Printing Styles */
    @media print {
        body { margin: 10mm; border: 2px solid black; padding: 10mm; } /* ✅ Smaller Margins & Page Border */
        .download-container { display: none !important; } /* ✅ Hide Download Button in PDF */
        table, th, td { border: 1px solid black !important; }

        /* ✅ Hide file path/footer when printing */
        @page {
            margin: 10mm; /* ✅ Remove default browser headers/footers */
        }
    }
</style>

<!-- ✅ MathJax for Math Expressions -->
<script>
    MathJax = {
        tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
    };
</script>
<script async src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script async id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
`;

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let indexLinks = [];

    for (const topic of topics) {
        const name = topic.name.replace(/\s+/g, "_").replace(/\W+/g, "");
        const url = topic.url;
        const htmlFilename = `${name}_styled.html`;

        console.log(`📌 Processing: ${name}`);
        await page.goto(url, { waitUntil: "networkidle2" });
        await page.waitForSelector(".content-section .content-container", { timeout: 5000 });

        // ✅ Extract Content
        const content = await page.evaluate(() => {
            const container = document.querySelector(".content-section .content-container");
            return container ? container.innerHTML : "⚠️ No content found!";
        });

        // ✅ Create Styled HTML
        const htmlContent = `
        <html>
        <head>${cssStyle}</head>
        <body>
            <div class="download-container">
                <a href="#" onclick="this.style.display='none'; window.print();" class="download-button">Download as PDF</a>
            </div>
            <div class="content-section">${content}</div>
        </body>
        </html>`;

        fs.writeFileSync(htmlFilename, htmlContent, "utf8");
        console.log(`✅ HTML saved: ${htmlFilename}`);

        indexLinks.push(`<li><a href="${htmlFilename}">${topic.name}</a></li>`);
    }

    // ✅ Create Index Page
    const indexPage = `
    <html>
    <head>
        ${cssStyle}
        <title>Index Page</title>
        <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f4f4f9; margin: 0; }
            h1 { color: #333; margin-bottom: 20px; }
            ul { display: flex; flex-wrap: wrap; gap: 15px; list-style: none; padding: 0; max-width: 800px; justify-content: center; }
            li { background: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s, box-shadow 0.2s; }
            li:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
            a { text-decoration: none; color: #007BFF; font-weight: bold; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>Extracted Topics</h1>
        <ul>${indexLinks.join("")}</ul>
    </body>
    </html>`;

    fs.writeFileSync("index_improved.html", indexPage, "utf8");
    console.log("✅ Index page created: index_improved.html");

    await browser.close();
    console.log("🎉 Process completed for 4 URLs!");
})();
