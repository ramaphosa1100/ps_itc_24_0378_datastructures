"use strict";

// The array that holds every student record: [{ id, name, score }, ...]
let students = [];
const KEY = "grade-tracker-students";

const $ = (id) => document.getElementById(id);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    students = Array.isArray(saved) ? saved : [];
  } catch (e) {
    students = [];
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(students)); } catch (e) { /* storage unavailable */ }
}

function gradeOf(score) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getVisible() {
  const q = $("search").value.trim().toLowerCase();
  let list = students.filter((s) => s.name.toLowerCase().includes(q)); // filter
  const mode = $("sort").value;
  list = [...list]; // copy so the original order is preserved
  if (mode === "nameAsc") list.sort((a, b) => a.name.localeCompare(b.name));
  if (mode === "scoreDesc") list.sort((a, b) => b.score - a.score);
  if (mode === "scoreAsc") list.sort((a, b) => a.score - b.score);
  return list;
}

function renderStats() {
  const n = students.length;
  $("count").textContent = n;
  if (n === 0) {
    $("avg").textContent = $("high").textContent = $("low").textContent = "-";
    return;
  }
  const scores = students.map((s) => s.score); // map
  const total = scores.reduce((sum, v) => sum + v, 0); // reduce
  $("avg").textContent = (total / n).toFixed(1);
  $("high").textContent = Math.max(...scores);
  $("low").textContent = Math.min(...scores);
}

function render() {
  const body = $("rows");
  body.innerHTML = "";
  const list = getVisible();
  list.forEach((s, i) => {
    const tr = document.createElement("tr");
    const cells = [i + 1, s.name, s.score, gradeOf(s.score)];
    cells.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value; // textContent avoids HTML injection
      tr.appendChild(td);
    });
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.addEventListener("click", () => removeStudent(s.id));
    td.appendChild(btn);
    tr.appendChild(td);
    body.appendChild(tr);
  });
  $("empty").style.display = list.length ? "none" : "block";
  renderStats();
}

function addStudent(name, score) {
  students.push({ id: Date.now() + Math.random(), name, score }); // push
  save();
  render();
}

function removeStudent(id) {
  students = students.filter((s) => s.id !== id);
  save();
  render();
}

$("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name").value.trim();
  const score = Number($("score").value);
  if (!name) return ($("error").textContent = "Please enter a name.");
  if (!Number.isFinite(score) || score < 0 || score > 100)
    return ($("error").textContent = "Score must be between 0 and 100.");
  $("error").textContent = "";
  addStudent(name, score);
  e.target.reset();
  $("name").focus();
});

$("search").addEventListener("input", render);
$("sort").addEventListener("change", render);
$("clear").addEventListener("click", () => {
  if (students.length && confirm("Delete all students?")) {
    students = [];
    save();
    render();
  }
});

load();
render();
