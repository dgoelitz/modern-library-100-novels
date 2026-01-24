import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import novels from "./novels.js"; // your novels file, make sure it has export default [...];

const readStatusFile = "./readStatus.json";

// Load read status
let readStatus = {};
if (existsSync(readStatusFile)) {
  readStatus = JSON.parse(readFileSync(readStatusFile, "utf-8"));
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function pad(str, length) {
  str = str.toString();
  if (str.length >= length) return str.slice(0, length);
  return str + ' '.repeat(length - str.length);
}

// Helper function to display novels
function displayNovels(list) {
    console.log(
    pad('Rank', 6) +
    pad('Title', 40) +
    pad('Author', 25) +
    pad('Year', 6)
  );
  console.log('-'.repeat(77));

  list.forEach(novel => {
    console.log(
      pad(novel.rank, 6) +
      pad(novel.title, 40) +
      pad(novel.author, 25) +
      pad(novel.year, 6)
    );
  });
}

// Sort function
function sortNovelsBy(field, ascending = true) {
  return [...novels].sort((a, b) => {
    if (typeof a[field] === "string") {
      return ascending
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    }
    return ascending ? a[field] - b[field] : b[field] - a[field];
  });
}

// Interactive prompt
function askSorting() {
  console.log("\nHow would you like to sort the novels?");
  console.log("Options: rank, title, author, year");
  rl.question("Enter sort field: ", field => {
    if (!["rank", "title", "author", "year"].includes(field)) {
      console.log("Invalid field. Showing original list.");
      displayNovels(novels);
      return rl.close();
    }

    rl.question("Ascending or descending? (asc/desc): ", order => {
      const ascending = order.toLowerCase() !== "desc";
      const sortedList = sortNovelsBy(field, ascending);
      console.log(`\n=== Sorted by ${field} (${ascending ? "ascending" : "descending"}) ===`);
      displayNovels(sortedList);
      rl.close();
    });
  });
}

// Start the app
console.log("=== Original List ===");
displayNovels(novels);
askSorting();