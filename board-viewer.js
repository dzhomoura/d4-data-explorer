
const board = require("./paladin-board-00.json");

const width = board.nWidth;

function symbol(node) {
  if (!node) return "  ";

  const name = node.name;

  if (name.includes("Start")) return "ST";
  if (name.includes("Gate")) return "GT";
  if (name.includes("Socket")) return "SO";
  if (name.includes("Legendary")) return "LG";
  if (name.includes("Rare")) return "RR";
  if (name.includes("Magic")) return "MM";
  if (name.includes("Normal")) return "NN";

  return "??";
}

console.log("\nPALADIN PARAGON BOARD\n");

for (let y = 0; y < width; y++) {
  let row = "";

  for (let x = 0; x < width; x++) {
    const index = y * width + x;
    const node = board.arEntries[index];

    row += symbol(node).padEnd(3);
  }

  console.log(row);
}

console.log("\nLEGEND");
console.log("ST = Starting node");
console.log("GT = Gate");
console.log("SO = Glyph socket");
console.log("RR = Rare");
console.log("MM = Magic");
console.log("NN = Normal");
console.log("LG = Legendary");
