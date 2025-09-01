// ---------------- Variables ----------------
const COLORS = ["red", "blue", "green", "yellow"];
const SHAPES = ["square", "ring", "star", "circle", "triangle"];
const roundsConfig = [2, 3, 4, 5];
let SELECT_TIME = 20;

const startBtn = document.getElementById("startBtn");
const timeSelector = document.getElementById("timeSelector");
const displayArea = document.getElementById("displayArea");
const bigContainer = document.getElementById("bigShapeContainer");
const selectionArea = document.getElementById("selectionArea");
const summaryArea = document.getElementById("summaryArea");
const summaryText = document.getElementById("summaryText");
const playAgainBtn = document.getElementById("playAgainBtn");
const initialMessageBox = document.getElementById("initialMessageBox");
const timerLabel = document.getElementById("timerLabel");

let round = 0;
let results = [];
let timerInterval;

// ---------------- Start game ----------------
startBtn.addEventListener("click", () => {
  SELECT_TIME = parseInt(timeSelector.value, 10);
  round = 0;
  results = [];
  initialMessageBox.style.display = "none";
  nextRound();
});

playAgainBtn.addEventListener("click", () => location.reload());

// ---------------- Play sequence ----------------
function showBigShape(shape, color) {
  bigContainer.innerHTML = "";
  const img = document.createElement("img");
  img.width = 150;
  img.height = 150;
  img.src = createShapeSVG(shape, color);
  bigContainer.appendChild(img);
}

function clearBigShape() {
  bigContainer.innerHTML = "";
}

function playSequence(seq) {
  return new Promise((resolve) => {
    let i = 0;
    function step() {
      if (i >= seq.length) {
        clearBigShape();
        return resolve();
      }
      showBigShape(seq[i].shape, seq[i].color);
      i++;
      setTimeout(step, 10);
    }
    step();
  });
}

// ---------------- Build selects ----------------
const selectionForm = document.createElement("form");
selectionForm.id = "selectionForm";
selectionArea.appendChild(selectionForm);
const selectsContainer = document.createElement("div");
selectsContainer.id = "selectsContainer";
selectionForm.appendChild(selectsContainer);

function buildSelects(count) {
  selectsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col gap-1 relative"; // relative pentru mesaj

    const label = document.createElement("label");
    label.textContent = `Shape ${i + 1} from last`;
    label.className = "text-sm font-medium text-gray-700";

    const sel = document.createElement("select");
    sel.className = "border rounded px-2 py-1 text-gray-700";

    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "-- choose --";
    sel.appendChild(opt0);

    for (const c of COLORS) {
      for (const s of SHAPES) {
        const opt = document.createElement("option");
        opt.value = c + "-" + s;
        opt.textContent = c + " " + s;
        sel.appendChild(opt);
      }
    }

    // Mesaj lângă selector
    const msg = document.createElement("span");
    msg.className = "text-red-500 text-xs absolute right-0 top-0 hidden";
    msg.textContent = "Required!";

    wrapper.appendChild(label);
    wrapper.appendChild(sel);
    wrapper.appendChild(msg);
    selectsContainer.appendChild(wrapper);
  }

  // Single submit button
  let submitBtn = selectionForm.querySelector("button[type='submit']");
  if (!submitBtn) {
    submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Submit";
    submitBtn.className =
      "px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition mt-2";
    selectionForm.appendChild(submitBtn);
  }
}

// ---------------- Game flow ----------------
let expected = []; // variabilă globală pentru răspunsurile așteptate

function nextRound() {
  if (round >= roundsConfig.length) {
    showSummary();
    return;
  }

  const need = roundsConfig[round];

  // Generăm secvența de forme
  const seqLen = Math.floor(Math.random() * (19 - 10 + 1)) + 10;
  const seq = [];
  let prev = null;
  for (let i = 0; i < seqLen; i++) {
    let next;
    do {
      next = {
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      };
    } while (prev && next.color === prev.color && next.shape === prev.shape);
    seq.push(next);
    prev = next;
  }

  playSequence(seq).then(() => {
    displayArea.style.display = "none";
    buildSelects(need);
    selectionArea.classList.remove("hidden");

    // Salvăm răspunsurile așteptate
    expected = seq
      .slice(-need)
      .reverse()
      .map((c) => c.color + "-" + c.shape);

    // Reset timer
    let timeLeft = SELECT_TIME;
    timerLabel.textContent = `Round ${round + 1}/${
      roundsConfig.length
    } - Time left: ${timeLeft}s`;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerLabel.textContent = `Round ${round + 1}/${
        roundsConfig.length
      } - Time left: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitAnswers(true);
      }
    }, 1000);

    // Submit answers
    selectionForm.onsubmit = (e) => {
      e.preventDefault();
      submitAnswers(false);
    };

    function submitAnswers(expired) {
      const selects = document.querySelectorAll("#selectsContainer select");

      let incomplete = false;

      selects.forEach((s) => {
        // Caută sau creează mesajul lângă selector
        let msg = s.parentNode.querySelector(".msg-label");
        if (!msg) {
          msg = document.createElement("span");
          msg.className = "msg-label text-red-500 text-xs mt-1";
          s.parentNode.appendChild(msg);
        }
        msg.textContent = ""; // resetează mesajul
        s.classList.remove("border-red-700", "animate-ping");

        if (!s.value) {
          incomplete = true;
          msg.textContent = "Please select a value!";
          s.classList.add("border-red-500", "animate-pulse"); // stilizare warning
        } else {
          s.classList.remove("border-red-500", "animate-pulse"); // reset dacă completat
        }
      });

      if (!expired && incomplete) return; // nu opri timerul, doar afișează mesajul

      clearInterval(timerInterval);

      let correct = 0;
      for (let i = 0; i < expected.length; i++) {
        if (selects[i].value === expected[i]) correct++;
      }

      results.push({ correct, total: expected.length });
      selectionArea.classList.add("hidden");
      clearBigShape();
      displayArea.style.display = "flex";
      round++;
      nextRound();
    }
  });
}

function showSummary() {
  let totalCorrect = 0,
    total = 0;
  results.forEach((r) => {
    totalCorrect += r.correct;
    total += r.total;
  });
  const percent = Math.round((totalCorrect / total) * 100);
  summaryText.innerHTML = `Correct: ${totalCorrect}/${total}<br/>Percentage: ${percent}%`;
  summaryArea.classList.remove("hidden");
  displayArea.style.display = "none";
}
