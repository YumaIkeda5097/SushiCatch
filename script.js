// =======================
// キャンバス
// =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =======================
// プレイヤー
// =======================
const player = {
    x: 250,
    y: 730,
    width: 100,
    height: 30,
    speed: 7
};

// =======================
// 落下物を作る関数
// =======================
function createObject(emoji, score, speed, x, y) {
    return {
        emoji,
        score,
        speed,
        x,
        y,
        width: 40,
        height: 40
    };
}

const fallingObjects = [];

// =======================
// ゲーム情報
// =======================
let score = 0;
let time = 10;
let level = 1;

// =======================
// コンボ
// =======================
let combo = 0;
let comboPop = 0;

// =======================
// 点数エフェクト
// =======================
const scoreEffects = [];

// =======================
// 効果音
// =======================
const catchSound = new Audio("sounds/catch.mp3");
const missSound = new Audio("sounds/miss.mp3");

// ブラウザに保存されているハイスコアを読み込む
let highScore = Number(localStorage.getItem("highScore")) || 0;

// =======================
// ゲーム状態
// =======================
let gameState = "title";

// =======================
// キー入力
// =======================
const keys = {};
const input = {
    left: false,
    right: false
};

document.getElementById("leftBtn").addEventListener("touchstart", () => {
    input.left = true;
});

document.getElementById("leftBtn").addEventListener("touchend", () => {
    input.left = false;
});

document.getElementById("rightBtn").addEventListener("touchstart", () => {
    input.right = true;
});

document.getElementById("rightBtn").addEventListener("touchend", () => {
    input.right = false;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

canvas.addEventListener("touchstart", (e) => {

    if (gameState === "title") {
        resetGame();
    }

    if (gameState === "gameOver") {
        resetGame();
    }

});

document.addEventListener("keydown", (e) => {

    keys[e.key] = true;

    // ゲーム開始
    if (e.key === "Enter") {
        startGame();
    }

    // リスタート
    if (e.key.toLowerCase() === "r") {
        restartGame();
    }

});

canvas.addEventListener("touchstart", (e) => {

    if (gameState === "title") {
        startGame();
    }

    if (gameState === "gameOver") {
        restartGame();
    }

});

// =======================
// プレイヤー更新
// =======================
function updatePlayer() {

    if ((keys["ArrowLeft"] || input.left) && player.x > 0) {
        player.x -= player.speed;
    }

    if ((keys["ArrowRight"] || input.right) && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
}

// =======================
// 落下物更新
// =======================
function updateObjects() {

    for (const object of fallingObjects) {

        object.y += object.speed;

        if (object.y > canvas.height) {
            resetObject(object);
        }

    }

}

// =======================
// 当たり判定
// =======================
function checkCollision() {

    for (const object of fallingObjects) {

        const hit =
            object.x < player.x + player.width &&
            object.x + object.width > player.x &&
            object.y < player.y + player.height &&
            object.y + object.height > player.y;

        if (hit) {
            handleCollision(object);
        }

    }

}

// =======================
// 衝突したときの処理
// =======================
function handleCollision(object) {

    // スコア加算
    score += object.score;

    // 点数エフェクト
    if (object.score > 0) {

        addScoreEffect(
            object.x,
            object.y,
            "+1"
        );

    }
    else {

        addScoreEffect(
            object.x,
            object.y,
            "-3"
        );

    }

    // コンボ処理
    if (object.score > 0) {

        combo++;
        comboPop = 20;

        // 5コンボごとにボーナス
        if (combo % 5 === 0) {

            score += 5;

            addScoreEffect(
                player.x + player.width / 2,
                player.y - 20,
                "+5 BONUS!"
            );

        }

    }
    else {

        combo = 0;
        comboPop = 0;

    }

    // 効果音
    if (object.score > 0) {

        catchSound.currentTime = 0;
        catchSound.play();

    }
    else {

        missSound.currentTime = 0;
        missSound.play();

    }

    // 落下物を戻す
    resetObject(object);

}

// =======================
// 点数エフェクト更新
// =======================
function updateScoreEffects() {

    for (let i = scoreEffects.length - 1; i >= 0; i--) {

        scoreEffects[i].y -= 1;

        scoreEffects[i].life--;

        if (scoreEffects[i].life <= 0) {

            scoreEffects.splice(i, 1);

        }

    }

}

// =======================
// 落下物を上に戻す
// =======================
function resetObject(object) {

    object.y = -40;
    object.x = Math.random() * (canvas.width - object.width);

}

// =======================
// 点数エフェクト追加
// =======================
function addScoreEffect(x, y, text) {

    scoreEffects.push({

        x: x,
        y: y,
        text: text,
        life: 60

    });

}

// =======================
// プレイヤー描画
// =======================
function drawPlayer() {

    ctx.beginPath();

    ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        player.height / 2,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "white";
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#444";
    ctx.stroke();

}

// =======================
// 落下物描画
// =======================
function drawObjects() {

    ctx.font = "40px Arial";

    for (const object of fallingObjects) {
        ctx.fillText(
            object.emoji,
            object.x,
            object.y + 35
        );
    }

}

// =======================
// スコア描画
// =======================
function drawScore() {

    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("スコア : " + score, 20, 40);

}

// =======================
// タイマー描画
// =======================
function drawTimer() {

    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("残り : " + time + "秒", 380, 40);

}

// =======================
// ハイスコア描画
// =======================
function drawHighScore() {

    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("ハイスコア : " + highScore, 20, 80);

}

// =======================
// 点数エフェクト描画
// =======================
function drawScoreEffects() {

    ctx.font = "28px Arial";

    for (const effect of scoreEffects) {

        if (effect.text.startsWith("+")) {
            ctx.fillStyle = "green";
        }
        else {
            ctx.fillStyle = "red";
        }
        
        ctx.fillText(effect.text, effect.x, effect.y);

    }

}

// =======================
// コンボ描画
// =======================
function drawCombo() {

    if (combo < 2) return;

    ctx.textAlign = "center";

    // 拡大演出（ポップ）
    let size = 40 + comboPop;

    ctx.font = size + "px Arial";
    ctx.fillStyle = "orange";

    ctx.fillText(
        combo + " COMBO!",
        canvas.width / 2,
        120
    );

    ctx.textAlign = "left";

    if (comboPop > 0) {
        comboPop -= 2;
    }
}

// =======================
// ゲームオーバー画面
// =======================
function drawGameOver() {

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";

    ctx.font = "60px Arial";
    ctx.fillText("ゲーム終了！", 120, 350);

    ctx.font = "40px Arial";
    ctx.fillText("スコア : " + score, 180, 430);

    ctx.font = "28px Arial";
    ctx.fillText("タップ or Rで再挑戦！", 135, 500);

}

// =======================
// タイトル画面
// =======================
function drawTitle() {

    // 背景
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // タイトル
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🍣 寿司キャッチ！", canvas.width / 2, 250);

    // 説明
    ctx.font = "35px Arial";
    ctx.fillText("タップ or Enterでスタート", canvas.width / 2, 400);

    // 左寄せに戻す（他の描画に影響しないように）
    ctx.textAlign = "left";
}

// =======================
// ハイスコア更新
// =======================
function updateHighScore() {

    if (score > highScore) {

        highScore = score;

        // ブラウザに保存
        localStorage.setItem("highScore", highScore);

    }

}

// =======================
// ゲームを開始
// =======================
function startGame() {
    if (gameState === "title") {
        resetGame();
    }
}

// =======================
// ゲームを再開
// =======================
function restartGame() {
    if (gameState === "gameOver") {
        resetGame();
    }
}

function generateObjects() {

    const baseSpeed = 4 + level * 0.4;

    const objects = [
        createObject("🍣", 1, baseSpeed, 100, 0),
        createObject("🍣", 1, baseSpeed, 250, -200),
        createObject("🍣", 1, baseSpeed, 450, -400)
    ];

    if (level >= 2) {
        objects.push(
            createObject("🍤", 2, baseSpeed + 0.5, 150, -300)
        );
    }

    if (level >= 3) {
        objects.push(
            createObject("🌶️", -3, baseSpeed + 1, 300, -500)
        );
    }

    if (level >= 4) {
        objects.push(
            createObject("🍙", 3, baseSpeed + 1.5, 200, -600)
        );
    }

    return objects;
}

// =======================
// ゲームをリセット
// =======================
function resetGame() {

    score = 0;
    time = 10;
    combo = 0;

    level = 1;
    gameState = "playing";

    scoreEffects.length = 0;

    fallingObjects.length = 0;
    fallingObjects.push(...generateObjects());
}

function drawGame() {

    if (gameState === "title") {
        drawTitle();
        return;
    }

    drawObjects();
    drawPlayer();
    
    drawScoreEffects();
    
    drawScore();
    drawHighScore();
    drawTimer();
    
    drawCombo();

    if (gameState === "gameOver") {
        drawGameOver();
    }

}

// =======================
// ゲームループ
// =======================
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "playing") {

        updatePlayer();
        updateObjects();
        checkCollision();
        updateScoreEffects();
    
    }

    drawGame();

    requestAnimationFrame(gameLoop);

}

// =======================
// タイマー
// =======================
setInterval(() => {

    if (gameState !== "playing") return;

    time--;

    if (time <= 0) {
        time = 0;
        updateHighScore();
        gameState = "gameOver";
    }

}, 1000);

// =======================
// ゲーム開始
// =======================
gameLoop();