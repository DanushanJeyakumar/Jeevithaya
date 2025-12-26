const session = applyRBAC();
if (!session) return;

const form = document.getElementById("verForm");
const tableBody = document.querySelector("#verTable tbody");
const msg = document.getElementById("msg");
const search = document.getElementById("search");

const unitIdEl = document.getElementById("unitId");
const donorIdEl = document.getElementById("donorId");
const verifiedByEl = document.getElementById("verifiedBy");
const dateEl = document.getElementById("date");
const resultEl = document.getElementById("result");
const commentEl = document.getElementById("comment");

const KEY = "jv_verifications";

function loadData(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function saveData(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function newVid(list){
  return "V" + String(list.length + 1).padStart(4, "0");
}

function showMessage(text, isError=false){
  if (!msg) return;
  msg.className = "msg " + (isError ? "err" : "ok");
  msg.textContent = text;
  setTimeout(() => msg.textContent = "", 1500);
}

// ✅ render rows with real index
function render(rows){
  tableBody.innerHTML = "";
  rows.forEach(({ item, realIdx }) => {
    const cls = item.result === "Fail" ? "urgent" : "done";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.verificationId}</td>
      <td>${item.unitId}</td>
      <td>${item.donorId}</td>
      <td>${item.date}</td>
      <td>${item.verifiedBy}</td>
      <td class="status ${cls}">${item.result}</td>
      <td>${item.comment || "-"}</td>
      <td><button class="btn-mini danger" data-del="${realIdx}">Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

function applySearch(){
  const q = (search?.value || "").toLowerCase().trim();
  const list = loadData();

  const rows = list.map((item, realIdx) => ({ item, realIdx }));

  const filtered = rows.filter(({ item }) =>
    item.verificationId.toLowerCase().includes(q) ||
    item.unitId.toLowerCase().includes(q) ||
    item.donorId.toLowerCase().includes(q)
  );

  render(filtered);
}

// Add verification
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadData();

  const v = {
    verificationId: newVid(list),
    unitId: unitIdEl.value.trim().toUpperCase(),
    donorId: donorIdEl.value.trim().toUpperCase(),
    verifiedBy: verifiedByEl.value.trim(),
    date: dateEl.value,
    result: resultEl.value,
    comment: commentEl.value.trim()
  };

  if (!v.unitId || !v.donorId || !v.verifiedBy || !v.date || !v.result) {
    showMessage("Please fill required fields", true);
    return;
  }

  list.push(v);
  saveData(list);

  form.reset();
  dateEl.valueAsDate = new Date();
  showMessage("Verification saved ✅");
  applySearch();
});

// Delete (safe index)
document.getElementById("verTable").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const realIdx = Number(btn.dataset.del);
  const list = loadData();
  if (!list[realIdx]) return;

  list.splice(realIdx, 1);
  saveData(list);
  applySearch();
  showMessage("Deleted");
});

if (search) search.addEventListener("input", applySearch);

// default date today
dateEl.valueAsDate = new Date();
applySearch();