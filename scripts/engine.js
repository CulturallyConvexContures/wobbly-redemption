// ==== DATA IMPORT ====
let rarityTable, perks;
let currentXP = parseInt(localStorage.getItem("xp")) || 0;

// Fetch JSON data
Promise.all([
  fetch('data/rarity-table.json').then(r => r.json()),
  fetch('data/perk-table.json').then(r => r.json())
]).then(([rarities, perkData]) => {
  rarityTable = rarities;
  perks = flattenPerks(perkData);
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
  const perk = perks[roll];

  const xpGained = Math.ceil(roll / 100);
  currentXP += xpGained;
  localStorage.setItem("xp", currentXP); // persist XP

  const result = `
    🎲 <b>${roll}</b> → 
    <b>${rarity.name}</b> ${flavor.moisture} ${flavor.thickness}<br>
    ${perk ? `${perk}` : ''}
  `;

  document.getElementById("resultText").innerHTML = result;
  document.getElementById("xpTracker").innerText = `XP: ${currentXP}`;
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

// ==== RESET FUNCTION ====
window.tossBones = tossBones;
window.resetXP = function resetXP() {
  currentXP = 0;
  localStorage.setItem("xp", 0);
  document.getElementById("resultText").innerHTML = "🎲";
  document.getElementById("xpTracker").innerText = "XP: 0";
};