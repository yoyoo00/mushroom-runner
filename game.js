// game.js

// --- 1. 初始化和DOM获取 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mileageDisplay = document.getElementById('mileage-display');
const gameOverDisplay = document.getElementById('game-over-display');
const scoreDisplay = document.getElementById('score-display');
// 图鉴、通知和控制按钮的DOM
const guideContainer = document.getElementById('guide-container');
const guideToggleButton = document.getElementById('guide-toggle-button');
const guideCloseButton = document.getElementById('guide-close-button');
const guideGrid = document.getElementById('guide-grid');
const guideContent = document.getElementById('guide-content');
const guideDetailView = document.getElementById('guide-detail-view');
const detailBackButton = document.getElementById('detail-back-button');
const discoveryNotification = document.getElementById('discovery-notification');
const pauseToggleButton = document.getElementById('pause-toggle-button');

canvas.width = 800;
canvas.height = 600;

// --- 2. 游戏状态与常量 ---
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12.5;
let gameSpeed = 5;
let isGameOver = false;
let isPaused = false;
let mileage = 0;
let score = 0;
let animationFrameId;

let obstacles = []; let obstacleTimer = 0; let randomObstacleInterval = 85;
let mushrooms = []; let mushroomTimer = 0; let randomMushroomInterval = 120;
const MUSHROOM_TYPES = { NORMAL: 'normal', HALLUCINOGENIC: 'hallucinogenic', POISONOUS: 'poisonous' };

// 蘑菇数据
const MUSHROOM_DATA = {
    // A. 可食用菌菇 (10种)
    '香菇': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "香菇，又名花菇、冬菇，是世界第二大食用菌。它不仅肉质肥厚细嫩，味道鲜美，更因其独特的香气而闻名。作为一种食药同源的食物，香菇富含蛋白质、多种维生素和矿物质，尤其是香菇多糖，被认为具有提高免疫力的作用，营养、药用和保健价值极高。"
    },
    '平菇': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "平菇是相当常见的灰色食用菇，因其菌盖侧生，形似扇贝而得名。它口感佳，质地柔嫩，味道鲜美，含有丰富的蛋白质、氨基酸及多种维生素、矿物质。平菇适应性强，栽培广泛，是深受大众喜爱的家常食材。"
    },
    '牛肝菌': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "牛肝菌是一个庞大的菌类家族，因其肉质肥厚、极似牛肝而得名。它是名贵的野生食用菌，味道鲜美浓郁，营养丰富。其中一些品种如“见手青”，在受伤或氧化后会呈现蓝色，烹饪时必须完全熟透，否则有中毒风险。"
    },
    '羊肚菌': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "羊肚菌因其菌盖表面凹凸不平、状如羊肚而得名。它是一种极为珍稀的食药两用菌，生长环境苛刻，产量稀少。其味道极为鲜美，口感脆嫩，含有丰富的蛋白质和多种氨基酸，被誉为“菌中之王”，是高级宴席上的佳肴。"
    },
    '鸡油菌': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "鸡油菌颜色鲜黄，烹制时会吸收油脂，散发出类似鸡油的香气，同时又带有独特的杏香味。它是世界著名的四大名菌之一，在欧洲被誉为“菌中之花”。其口感柔韧嫩滑，富含胡萝卜素和多种人体必需的氨基酸。"
    },
    '金针菇': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "金针菇，因其菌柄细长、形似金针菜而得名，又因富含氨基酸、有助智力发育而被称为“益智菇”。它口感滑嫩，味道鲜美，是火锅、凉拌菜和汤羹的常见食材。因其不易被完全消化，也被戏称为“See You Tomorrow”。"
    },
    '口蘑': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "口蘑，通常指双孢蘑菇（白蘑菇），是世界上栽培最广泛、消费量最高的食用菌。其名称源于历史上由张家口作为蒙古草原野生蘑菇的集散地而得名。它肉质肥厚细嫩，味道鲜美纯正，适合各种烹饪方式，是全球餐桌上的常客。"
    },
    '猴头菇': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "猴头菇因其外形酷似猴头而得名，是中国传统的名贵菜肴，肉嫩、味香、鲜美可口。它与熊掌、海参、鱼翅同列“四大名菜”，被誉为“山珍猴头，海味燕窝”。猴头菇不仅营养价值高，也是一种药食两用的菌类，尤其以养胃功效而闻名。"
    },
    '鸡腿菇': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "鸡腿菇，因其形如鸡腿、肉质似鸡丝而得名。它营养丰富、味道鲜美，口感脆嫩爽滑，极受欢迎。鸡腿菇的一个奇特之处在于其成熟后会很快“自溶”，菌盖和菌褶会变成墨汁状液体，因此采摘后需尽快食用或处理。"
    },
    '竹荪': {
        type: MUSHROOM_TYPES.NORMAL,
        desc: "竹荪是寄生在枯竹根部的一种隐花菌类，从菌盖下伸出美丽的白色网状菌幕，如同仙女的白裙，被誉为“雪裙仙子”、“菌中皇后”。它口感清脆，味道鲜美，是高级汤品的绝佳食材。其生命周期短暂，从破土到自溶往往只有数小时。"
    },
    // B. 致幻菌菇 (5种)
    '毒蝇伞': {
        type: MUSHROOM_TYPES.HALLUCINOGENIC,
        desc: "毒蝇伞是一种含有神经性毒害的担子菌门真菌，鲜红的菌盖上点缀着白色斑点，是“超级马里奥”中蘑菇的原型。它含有蝇蕈醇和鹅膏蕈氨酸等精神活性物质，具有强烈的致幻作用。在古代西伯利亚等地的萨满文化中，曾被用于宗教仪式。"
    },
    '裸盖菇': {
        type: MUSHROOM_TYPES.HALLUCINOGENIC,
        desc: "裸盖菇属是包含裸盖菇素和裸盖菇碱等致幻物质的一大类真菌，是“迷幻蘑菇”或“魔菇”中最常见的属之一。食用后，其含有的裸盖菇素会在体内转化为脱磷酸裸盖菇素，从而导致视觉、听觉和精神上的强烈幻觉，以及欣快感和时空感知扭曲。"
    },
    '半裸盖菇': {
        type: MUSHROOM_TYPES.HALLUCINOGENIC,
        desc: "半裸盖菇，又称“自由帽”，是裸盖菇属中一种致幻性极强的蘑菇，广泛分布于世界各地。其外形特点是菌盖呈钟形，顶部有一个尖锐的乳头状凸起。它是最常见的含有裸盖菇素的物种之一，常在草地或牧场被发现。"
    },
    '蓝斑花褶伞': {
        type: MUSHROOM_TYPES.HALLUCINOGENIC,
        desc: "蓝斑花褶伞，俗称“Blue Meanie”，是一种含有裸盖菇素的强效致幻蘑菇。其显著特点是在菌柄或菌盖受到损伤、挤压或老化时，会迅速呈现出明显的蓝色或蓝绿色斑点，这是裸盖菇素氧化的结果。"
    },
    '墨西哥裸盖菇': {
        type: MUSHROOM_TYPES.HALLUCINOGENIC,
        desc: "这种蘑菇在中美洲的阿兹特克等土著文化中有悠久的使用历史，被称为“Teonanácatl”（神的肉体），常被用于宗教和萨满仪式中。它也是瑞士化学家阿尔伯特·霍夫曼首次分离并鉴定出裸盖菇素和裸盖菇碱的物种，从而开启了对迷幻物质的现代科学研究。"
    },
    // C. 有毒/致死菌菇 (5种)
    '毒鹅膏': {
        type: MUSHROOM_TYPES.POISONOUS,
        desc: "又称“死帽蕈”，是世界上毒性最强的蘑菇之一，造成了全球绝大多数的蘑菇中毒死亡事件。其毒素（鹅膏毒素）极为稳定，烹饪无法破坏。中毒后有数小时的潜伏期，随后会严重损害肝脏和肾脏，若不进行肝移植，死亡率极高。"
    },
    '白毒伞': {
        type: MUSHROOM_TYPES.POISONOUS,
        desc: "白毒伞，又称“毁灭天使”，是一种纯白色的剧毒蘑菇，与毒鹅膏同属。它外表纯洁，甚至带有淡淡清香，极具欺骗性。它含有剧毒的鹅膏毒素，会以同样的方式摧毁肝脏和肾脏，仅仅一小朵就足以致命，误食后死亡率极高。"
    },
    '鹿花菌': {
        type: MUSHROOM_TYPES.POISONOUS,
        desc: "鹿花菌，又称“假羊肚菌”，其外形与可食用的羊肚菌有些相似，菌盖呈不规则的脑状褶皱。它含有一种名为“鹿花菌素”的毒素，这种毒素具有挥发性且可水解。生吃或处理不当（如在通风不良处烹饪）会吸入有毒蒸汽，导致严重中毒甚至致命。"
    },
    '纹缘盔孢伞': {
        type: MUSHROOM_TYPES.POISONOUS,
        desc: "也叫秋日小圆帽，是一种非常常见的棕色小蘑菇，极易与其他小型野生菌（包括一些致幻的裸盖菇）混淆。它含有与白毒伞和毒鹅膏相同的鹅膏毒素，是致命的。任何情况下都应避免采食任何野生的棕色小蘑菇，因为鉴别难度极大，风险极高。"
    },
    '致命网褶伞': {
        type: MUSHROOM_TYPES.POISONOUS,
        desc: "这种蘑菇含有一种名为“奥来毒素”的剧毒物质，其毒性发作的潜伏期极长，可能在食用后2天到3周才出现症状。中毒初期症状类似流感，但毒素会不可逆地严重损伤肾脏，最终导致肾衰竭，需要终身透析或肾移植。"
    }
};
const mushroomNames = Object.keys(MUSHROOM_DATA);
const mushroomCategories = { [MUSHROOM_TYPES.NORMAL]: mushroomNames.filter(name => MUSHROOM_DATA[name].type === MUSHROOM_TYPES.NORMAL), [MUSHROOM_TYPES.HALLUCINOGENIC]: mushroomNames.filter(name => MUSHROOM_DATA[name].type === MUSHROOM_TYPES.HALLUCINOGENIC), [MUSHROOM_TYPES.POISONOUS]: mushroomNames.filter(name => MUSHROOM_DATA[name].type === MUSHROOM_TYPES.POISONOUS), };
const mushroomImages = {}; let assetsLoaded = false;
let guideState = {};
let effects = { hallucination: { active: false, timer: 0, duration: 450 }, poison: { active: false, timer: 0, duration: 450, flashDuration: 20 }, };
let weirdThings = [];
const OBSTACLE_SIZES = [{ name: 'small', scale: 0.8 }, { name: 'medium', scale: 1.0 }, { name: 'large', scale: 1.25 }];
const obstacleTypes = [{ type: 'stump', category: 'ground' }, { type: 'fallen_log', category: 'ground' }, { type: 'low_branch', category: 'air' }, { type: 'swooping_owl', category: 'air' }, { type: 'bush', category: 'ground' }];
let player = { x: 100, y: 0, width: 40, height: 60, velocityY: 0, onGround: true, runFrame: 0, isDucking: false, color: { skin: '#ffccaa', shirt: '#e74c3c', pants: '#34495e', hair: '#5d4037', eye: '#2c3e50' } };
const groundHeight = 80;

function createForestLayer(config) { /* ... */ const layer = []; for (let i = 0; i < config.count; i++) { const heightVariation = 0.7 + Math.random() * 0.6; const widthVariation = 0.8 + Math.random() * 0.4; const type = Math.random() > 0.4 ? 'broadleaf' : 'pine'; let tree = { x: Math.random() * (canvas.width * 1.5), type: type, scale: { height: config.baseScale * heightVariation, width: config.baseScale * widthVariation }, speed: (gameSpeed - 1.5) * config.speedMultiplier, colors: { leaf: config.leafColors[Math.floor(Math.random() * config.leafColors.length)], trunk: config.trunkColors[Math.floor(Math.random() * config.trunkColors.length)], } }; if (tree.type === 'broadleaf') { tree.branchConfig = { left: Math.random() > 0.4, right: Math.random() > 0.4, top: Math.random() > 0.5 }; } layer.push(tree); } return layer.sort((a, b) => a.x - b.x); }
const bgLayers = [ createForestLayer({ count: 35, baseScale: 0.5, speedMultiplier: 0.2, leafColors: ['#34495e'], trunkColors: ['#2c3e50'] }), createForestLayer({ count: 20, baseScale: 0.8, speedMultiplier: 0.4, leafColors: ['#1e8449', '#229954'], trunkColors: ['#5d4037'] }), createForestLayer({ count: 12, baseScale: 1.2, speedMultiplier: 0.7, leafColors: ['#27ae60', '#58d68d'], trunkColors: ['#6d4c41'] }), createForestLayer({ count: 7, baseScale: 1.7, speedMultiplier: 1.0, leafColors: ['#2ecc71', '#82e0aa'], trunkColors: ['#795548'] }), ];
function handleObstacles() { /* ... */ obstacleTimer++; if (obstacleTimer > randomObstacleInterval) { const chosenObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]; const chosenSize = OBSTACLE_SIZES[Math.floor(Math.random() * OBSTACLE_SIZES.length)]; const scale = chosenSize.scale; let newObstacle; switch (chosenObstacle.type) { case 'stump': newObstacle = { x: canvas.width, width: 50 * scale, height: 30 * scale, type: chosenObstacle.type }; newObstacle.y = canvas.height - groundHeight - newObstacle.height; break; case 'fallen_log': newObstacle = { x: canvas.width, width: 100 * scale, height: 25 * scale, type: chosenObstacle.type }; newObstacle.y = canvas.height - groundHeight - newObstacle.height; break; case 'low_branch': newObstacle = { x: canvas.width, width: 90 * scale, height: 45 * scale, type: chosenObstacle.type }; newObstacle.y = canvas.height - groundHeight - 50 - newObstacle.height; break;  case 'swooping_owl': newObstacle = { x: canvas.width, width: 55 * scale, height: 35 * scale, type: chosenObstacle.type }; newObstacle.y = canvas.height - groundHeight - 85; break; case 'bush': newObstacle = { x: canvas.width, width: 70 * scale, height: 50 * scale, type: chosenObstacle.type }; newObstacle.y = canvas.height - groundHeight - newObstacle.height; break; } obstacles.push(newObstacle); randomObstacleInterval = Math.random() * 100 + 100 - (gameSpeed * 3); obstacleTimer = 0; } obstacles.forEach(obs => { obs.x -= gameSpeed; }); obstacles = obstacles.filter(obs => obs.x + obs.width > 0); }
function handleMushrooms() { mushroomTimer++; if (mushroomTimer > randomMushroomInterval) { const rand = Math.random(); let category; if (rand < 0.6) { category = MUSHROOM_TYPES.NORMAL; } else if (rand < 0.85) { category = MUSHROOM_TYPES.HALLUCINOGENIC; } else { category = MUSHROOM_TYPES.POISONOUS; } const mushroomList = mushroomCategories[category]; const mushroomName = mushroomList[Math.floor(Math.random() * mushroomList.length)]; mushrooms.push({ name: mushroomName, type: category, x: canvas.width, y: canvas.height - groundHeight - 35, width: 35, height: 35, }); randomMushroomInterval = Math.random() * 200 + 150 - (gameSpeed * 2); mushroomTimer = 0; } mushrooms.forEach(m => { m.x -= gameSpeed; }); mushrooms = mushrooms.filter(m => m.x + m.width > 0); }
function checkCollisions() { for (const obs of obstacles) { let playerHitbox = { x: player.x + 10, y: player.y, width: player.width - 20, height: player.height }; if (player.isDucking) { playerHitbox.y += player.height / 2; playerHitbox.height = player.height / 2; } const obstacleHitbox = { x: obs.x, y: obs.y, width: obs.width, height: obs.height }; if (playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width && playerHitbox.x + playerHitbox.width > obstacleHitbox.x && playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height && playerHitbox.y + playerHitbox.height > obstacleHitbox.y) { isGameOver = true; saveBestScores(mileage, score); loadAndDisplayBestScores(); gameOverDisplay.classList.remove('hidden'); window.cancelAnimationFrame(animationFrameId); } } }function checkMushroomCollisions() { for (let i = mushrooms.length - 1; i >= 0; i--) { const m = mushrooms[i]; let playerHitbox = { x: player.x, y: player.y, width: player.width, height: player.height }; if (playerHitbox.x < m.x + m.width && playerHitbox.x + playerHitbox.width > m.x && playerHitbox.y < m.y + m.height && playerHitbox.y + playerHitbox.height > m.y) { if (!guideState[m.name]) { guideState[m.name] = true; showDiscoveryNotification(m.name); updateGuideUI(m.name); } switch (m.type) { case MUSHROOM_TYPES.NORMAL: score++; break; case MUSHROOM_TYPES.HALLUCINOGENIC: effects.hallucination.active = true; effects.hallucination.timer = effects.hallucination.duration; for(let j=0; j<15; j++) { weirdThings.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 15 + 5, speedX: (Math.random() - 0.5) * 2, speedY: (Math.random() - 0.5) * 2, color: `hsl(${Math.random() * 360}, 100%, 70%)` }); } break; case MUSHROOM_TYPES.POISONOUS: effects.poison.active = true; effects.poison.timer = effects.poison.duration; break; } mushrooms.splice(i, 1); } } }
function drawBackground() { const sky = ctx.createLinearGradient(0, 0, 0, canvas.height); sky.addColorStop(0, '#a9cce3'); sky.addColorStop(1, '#d4e6f1'); ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height); bgLayers.forEach(layer => { layer.forEach(tree => { tree.x -= tree.speed; if (tree.x < -150) { tree.x = canvas.width + Math.random() * 100; } drawTree(tree); }); }); }
function drawTree(tree) { const trunkWidth = 15 * tree.scale.width; const trunkHeight = 100 * tree.scale.height; const x = tree.x; const y = canvas.height - groundHeight; ctx.fillStyle = tree.colors.trunk; ctx.fillRect(x, y - trunkHeight, trunkWidth, trunkHeight); ctx.fillRect(x - 2 * tree.scale.width, y - 10 * tree.scale.height, trunkWidth + 4 * tree.scale.width, 10 * tree.scale.height); ctx.fillStyle = tree.colors.leaf; const crownBaseY = y - trunkHeight; if (tree.type === 'broadleaf') { const crownWidth = 70 * tree.scale.width; const crownHeight = 80 * tree.scale.height; ctx.fillRect(x + trunkWidth / 2 - crownWidth / 2, crownBaseY - crownHeight, crownWidth, crownHeight); if (tree.branchConfig.left) ctx.fillRect(x + trunkWidth / 2 - crownWidth * 0.8, crownBaseY - crownHeight * 0.7, crownWidth * 0.4, crownHeight * 0.4); if (tree.branchConfig.right) ctx.fillRect(x + trunkWidth / 2 + crownWidth * 0.4, crownBaseY - crownHeight * 0.6, crownWidth * 0.4, crownHeight * 0.4); if (tree.branchConfig.top) ctx.fillRect(x + trunkWidth / 2 - crownWidth * 0.2, crownBaseY - crownHeight * 1.2, crownWidth * 0.4, crownHeight * 0.4); } else { const baseWidth = 60 * tree.scale.width; const layerHeight = 40 * tree.scale.height; const crownBaseX = x + trunkWidth / 2; ctx.fillRect(crownBaseX - baseWidth * 0.5, crownBaseY - layerHeight * 0.8, baseWidth, layerHeight); ctx.fillRect(crownBaseX - baseWidth * 0.35, crownBaseY - layerHeight * 1.6, baseWidth * 0.7, layerHeight); ctx.fillRect(crownBaseX - baseWidth * 0.2, crownBaseY - layerHeight * 2.3, baseWidth * 0.4, layerHeight); } }
function drawGround() { ctx.fillStyle = '#4e342e'; ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight); ctx.fillStyle = '#6d4c41'; ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 40); ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 15); }
function drawObstacles() { obstacles.forEach(obs => { const { x, y, width, height } = obs; switch (obs.type) { case 'stump': ctx.fillStyle = '#795548'; ctx.fillRect(x, y + 5, width, height - 5); ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.ellipse(x + width / 2, y + 5, width / 2, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#795548'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x + width / 2, y + 5, width / 3, 3, 0, 0, Math.PI * 2); ctx.stroke(); break; case 'fallen_log': const logGradient = ctx.createLinearGradient(x, y, x, y + height); logGradient.addColorStop(0, '#8d6e63'); logGradient.addColorStop(0.5, '#6d4c41'); logGradient.addColorStop(1, '#5d4037'); ctx.fillStyle = logGradient; ctx.fillRect(x, y, width, height); ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.ellipse(x + width, y + height / 2, 5, height / 2, 0, -Math.PI / 2, Math.PI / 2); ctx.fill(); break; case 'low_branch': ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.moveTo(x, y + height * 0.7); ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.5, x + width, y + height * 0.6); ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.6, x, y + height); ctx.closePath(); ctx.fill(); const leafClusters = [ { x: x + width * 0.3, y: y + height * 0.3, radius: height * 0.3, color: '#27ae60' }, { x: x + width * 0.65, y: y + height * 0.2, radius: height * 0.4, color: '#2ecc71' }, { x: x + width * 0.8, y: y + height * 0.4, radius: height * 0.25, color: '#1E8449' } ]; leafClusters.forEach(c => { ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2); ctx.fill(); }); break; case 'swooping_owl': const wingFlap = Math.sin(mileage * 0.3) * (height / 3); ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.moveTo(x + width, y + height * 0.2); ctx.quadraticCurveTo(x + width * 0.8, y, x + width * 0.6, y + height * 0.3); ctx.lineTo(x, y + height * 0.8); ctx.quadraticCurveTo(x + width * 0.5, y + height, x + width, y + height * 0.2); ctx.fill(); ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.moveTo(x + width * 0.6, y + height * 0.4); ctx.quadraticCurveTo(x + width * 0.4, y + wingFlap, x + width * 0.1, y + height * 0.5 + wingFlap); ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.5, x + width * 0.7, y + height * 0.5); ctx.fill(); ctx.fillStyle = 'black'; ctx.fillRect(x + width * 0.75, y + height * 0.25, 5, 5); break; case 'bush': ctx.fillStyle = '#1e8449'; ctx.beginPath(); ctx.arc(x + width * 0.3, y + height * 0.6, width * 0.3, 0, Math.PI * 2); ctx.arc(x + width * 0.7, y + height * 0.7, width * 0.35, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x + width * 0.2, y + height * 0.6, width * 0.6, height * 0.4); ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.arc(x + width * 0.5, y + height * 0.4, width * 0.3, 0, Math.PI * 2); ctx.arc(x + width * 0.8, y + height * 0.5, width * 0.2, 0, Math.PI * 2); ctx.fill(); break; } }); }
function drawMushrooms() { mushrooms.forEach(m => { const img = mushroomImages[m.name]; if (img) { ctx.drawImage(img, m.x, m.y, m.width, m.height); } else { ctx.fillStyle = '#ff00ff'; ctx.fillRect(m.x, m.y, m.width, m.height); } }); }
function drawHallucinations() { weirdThings.forEach(thing => { thing.x += thing.speedX; thing.y += thing.speedY; if (thing.x < 0 || thing.x > canvas.width) thing.speedX *= -1; if (thing.y < 0 || thing.y > canvas.height) thing.speedY *= -1; ctx.fillStyle = thing.color; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(thing.x, thing.y, thing.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0; }); }
function drawPlayer() { const p = player; let bobbing = 0; let legOffset = 0; let armSwing = 0; const drawX = p.x; if (p.isDucking) { const duckY = p.y + p.height / 2; ctx.fillStyle = p.color.shirt; ctx.fillRect(drawX, duckY + 10, p.width, p.height / 2 - 10); ctx.fillStyle = p.color.pants; ctx.fillRect(drawX + 10, duckY + p.height / 2 - 10, 25, 10); ctx.fillStyle = p.color.skin; ctx.fillRect(drawX + 5, duckY, 20, 20); ctx.fillStyle = p.color.hair; ctx.fillRect(drawX + 3, duckY - 5, 24, 10); ctx.fillStyle = p.color.eye; ctx.fillRect(drawX + 18, duckY + 8, 4, 4); return; } if (p.onGround) { p.runFrame = (p.runFrame + 0.5) % 20; const cycle = Math.sin(p.runFrame * Math.PI / 10); legOffset = cycle * 8; armSwing = cycle * -8; bobbing = Math.abs(cycle) * -2; } else { armSwing = 5; } const drawY = p.y + bobbing; ctx.fillStyle = p.color.skin; ctx.fillRect(drawX + 15 + armSwing, drawY + 28, 10, 10); ctx.fillStyle = p.color.pants; ctx.fillRect(drawX + 10 - legOffset, drawY + 45, 10, 15); ctx.fillRect(drawX + 22 + legOffset, drawY + 45, 10, 15); ctx.fillStyle = p.color.shirt; ctx.fillRect(drawX + 5, drawY + 25, 30, 20); ctx.fillStyle = p.color.skin; ctx.fillRect(drawX + 18, drawY + 15, 5, 10); ctx.fillRect(drawX + 10, drawY, 20, 20); ctx.fillStyle = p.color.hair; ctx.fillRect(drawX + 8, drawY - 5, 24, 10); ctx.fillStyle = p.color.eye; ctx.fillRect(drawX + 22, drawY + 8, 4, 4); ctx.fillStyle = p.color.skin; ctx.fillRect(drawX + 15 - armSwing, drawY + 28, 10, 10); }
function drawEffectsOverlay() { if (effects.poison.active) { if (effects.poison.timer > effects.poison.duration - effects.poison.flashDuration) { if (Math.floor(effects.poison.timer / 4) % 2 === 0) { ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height); } } else { ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height); } } }
function handleEffects() { if (effects.hallucination.active) { effects.hallucination.timer--; if (effects.hallucination.timer <= 0) { effects.hallucination.active = false; weirdThings = []; } } if (effects.poison.active) { effects.poison.timer--; if (effects.poison.timer <= 0) { effects.poison.active = false; } } }

// --- 8. 玩家控制与动作 ---
function jump() { if (player.onGround && !player.isDucking) { player.velocityY = JUMP_STRENGTH; player.onGround = false; } }
function duck() { if(player.onGround) { player.isDucking = true; } }
function handleKeyDown(e) {
    if (e.code === 'Escape' && !guideContainer.classList.contains('hidden')) {
        toggleGuide(false); // 按ESC关闭图鉴
        return;
    }
    if (isGameOver || isPaused) return;
    const key = e.code;
    const isReversed = effects.hallucination.active;
    if ((key === 'Space' || key === 'ArrowUp')) { isReversed ? duck() : jump(); } 
    else if (key === 'ArrowDown') { isReversed ? jump() : duck(); }
}
function handleKeyUp(e) { if (e.code === 'ArrowDown') { player.isDucking = false; } else if ((e.code === 'Space' || e.code === 'ArrowUp') && effects.hallucination.active) { player.isDucking = false; } }

// --- 9. 游戏主循环与启动/重置 ---
function gameLoop() {
    if (isGameOver || isPaused) return;
    player.velocityY += GRAVITY; player.y += player.velocityY;
    if (player.y + player.height > canvas.height - groundHeight) { player.y = canvas.height - groundHeight - player.height; player.velocityY = 0; player.onGround = true; }
    handleObstacles(); handleMushrooms(); handleEffects();
    checkCollisions(); checkMushroomCollisions();
    gameSpeed += 0.002; mileage++;
    mileageDisplay.textContent = `里程: ${Math.floor(mileage / 10)}m`;
    scoreDisplay.textContent = `分数: ${score}`;
    ctx.save();
    if (effects.hallucination.active) { const wave = Math.sin(mileage * 0.2) * 10; const wave2 = Math.cos(mileage * 0.15) * 10; ctx.translate(wave2, wave); }
    ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
    drawBackground(); if(effects.hallucination.active) drawHallucinations();
    drawGround(); drawMushrooms(); drawObstacles(); drawPlayer();
    ctx.restore(); drawEffectsOverlay();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function resetGame() {
    isGameOver = false; mileage = 0; score = 0; gameSpeed = 5;
    obstacles = []; mushrooms = []; obstacleTimer = 0; mushroomTimer = 0;
    player.y = canvas.height - groundHeight - player.height; player.velocityY = 0; player.isDucking = false;
    effects.hallucination = { active: false, timer: 0, duration: 600 };
    effects.poison = { active: false, timer: 0, duration: 180, flashDuration: 20 };
    weirdThings = [];
    gameOverDisplay.classList.add('hidden');
    if (isPaused) { togglePause(false); }
    if (animationFrameId) { window.cancelAnimationFrame(animationFrameId); }
    gameLoop();
}

// --- 10. 图鉴、暂停与资源加载功能 ---
function loadAndDisplayBestScores() {
    // 从 localStorage 获取数据，如果没有，则默认为 0
    const bestMileage = parseInt(localStorage.getItem('bestMileage')) || 0;
    const bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

    // 更新页面上的显示
    document.getElementById('best-mileage-display').textContent = `最佳里程: ${Math.floor(bestMileage / 10)}m`;
    document.getElementById('best-score-display').textContent = `最佳分数: ${bestScore}`;
}

// 在游戏结束时检查并保存最高分
function saveBestScores(finalMileage, finalScore) {
    const bestMileage = parseInt(localStorage.getItem('bestMileage')) || 0;
    const bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

    if (finalMileage > bestMileage) {
        localStorage.setItem('bestMileage', finalMileage);
    }
    if (finalScore > bestScore) {
        localStorage.setItem('bestScore', finalScore);
    }
}

function loadAssets() { let assetsToLoad = mushroomNames.length; mushroomNames.forEach(name => { const img = new Image(); img.src = `蘑菇/${name}.png`; mushroomImages[name] = img; img.onload = () => { assetsToLoad--; if (assetsToLoad === 0) { assetsLoaded = true; console.log("所有蘑菇图片加载完毕！"); } }; img.onerror = () => { console.error(`加载图片失败: 蘑菇/${name}.png`); assetsToLoad--; if (assetsToLoad === 0) { assetsLoaded = true; } }; }); }

function setupGuide() {
    guideGrid.innerHTML = '';
    for (const name of mushroomNames) {
        if (guideState[name] === undefined) { guideState[name] = false; }
        const slot = document.createElement('div');
        slot.className = 'guide-slot';
        slot.dataset.mushroomName = name;
        slot.innerHTML = `
            <div class="guide-image-container">?</div>
            <div class="mushroom-name">${name}</div>
        `;
        guideGrid.appendChild(slot);
        if(guideState[name]) updateGuideUI(name); // 如果是重置游戏，保持已解锁状态
    }
}

function updateGuideUI(mushroomName) {
    const slot = guideGrid.querySelector(`[data-mushroom-name="${mushroomName}"]`);
    if (slot && guideState[mushroomName]) {
        slot.classList.add('unlocked');
        slot.querySelector('.guide-image-container').innerHTML = `<img src="${mushroomImages[mushroomName].src}" alt="${mushroomName}">`;
        slot.querySelector('.mushroom-name').textContent = mushroomName;
    }
}

function showDiscoveryNotification(mushroomName) {
    discoveryNotification.textContent = `新发现：${mushroomName}`;
    discoveryNotification.classList.remove('hidden');
    setTimeout(() => { discoveryNotification.classList.add('visible'); }, 10);
    setTimeout(() => {
        discoveryNotification.classList.remove('visible');
        setTimeout(() => { discoveryNotification.classList.add('hidden'); }, 500);
    }, 2000);
}

function togglePause(forceState) {
    if (isGameOver) return;
    const shouldBePaused = typeof forceState === 'boolean' ? forceState : !isPaused;
    isPaused = shouldBePaused;
    if (isPaused) {
        window.cancelAnimationFrame(animationFrameId);
        pauseToggleButton.textContent = "继续";
    } else {
        pauseToggleButton.textContent = "暂停";
        gameLoop();
    }
}

function showGuideDetail(mushroomName) {
    guideContent.classList.add('hidden');
    guideDetailView.classList.remove('hidden');
    document.getElementById('detail-mushroom-name').textContent = mushroomName;
    document.getElementById('detail-mushroom-image').src = mushroomImages[mushroomName].src;
    document.getElementById('detail-mushroom-desc').textContent = MUSHROOM_DATA[mushroomName].desc;
}

function hideGuideDetail() {
    guideDetailView.classList.add('hidden');
    guideContent.classList.remove('hidden');
}

function toggleGuide(forceState) {
    const shouldBeOpen = typeof forceState === 'boolean' ? forceState : guideContainer.classList.contains('hidden');
    if (shouldBeOpen) {
        hideGuideDetail(); // 每次打开都确保显示主网格
        guideContainer.classList.remove('hidden');
        if (!isGameOver && !isPaused) togglePause(true);
    } else {
        guideContainer.classList.add('hidden');
        // 只有当游戏不是因为打开图鉴而暂停时，才恢复游戏
        if (!isGameOver && isPaused && pauseToggleButton.textContent === "继续") {
             togglePause(false);
        }
    }
}

function startGame() {
    loadAndDisplayBestScores();
    loadAssets();
    setupGuide();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    pauseToggleButton.addEventListener('click', () => togglePause());
    guideToggleButton.addEventListener('click', () => toggleGuide(true));
    guideCloseButton.addEventListener('click', () => toggleGuide(false));
    detailBackButton.addEventListener('click', hideGuideDetail);
    guideContainer.addEventListener('click', (e) => { // 点击背景关闭
        if (e.target === guideContainer) toggleGuide(false);
    });
    guideGrid.addEventListener('click', (e) => {
        const slot = e.target.closest('.guide-slot');
        if (slot && slot.classList.contains('unlocked')) {
            showGuideDetail(slot.dataset.mushroomName);
        }
    });

    const restartHandler = () => { if (isGameOver) resetGame(); };
    window.addEventListener('keydown', restartHandler);
    canvas.addEventListener('mousedown', restartHandler);

    resetGame();
}

startGame();