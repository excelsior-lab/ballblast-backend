// scripts/update_rankings.js
import fs from "fs";
import fetch from "node-fetch";

const PROJECT_ID = "ball-blast-game-7903f";
const COLLECTION = "highest_score";

const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;

async function main() {
  console.log("Fetching Firestore data...");
  const res = await fetch(FIRESTORE_URL);
  const data = await res.json();

  if (!data.documents) {
    console.error("No documents found or Firestore access denied.");
    process.exit(1);
  }

  // Convert Firestore document format → plain object
  const list = data.documents.map(doc => {
    const f = doc.fields;
    return {
      uid: f.uid?.stringValue || "",
      username: f.username?.stringValue || "",
      score: Number(f.score?.integerValue || 0),
      level: Number(f.level?.integerValue || 0),
      platform: f.platform?.stringValue || "",
      createAt: f.createAt?.timestampValue || "",
      regionCode: f.regionCode?.stringValue || "",
    };
  });

  // Sort by score DESC
  list.sort((a, b) => b.score - a.score);

  // Save to rankings.json
  fs.writeFileSync("rankings.json", JSON.stringify(list, null, 2));
  console.log(`✅ Updated rankings.json (${list.length} entries)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
