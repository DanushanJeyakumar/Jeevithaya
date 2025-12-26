const session = applyRBAC();
if (!session) return;

// DOM
const form = document.getElementById("invForm");
const tableBody = document.querySelector("#invTable tbody");
const msg = document.getElementById("msg");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

const KEY = "jv_inventory";

function loadData(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function saveData(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function newUnitId(list){
  const next = list.length + 1;
  return "U" + String(next).padStart(4, "0");
}

function showMessage(text, isError=false){
  if (!msg) return;
  msg.className = "msg " + (isError ? "err" : "ok");
  msg.textContent = text;
  setTimeout(() => { msg.textContent = ""; }, 1500);
}

function isExpired(expiry){
  const today = new Date(); today.setHours(0,0,0,0);
  const ex = new Date(expiry); ex.setHours(0,0,0,0);
  return ex < today;
}

function statusClass(s){
  if (s === "Expired") return "urgent";
  if (s === "Reserved") return "pending";
  if (s === "Issued") return "pending";
  return "done";
}

// ✅ Render uses "real index" from storage to avoid filter bugs
function render(rows){
  tableBody.innerHTML = "";
  rows.forEach((row) => {
    const u = row.item;
    const realIdx = row.realIdx;

    const expired = isExpired(u.expiry);
    const finalStatus = expired ? "Expired" : u.status;

    const tr = document.createElement("tr");
    tr.className = expired ? "row-expired" : "";
    tr.innerHTML = `
      <td>${u.unitId}</td>
      <td>${u.donationId}</td>
      <td>${u.donorId}</td>
      <td>${u.bloodbankId}</td>
      <td>${u.bloodGroup}</td>
      <td>${u.type}</td>
      <td>${u.qty}</td>
      <td>${u.batchNo}</td>
      <td>${u.expiry}</td>
      <td class="status ${statusClass(finalStatus)}">${finalStatus}</td>
      <td>
        <select class="input input-mini" data-update="${realIdx}" ${expired ? "disabled" : ""}>
          <option ${u.status==="Available"?"selected":""}>Available</option>
          <option ${u.status==="Reserved"?"selected":""}>Reserved</option>
          <option ${u.status==="Issued"?"selected":""}>Issued</option>
        </select>
      </td>
      <td>
        <button class="btn-mini danger" data-del="${realIdx}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function applyFilters(){
  const q = (search?.value || "").toLowerCase().trim();
  const sf = statusFilter?.value || "";

  const list = loadData();

  // build rows with realIdx
  const rows = list.map((item, realIdx) => ({ item, realIdx }));

  const filtered = rows.filter(({ item }) => {
    const expired = isExpired(item.expiry);
    const finalStatus = expired ? "Expired" : item.status;

    const matchText =
      item.unitId.toLowerCase().includes(q) ||
      item.donorId.toLowerCase().includes(q) ||
      item.batchNo.toLowerCase().includes(q);

    const matchStatus = !sf || finalStatus === sf;
    return matchText && matchStatus;
  });

  render(filtered);
}

// Add unit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadData();

  const u = {
    unitId: newUnitId(list),
    donationId: document.getElementById("donationId").value.trim().toUpperCase(),
    donorId: document.getElementById("donorId").value.trim().toUpperCase(),
    bloodbankId: document.getElementById("bloodbankId").value.trim(),
    bloodGroup: document.getElementById("bloodGroup").value,
    type: document.getElementById("type").value,
    qty: document.getElementById("qty").value,
    batchNo: document.getElementById("batchNo").value.trim(),
    expiry: document.getElementById("expiry").value,
    status: document.getElementById("status").value
  };

  if (!u.donationId || !u.donorId || !u.bloodbankId || !u.bloodGroup || !u.type || !u.qty || !u.batchNo || !u.expiry || !u.status){
    showMessage("Please fill required fields", true);
    return;
  }

  list.push(u);
  saveData(list);
  form.reset();
  showMessage("Unit saved ✅");
  applyFilters();
});

// Update status (uses realIdx)
document.getElementById("invTable").addEventListener("change", (e) => {
  const sel = e.target.closest("[data-update]");
  if (!sel) return;

  const realIdx = Number(sel.dataset.update);
  const list = loadData();
  if (!list[realIdx]) return;

  list[realIdx].status = sel.value;
  saveData(list);
  applyFilters();
  showMessage("Status updated");
});

// Delete (uses realIdx)
document.getElementById("invTable").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const realIdx = Number(btn.dataset.del);
  const list = loadData();
  if (!list[realIdx]) return;

  list.splice(realIdx, 1);
  saveData(list);
  applyFilters();
  showMessage("Deleted");
});

// Filters
if (search) search.addEventListener("input", applyFilters);
if (statusFilter) statusFilter.addEventListener("change", applyFilters);

// initial expiry default (30 days from now)
const d = new Date();
d.setDate(d.getDate() + 30);
const expiryEl = document.getElementById("expiry");
if (expiryEl) expiryEl.valueAsDate = d;

// initial render (respect filters)
applyFilters();