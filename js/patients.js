const logoutBtn = document.getElementById("logoutBtn");
const form = document.getElementById("patientForm");
const tableBody = document.querySelector("#patientTable tbody");
const msg = document.getElementById("msg");
const search = document.getElementById("search");

const session =
  JSON.parse(localStorage.getItem("jv_session")) ||
  JSON.parse(sessionStorage.getItem("jv_session"));

if (!session) window.location.href = "login.html";

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jv_session");
  sessionStorage.removeItem("jv_session");
  window.location.href = "login.html";
});

const KEY = "jv_patients";

function loadPatients(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function savePatients(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function newId(list){
  const next = list.length + 1;
  return "P" + String(next).padStart(3, "0");
}

function showMessage(text, isError=false){
  msg.className = "msg " + (isError ? "err" : "ok");
  msg.textContent = text;
  setTimeout(() => { msg.textContent = ""; }, 1500);
}

function render(list){
  tableBody.innerHTML = "";
  list.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.patientId}</td>
      <td>${p.name}</td>
      <td>${p.hospitalId}</td>
      <td>${p.bloodGroup}</td>
      <td>${p.type}</td>
      <td class="status ${p.urgency === "Critical" ? "urgent" : (p.urgency === "Urgent" ? "pending" : "done")}">
        ${p.urgency}
      </td>
      <td>${p.contact}</td>
      <td>
        <button class="btn-mini danger" data-del="${idx}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function applySearch(){
  const list = loadPatients();
  const q = search.value.toLowerCase().trim();
  const filtered = list.filter(p =>
    p.name.toLowerCase().includes(q) || String(p.contact).includes(q)
  );
  render(filtered);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadPatients();

  const patient = {
    patientId: newId(list),
    hospitalId: document.getElementById("hospitalId").value.trim(),
    name: document.getElementById("name").value.trim(),
    dob: document.getElementById("dob").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    contact: document.getElementById("contact").value.trim(),
    address: document.getElementById("address").value.trim(),
    bloodGroup: document.getElementById("bloodGroup").value,
    type: document.getElementById("type").value,
    urgency: document.getElementById("urgency").value
  };

  if (!patient.hospitalId || !patient.name || !patient.gender || !patient.contact || !patient.bloodGroup || !patient.type || !patient.urgency) {
    showMessage("Please fill required fields", true);
    return;
  }

  list.push(patient);
  savePatients(list);
  render(list);
  form.reset();
  showMessage("Patient saved ✅");
});

document.getElementById("patientTable").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  const list = loadPatients();
  list.splice(idx, 1);
  savePatients(list);
  applySearch();
  showMessage("Deleted");
});

search.addEventListener("input", applySearch);

// initial render
render(loadPatients());