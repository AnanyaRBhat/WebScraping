const axios = require("axios");// replacement for beautiful soup 
const fs = require("fs");// selenuim beauitful soup
const { exec } = require("child_process"); // to call another js file 
const cheerio = require("cheerio");
// make sure to npm install all these libraries before running code 
const BASE_URL = "https://www.sparkl.me";
const START_URL =
  "https://www.sparkl.me/learn/ib/physics-hl/types-of-waves-transverse-and-longitudinal/revision-notes/1280";

async function extractTopicLinks(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let links = [];

    // my tagret is to get all the links  subtopics from the page - especially from the container "left-section" _ but i found a better alternative
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href").trim();
      const name = $(element).text().trim();

      // so basically i will first extract a href of the entire page - them check if it is has revsion-notes in it -if yes then add 
      if (href.includes("/learn/ib/physics-hl/") && href.includes("revision-notes")) {
        const fullUrl = href.startsWith("http") ? href : BASE_URL + href;
        links.push({ name, url: fullUrl });
      }
    });

    // for some reasons i had a issue when topics were rendering multiple times - so i had to use this to remove duplicates
    const uniqueTopics = Array.from(
      new Map(links.map((topic) => [topic.url, topic])).values()
    );

    // Save to JSON file
    fs.writeFileSync("topics_fresh.json", JSON.stringify(uniqueTopics, null, 4));
    // just for debugging -
    console.log(`✅ Extracted ${uniqueTopics.length} unique topics. Saved to topics_fresh.json`);

    //  Auto-run scrape.js after extracting topics
    console.log("🚀 Starting checkpoint2.js to scrape extracted links...");
    exec("scrape_and_pdf.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error executing scrape.js: ${error.message}`);
        return;
      }
      if (stderr) console.error(`⚠️ stderr: ${stderr}`);
      console.log(`✅ scrape_and_pdf.js Output:\n${stdout}`);
    });
  } catch (error) {
    console.error("❌ Error fetching the page:", error.message);
  }
}

// Running the function
extractTopicLinks(START_URL);
