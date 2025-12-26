const session = applyRBAC();
if (!session) return;

// ✅ Get DOM elements (IMPORTANT)
const form = document.getElementById("donationForm");
const tableBody = document.querySelector("#donationTable tbody");
const search = document.getElementById("search");

const donorIdEl = document.getElementById("donorId");
const dateEl = document.getElementById("date");
const bloodGroupEl = document.getElementById("bloodGroup");
const typeEl = document.getElementById("type");
const qtyEl = document.getElementById("qty");
const conductedByEl = document.getElementById("conductedBy");

// ✅ Logout handler already in rbac.js
// so DON’T add logoutBtn click here

const KEY = "jv_donations";

function loadData(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function saveData(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function newDonationId(list){
  return "DN" + (list.length + 101);
}

function render(list){
  tableBody.innerHTML = "";
  list.forEach((d, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.donationId}</td>
      <td>${d.donorId}</td>
      <td>${d.date}</td>
      <td>${d.bloodGroup}</td>
      <td>${d.type}</td>
      <td>${d.qty}</td>
      <td>${d.conductedBy}</td>
      <td><button class="btn-mini danger" data-del="${i}">Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadData();

  const d = {
    donationId: newDonationId(list),
    donorId: donorIdEl.value.trim().toUpperCase(),
    date: dateEl.value,
    bloodGroup: bloodGroupEl.value,
    type: typeEl.value,
    qty: qtyEl.value,
    conductedBy: conductedByEl.value.trim()
  };

  if (!d.donorId || !d.date || !d.bloodGroup || !d.type || !d.qty || !d.conductedBy) {
    alert("Please fill all fields");
    return;
  }

  list.push(d);
  saveData(list);
  render(list);
  form.reset();
  dateEl.valueAsDate = new Date();
});

document.getElementById("donationTable").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  const list = loadData();
  list.splice(idx, 1);
  saveData(list);
  render(list);
});

search.addEventListener("input", () => {
  const q = search.value.toLowerCase().trim();
  const filtered = loadData().filter(d =>
    d.donationId.toLowerCase().includes(q) ||
    d.donorId.toLowerCase().includes(q)
  );
  render(filtered);
});

// default date today
dateEl.valueAsDate = new Date();
render(loadData());