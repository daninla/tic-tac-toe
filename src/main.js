const windowStart = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const board = document.getElementById("board");
const currentTurn = document.getElementById("current-turn");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const btnRestart = document.getElementById("btn-restart");
const btnStart = document.getElementById("btn-start");
const btnBack = document.getElementById("btn-back");
const player1NameInput = document.getElementById("player1-name");
const player2NameInput = document.getElementById("player2-name");
const playerCards = document.querySelectorAll(".player-card");
const btnSubmit = document.getElementById("btn-submit");

// Константы для выигрышных комбинаций
const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // строки
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // столбцы
  [0, 4, 8],
  [2, 4, 6], // диагонали
];

// Состояние игры
let currentPlayer = "X";
let gameActive = true;
let isAI = false;
modal.style.display = "none";

function updateCurrentTurn() {
  currentTurn.textContent = `Ход игрока: ${currentPlayer}`;
}

/** Полный сброс игры */
function resetGame() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => (cell.textContent = ""));
  currentPlayer = "X";
  gameActive = true;
  modal.style.display = "none";
  updateCurrentTurn();
}


function handleGameEnd() {
  const winner = checkWinner();
  if (winner) {
    finishGame(winner);
  } else {
    switchPlayer();
  }
}
/** Обработка отправки имен игроков */
btnSubmit.addEventListener("click", function (e) {
  e.preventDefault();
  if (!player1NameInput.value.trim() || !player2NameInput.value.trim()) {
    alert("Пожалуйста, введите имена обоих игроков.");
    return;
  }
  playerCards[0].querySelector(".player-name").textContent =
    player1NameInput.value;
  playerCards[1].querySelector(".player-name").textContent =
    player2NameInput.value;
  player1NameInput.value = "";
  player2NameInput.value = "";
  return true;
});

if (
  player1NameInput.value.trim() == "" &&
  player2NameInput.value.trim() == ""
) {
  playerCards[0].querySelector(".player-name").textContent = "Игрок 1";
  playerCards[1].querySelector(".player-name").textContent = "Игрок 2";
}
/** Обработка выбора режима игры и начала игры */
btnStart.addEventListener("click", (e) => {
  const selectedMode = document.querySelector(
    'input[name="mode"]:checked',
  ).value;
  isAI = selectedMode === "ai";
  console.log("isAI:", isAI);

  if (isAI) {
    playerCards[1].querySelector(".player-name").textContent = "ИИ";
  } else {
    if (playerCards[1].querySelector(".player-name").textContent === "") {
      playerCards[1].querySelector(".player-name").textContent = "Игрок 2";
    }
  }

  windowStart.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  updateCurrentTurn();
});

/** Инициализация игрового поля */
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.setAttribute("data-index", i);
  board.appendChild(cell);
}

/** Обработка кликов по игровому полю */
board.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell || !gameActive) return;

  if (cell.textContent === "") {
    cell.textContent = currentPlayer;
    handleGameEnd();
  }
});

/** ИИ делает ход, используя алгоритм minimax */
function aiMove() {
  console.log("ИИ анализирует доску...");
  const cells = document.querySelectorAll(".cell");
  const boardArray = Array.from(cells).map((cell) => cell.textContent);

  const bestMoveIndex = getBestMove(boardArray);
  console.log(`ИИ Лучший ход найден: позиция ${bestMoveIndex}`);

  if (bestMoveIndex !== -1) {
    cells[bestMoveIndex].textContent = currentPlayer;
    console.log("ИИ Ход выполнен");
    handleGameEnd();
  }
}


function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateCurrentTurn();

  if (currentPlayer === "O" && isAI) {
    console.log("ИИ делает ход...");
    setTimeout(() => {
      aiMove();
    }, 500);
  }
}

/** Находит оптимальный ход ИИ через minimax */
function getBestMove(board) {
  let bestScore = -Infinity;
  let bestMoveIndex = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMoveIndex = i;
      }
    }
  }
  return bestMoveIndex;
}

/**
 * Алгоритм Minimax для оценки позиций на доске
 * @param {Array} board - Состояние доски
 * @param {number} depth - Глубина рекурсии
 * @param {boolean} isMaximizing - Ход ИИ (true) или противника (false)
 * @returns {number} - Оценка позиции
 */

function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);

  // Оцениваем конечные состояния
  if (winner === "O") return 10 - depth; // ИИ победил
  if (winner === "X") return depth - 10; // Противник победил
  if (winner === "tie") return 0; // Ничья

  if (isMaximizing) {
    // Ход ИИ: максимизируем оценку
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    // Ход противника: минимизируем оценку для ИИ
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

/**
 * Универсальная функция проверки победителя
 * @param {Array|null} boardInput - Массив доски или null для использования DOM
 * @returns {string|null} - 'X' или 'O' если есть победитель, 'tie' если ничья, null если игра продолжается
 */

function checkWinner(boardInput) {
  let board;

  // Преобразуем DOM в массив или используем переданный массив
  if (Array.isArray(boardInput)) {
    board = boardInput;
  } else {
    const cells = document.querySelectorAll(".cell");
    board = Array.from(cells).map((cell) => cell.textContent);
  }

  // Проверяем все выигрышные комбинации
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== "")) {
    return "tie";
  }

  return null; // Игра продолжается
}

function finishGame(winner) {
  gameActive = false;

  if (winner === "tie") {
    modalText.textContent = "Ничья!";
  } else if (winner === "O" && isAI) {
    modalText.textContent = "ИИ победил!";
  } else {
    modalText.textContent = `Игрок ${winner} победил!`;
  }

  modal.style.display = "flex";
}

btnRestart.addEventListener("click", () => {
  resetGame();
});

bnBack.addEventListener("click", () => {
  windowStart.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  resetGame();
  isAI = false;
});
