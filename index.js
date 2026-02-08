import { createInterface } from "readline";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

import novels from "./novels.json" with { type: "json" };

const readStatusFile = "./readStatus.json";
const templateFile = "./readStatus.template.json";

if (!existsSync(readStatusFile)) {
  copyFileSync(templateFile, readStatusFile);
}

const readStatus = JSON.parse(
  readFileSync(readStatusFile, "utf-8")
);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function pad(str, length) {
  str = str.toString();
  if (str.length >= length) return str.slice(0, length);
  return str + ' '.repeat(length - str.length);
}

function displayNovels(list) {
    console.log(
    pad('Rank', 6) +
    pad('Title', 40) +
    pad('Author', 25) +
    pad('Year', 6)
  );
  console.log('-'.repeat(77));

  list.forEach(novel => {
    let textColor = readStatus[novel.rank]
      ? "\x1b[31m"
      : "";

    console.log(
      textColor +
      pad(novel.rank, 6) +
      pad(novel.title, 40) +
      pad(novel.author, 25) +
      pad(novel.year, 6) +
      "\x1b[0m"
    );
  });
}

function saveReadStatus() {
  writeFileSync(readStatusFile, JSON.stringify(readStatus, null, 2));
}

function markNovel() {
  rl.question("Enter rank of novel to toggle read/unread: ", input => {
    const rank = Number(input);
    const novel = novels.find(n => n.rank === rank);
    if (!novel) {
      console.log("Invalid rank.");
    } else {
      readStatus[rank] = !readStatus[rank];
      console.log(`${novel.title} marked as ${readStatus[rank] ? "read" : "unread"}.`);
      saveReadStatus();
    }
    mainMenu();
  });
}

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

function askSorting() {
  console.log("\nHow would you like to sort the novels?");
  console.log("Options: rank, title, author, year");
  rl.question("Enter sort field: ", field => {
    if (field.startsWith("r")) field = "rank";
    if (field.startsWith("t")) field = "title";
    if (field.startsWith("a")) field = "author";
    if (field.startsWith("y")) field = "year";

    if (!["rank", "title", "author", "year"].includes(field)) {
      console.log("Invalid field.");
      return mainMenu();
    }

    rl.question("Ascending or descending? (asc/desc): ", order => {
      const ascending = !order.toLowerCase().startsWith("d");
      const sortedList = sortNovelsBy(field, ascending);

      console.log(`\n=== Sorted by ${field} (${ascending ? "ascending" : "descending"}) ===`);
      
      displayNovels(sortedList);
      mainMenu();
    });
  });
}

function mainMenu() {
  rl.question("What do you want to do? (mark/sort/exit): ", (choice) => {
    if (choice.startsWith("m")) markNovel();
    else if (choice.startsWith("s")) askSorting();
    else if (choice.startsWith("e")) rl.close();
    else mainMenu();
  });
}

// Start app
displayNovels(novels);
mainMenu();