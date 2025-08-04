let rarityTable, perks;
let currentXP = parseInt(localStorage.getItem("xp")) || 0;
let bones = parseInt(localStorage.getItem("bones")) || 3; // Start with 3 bones

Promise.all([
  fetch("data/rarity-table.json").then(r => r.json()),
  fetch("data/perk-table.json").then(r => r.json())
]).then(([rarities, perkData]) => {
  rarityTable = rarities;
  perks = flattenPerks(perkData);
  updateLevelDisplay();
  updateBoneDisplay();
});

function flattenPerks(perkThemes) {
  return Object.values(perkThemes).reduce((acc, group) => ({ ...acc, ...group }), {});
}

function tossBones() {
  if (bones <= 0) {
    alert("🦴 You need more bones to roll!");
    return;
  }

  bones--;
  localStorage.setItem("bones", bones);
  updateBoneDisplay();

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

function getRarity(roll) {
  return rarityTable.find(r => roll >= r.min && roll <= r.max) || rarityTable[0];
}

function getFlavor(rarity) {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return {
    moisture: pick(rarity.flavors.moisture),
    thickness: pick(rarity.flavors.thickness)
  };
}

// ==== XP + LEVEL LOGIC ====
const BASE_XP = 1000;
const GROWTH_RATE = 1.5;

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

// ==== BONE TRACKER ====
function updateBoneDisplay() {
  const boneDisplay = document.getElementById("boneTracker");
  if (boneDisplay) boneDisplay.innerText = `🦴 Bones: ${bones}`;
}

function addBones(count = 1) {
  bones += count;
  localStorage.setItem("bones", bones);
  updateBoneDisplay();
}

// ==== ON LOAD ====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
  updateLevelDisplay();
  updateBoneDisplay();
});

// ==== RESET ====
window.resetXP = function resetXP() {
  currentXP = 0;
  bones = 0;
  localStorage.setItem("xp", 0);
  localStorage.setItem("bones", 0);
  document.getElementById("resultText").innerHTML = "🎲";
  document.getElementById("xpTracker").innerText = `XP: ${currentXP.toLocaleString()}`;
  updateLevelDisplay();
  updateBoneDisplay();
};

window.tossBones = tossBones;
window.addBones = addBones;