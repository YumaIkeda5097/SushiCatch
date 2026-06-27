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
let gameOver = false;

// =======================
// キー入力
// =======================
const keys = {};

document.addEventListener("keydown", (e) => {

    keys[e.key] = true;

    // ゲームオーバー中にRキーでリスタート
    if (gameOver && (e.key === "r" || e.key === "R")) {
        resetGame();
    }

});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
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
            score += object.score;
            resetObject(object);
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
// ゲームをリセット
// =======================
function resetGame() {

    // スコアを戻す
    score = 0;

    // タイマーを戻す
    time = 60;

    // ゲーム再開
    let gameState = "title";

    // 落下物を初期位置へ戻す
    for (const object of fallingObjects) {
        resetObject(object);
    }

}

// =======================
// 画面描画
// =======================
function drawGame() {

    drawObjects();
    drawPlayer();
    drawScore();
    drawTimer();

if (gameState === "playing") {
        drawGameOver();
    }

}

// =======================
// ゲームループ
// =======================
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        updatePlayer();
        updateObjects();
        checkCollision();
    }

    drawGame();

    requestAnimationFrame(gameLoop);

}

// =======================
// タイマー
// =======================
setInterval(() => {

    if (!gameOver) {

        time--;

        if (time <= 0) {
            time = 0;
            gameOver = true;
        }

    }

}, 1000);

// =======================
// ゲーム開始
// =======================
gameLoop();