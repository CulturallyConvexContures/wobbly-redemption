
// ==== DATA IMPORT ====
let rarityTable, perks, lootTable;
let currentXP = 0;
// Fetch JSON data
Promise.all([
  fetch('data/rarity-table.json').then(r => r.json()),
  fetch('data/perk-table.json').then(r => r.json()),
  fetch('data/loot-table.json').then(r => r.json())
]).then(([rarities, perkData, lootData]) => {
  rarityTable = rarities;
  perks = flattenPerks(perkData);
  lootTable = lootData;
});
// ==== FLATTEN PERK OBJECT (grouped by theme) ====
function flattenPerks(perkThemes) {
  return Object.values(perkThemes).reduce((acc, group) => ({ ...acc, ...group }), {});
}

// ==== ROLL BONES ====
function tossBones() {
  const roll = Math.floor(Math.random() * 1000) + 1;
  const rarity = getRarity(roll);
  const flavor = getFlavor(rarity);
  const loot = rollLoot(rarity.name);
  const perk = perks[roll];
// Add XP based on roll number (you can adjust this formula later)
const xpGained = Math.ceil(roll / 100); // e.g. roll 847 = +9 XP
currentXP += xpGained;
  const result = `
    🎲 <b>${roll}</b> → 
    ${flavor.moisture} ${flavor.thickness} <b>${rarity.name}</b><br>
    ${loot ? `💎 Loot: ${loot.name}` : '🕳️ Nothing gained'}<br>
    ${perk ? `${perk}` : ''}
  `;

  document.getElementById("resultText").innerHTML = result;
}

// ==== RARITY FINDER ====
function getRarity(roll) {
  return rarityTable.find(r => roll >= r.min && roll <= r.max) || rarityTable[0];
}

// ==== FLAVOR COMBO ====
function getFlavor(rarity) {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return {
    moisture: pick(rarity.flavors.moisture),
    thickness: pick(rarity.flavors.thickness)
  };
}

// ==== LOOT FUNCTION ====
function rollLoot(rarityName) {
  const possible = lootTable.filter(item => compareRarity(item.minRarity, rarityName));
  const roll = Math.random() * 100;
  let acc = 0;
  for (let item of possible) {
    acc += item.chance;
    if (roll <= acc) return item;
  }
  return null;
}

// ==== RARITY COMPARISON LOGIC ====
const rarityOrder = ["Dusty", "Glimmer", "Radiant", "Mythborn", "Fated"];
function compareRarity(min, actual) {
  return rarityOrder.indexOf(actual) >= rarityOrder.indexOf(min);
}

// ==== RESET FUNCTION ====
window.tossBones = tossBones;
window.resetXP = function resetXP() {
  currentXP = 0;
  document.getElementById("resultText").innerHTML = "🎲";
  document.getElementById("xpTracker").innerText = "XP: 0";
};