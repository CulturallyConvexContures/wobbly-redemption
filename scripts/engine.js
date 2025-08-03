
// ==== DATA IMPORT ====
let rarityTable, perks, lootTable;
let currentXP = parseInt(localStorage.getItem("xp")) || 0;

// Fetch JSON data with error handling
Promise.all([
  fetch('data/rarity-table.json').then(r => r.json()),
  fetch('data/perk-table.json').then(r => r.json()),
  fetch('data/loot-table.json').then(r => r.json())
]).then(([rarities, perkData, lootData]) => {
  rarityTable = rarities;
  perks = flattenPerks(perkData);
  lootTable = lootData;
}).catch(err => {
  console.error("Failed to load game data:", err);
});

// ==== FLATTEN PERK OBJECT ====
function flattenPerks(perkThemes) {
  return Object.values(perkThemes).reduce((acc, group) => ({ ...acc, ...group }), {});
}

// ==== CALCULATE XP FROM ROLL ====
function getXPFromRoll(roll, loot) {
  return loot && loot.name.includes("Nothing") ? 0 : Math.ceil(roll * 100);
}

// ==== ROLL BONES ====
function tossBones() {
  if (!rarityTable || !perks || !lootTable) {
    console.warn("Roll attempted before data fully loaded.");
    return;
  }

  const roll = Math.floor(Math.random() * 1000) + 1;
  const rarity = getRarity(roll);
  const flavor = getFlavor(rarity);
  const loot = rollLoot(rarity.name);
  const perk = perks[roll];

  const xpGained = getXPFromRoll(roll, loot);
  currentXP += xpGained;
  localStorage.setItem("xp", currentXP);

  const xpDisplay = document.getElementById("xp-display");
  if (xpDisplay) {
    xpDisplay.textContent = `XP: ${currentXP}`;
  }

  // Placeholder: Insert UI update logic here for roll results (rarity, flavor, loot, perk)
}
window.tossBones = tossBones;