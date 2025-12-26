
const logoutBtn = document.getElementById("logoutBtn");
const form = document.getElementById("requestForm");
const tableBody = document.querySelector("#requestTable tbody");
const msg = document.getElementById("msg");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

const session =
  JSON.parse(localStorage.getItem("jv_session")) ||
  JSON.parse(sessionStorage.getItem("jv_session"));

if (!session) window.location.href = "login.html";

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jv_session");
  sessionStorage.removeItem("jv_session");
  window.location.href = "login.html";
});

const KEY = "jv_requests";

function loadData(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function saveData(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function newReqId(list){
  const next = list.length + 100;
  return "REQ" + next;
}

function showMessage(text, isError=false){
  msg.className = "msg " + (isError ? "err" : "ok");
  msg.textContent = text;
  setTimeout(() => { msg.textContent = ""; }, 1500);
}

function urgencyClass(u){
  if (u === "Critical") return "urgent";
  if (u === "Urgent") return "pending";
  return "done";
}

function statusClass(s){
  if (s === "Pending") return "pending";
  if (s === "Rejected") return "urgent";
  return "done";
}

function render(list){
  tableBody.innerHTML = "";
  list.forEach((r, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${r.requestId}</td>
      <td>${r.patientId}</td>
      <td>${r.hospitalId}</td>
      <td>${r.bloodGroup}</td>
      <td>${r.type}</td>
      <td>${r.qty}</td>
      <td class="status ${urgencyClass(r.urgency)}">${r.urgency}</td>
      <td class="status ${statusClass(r.status)}">${r.status}</td>
      <td>
        <select class="input input-mini" data-update="${idx}">
          <option ${r.status==="Pending"?"selected":""}>Pending</option>
          <option ${r.status==="Approved"?"selected":""}>Approved</option>
          <option ${r.status==="Fulfilled"?"selected":""}>Fulfilled</option>
          <option ${r.status==="Rejected"?"selected":""}>Rejected</option>
        </select>
      </td>
      <td>
        <button class="btn-mini danger" data-del="${idx}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function applyFilters(){
  const q = search.value.toLowerCase().trim();
  const sf = statusFilter.value;

  const list = loadData();
  const filtered = list.filter(r => {
    const matchText =
      ("#" + r.requestId).toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q);

    const matchStatus = !sf || r.status === sf;
    return matchText && matchStatus;
  });

  render(filtered);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadData();

  const r = {
    requestId: newReqId(list),
    patientId: document.getElementById("patientId").value.trim().toUpperCase(),
    hospitalId: document.getElementById("hospitalId").value.trim(),
    requestDate: document.getElementById("requestDate").value,
    bloodGroup: document.getElementById("bloodGroup").value,
    type: document.getElementById("type").value,
    qty: document.getElementById("qty").value,
    urgency: document.getElementById("urgency").value,
    status: document.getElementById("status").value
  };

  if (!r.patientId || !r.hospitalId || !r.requestDate || !r.bloodGroup || !r.type || !r.qty || !r.urgency || !r.status) {
    showMessage("Please fill required fields", true);
    return;
  }

  list.push(r);
  saveData(list);
  render(list);
  form.reset();
  showMessage("Request saved ✅");
});

document.getElementById("requestTable").addEventListener("change", (e) => {
  const sel = e.target.closest("[data-update]");
  if (!sel) return;

  const idx = Number(sel.dataset.update);
  const list = loadData();
  list[idx].status = sel.value;
  saveData(list);
  applyFilters();
  showMessage("Status updated");
});

document.getElementById("requestTable").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  const list = loadData();
  list.splice(idx, 1);
  saveData(list);
  applyFilters();
  showMessage("Deleted");
});

search.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// default date today
document.getElementById("requestDate").valueAsDate = new Date();

// initial render
render(loadData());