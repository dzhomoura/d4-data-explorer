
const folder = process.argv[2] || "ParagonBoard";

const apiUrl =
  `https://api.github.com/repos/DiabloTools/d4data/contents/json/base/meta/${folder}`;

async function exploreRepository() {
  console.log(`\nExploring: ${folder}`);

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`GitHub error: ${response.status}`);
  }

  const files = await response.json();

  console.log(`Total entries: ${files.length}\n`);

  for (const file of files) {
    console.log(`[${file.type}] ${file.name}`);
  }
}

exploreRepository().catch(console.error);
