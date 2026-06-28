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

// =======================
// 落下物一覧
// =======================
const fallingObjects = [
    createObject("🍣", 1, 4, 100, 0),
    createObject("🍣", 1, 4, 250, -250),
    createObject("🍣", 1, 4, 450, -500),
    createObject("🌶️", -3, 5, 300, -150)
];

// =======================
// ゲーム情報
// =======================
let score = 0;
let time = 60;

// =======================
// コンボ
// =======================
let combo = 0;

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

    if (e.key === "Enter") {
        if (gameState !== "playing") resetGame();
    }

    if (e.key.toLowerCase() === "r") {
        if (gameState === "gameOver") resetGame();
    }

});

// =======================
// タッチ操作
// =======================
canvas.addEventListener("touchmove", (e) => {

    if (gameState !== "playing") return; // ←追加重要

    e.preventDefault();

    const rect = canvas.getBoundingClientRect();

    const touchX = e.touches[0].clientX - rect.left;

    player.x = touchX - player.width / 2;

    if (player.x < 0) player.x = 0;

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

});

// =======================
// プレイヤー更新
// =======================
function updatePlayer() {

    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }

    if (keys["ArrowRight"] && player.x + player.width < canvas.width) {
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

    if (combo < 2) {
        return;
    }

    ctx.fillStyle = "orange";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        combo + " COMBO!",
        canvas.width / 2,
        120
    );

    ctx.textAlign = "left";

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
    ctx.fillText("Rキーでリスタート！", 135, 500);

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
    ctx.fillText("Enterキーでスタート", canvas.width / 2, 400);

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
// ゲームをリセット
// =======================
function resetGame() {

    // スコアを戻す
    score = 0;

    // タイマーを戻す
    time = 10;

    // コンボ変数を戻す
    combo = 0;

    gameState = "playing";

    scoreEffects.length = 0;

    // 落下物を初期位置へ戻す
    for (const object of fallingObjects) {
        resetObject(object);
    }

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

    if (gameState === "playing") {

        time--;

        if (time <= 0) {
            time = 0;

            updateHighScore();

            gameState = "gameOver";
        }

    }

}, 1000);

// =======================
// ゲーム開始
// =======================
gameLoop();