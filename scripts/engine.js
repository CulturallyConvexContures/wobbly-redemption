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
  updateLevelDisplay();
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

  const xpGained = Math.ceil(roll * 100);
  currentXP += xpGained;
  localStorage.setItem("xp", currentXP);

  const result = `
    🎲 <b>${roll}</b> → 
    <b>${rarity.name}</b> ${flavor.moisture} ${flavor.thickness}<br>
    ${perk ? `🌟 ${perk}<br>` : ""}
    XP Gained: ${xpGained.toLocaleString()}<br>
  `;

  document.getElementById("resultText").innerHTML = result;
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
  updateLevelDisplay();
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

// ==== LEVEL SYSTEM (Exponential XP Curve) ====
const BASE_XP = 1000;      // Starting XP requirement
const GROWTH_RATE = 1.5;   // Exponential growth factor

function getXPForLevel(level) {
  return Math.floor(BASE_XP * Math.pow(level, GROWTH_RATE));
}

function getLevel(xp) {
  let level = 1;
  let xpNeeded = getXPForLevel(level);

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    xpNeeded = getXPForLevel(level);
  }

  return level;
}

function getXPIntoCurrentLevel(xp) {
  let level = 1;
  let xpNeeded = getXPForLevel(level);

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    xpNeeded = getXPForLevel(level);
  }

  return xp;
}

function updateLevelDisplay() {
  const level = getLevel(currentXP);
  const xpIntoLevel = getXPIntoCurrentLevel(currentXP);
  const xpForThisLevel = getXPForLevel(level);

  const percent = (xpIntoLevel / xpForThisLevel) * 100;

  const bar = document.getElementById("level-bar-fill");
  const levelDisplay = document.getElementById("level-display");

  if (bar) bar.style.width = percent + "%";
  if (levelDisplay) levelDisplay.textContent = `Level: ${level}`;
}

// ==== ON PAGE LOAD ====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
  updateLevelDisplay();
});

// ==== RESET FUNCTION ====
window.resetXP = function resetXP() {
  currentXP = 0;
  localStorage.setItem("xp", 0);
  document.getElementById("resultText").innerHTML = "🎲";
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
  updateLevelDisplay();
};

window.tossBones = tossBones;
