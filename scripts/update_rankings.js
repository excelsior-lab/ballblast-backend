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
      createAt: f.createAt?.stringValue || "",
      regionCode: f.regionCode?.stringValue || "",
    };
  });

  // Remove duplicates by uid (keep highest score)
  const uniqueMap = new Map();
  for (const item of list) {
    if (!uniqueMap.has(item.uid) || item.score > uniqueMap.get(item.uid).score) {
      uniqueMap.set(item.uid, item);
    }
  }
  const uniqueList = Array.from(uniqueMap.values());

  // Sort by score DESC
  uniqueList.sort((a, b) => b.score - a.score);

  // Limit to top 100
  const top100 = uniqueList.slice(0, 100);

  // Save to rankings.json
  fs.writeFileSync("rankings.json", JSON.stringify(top100, null, 2));
  console.log(`✅ Updated rankings.json (${top100.length} entries)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
