
// ==== DATA IMPORT ====
let rarityTable, perks, lootTable;
let currentXP = parseInt(localStorage.getItem("xp")) || 0;
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

  const xpGained = loot && loot.name.includes("Nothing") ? 0 : Math.ceil(roll * 100);
  currentXP += xpGained;
  localStorage.setItem("xp", currentXP); // persist XP

  const result = `
  ð² <b>${roll}</b> â 
  <b>${rarity.name}</b> ${flavor.moisture} ${flavor.thickness}<br>
  ð Loot: ${loot ? loot.name : "â¨ Nothing"}<br>
  ${perk ? `ð ${perk}<br>` : ""}
  XP Gained: ${xpGained.toLocaleString()}<br>
  ${xpGained === 0 ? "No XP earnedð¥³<br>" : ""}
`;

  // â These two lines must be INSIDE tossBones()
  document.getElementById("resultText").innerHTML = result;
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
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
// ==== ON PAGE LOAD ====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
});
// ==== RESET FUNCTION ====

window.resetXP = function resetXP() {
  currentXP = 0;
  localStorage.setItem("xp", 0);
  document.getElementById("resultText").innerHTML = "ð²";
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
};
window.tossBones = tossBones;
