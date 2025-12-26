function getSession(){
  try {
    return JSON.parse(localStorage.getItem("jv_session")) ||
           JSON.parse(sessionStorage.getItem("jv_session"));
  } catch {
    return null;
  }
}

const session = getSession();

if (!session) {
  document.body.innerHTML = `
    <div style="font-family:system-ui; padding:40px;">
      <h2>Session not found</h2>
      <p>Please login first.</p>
      <a href="login.html">Go to Login</a>
    </div>
  `;
} else {

  const logoutBtn = document.getElementById("logoutBtn");
  const form = document.getElementById("disForm");
  const tableBody = document.querySelector("#disTable tbody");
  const msg = document.getElementById("msg");
  const search = document.getElementById("search");

  const unitIdEl = document.getElementById("unitId");
  const donorIdEl = document.getElementById("donorId");
  const verificationIdEl = document.getElementById("verificationId");
  const disposedByEl = document.getElementById("disposedBy");
  const dateEl = document.getElementById("date");
  const reasonEl = document.getElementById("reason");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jv_session");
    sessionStorage.removeItem("jv_session");
    window.location.href = "login.html";
  });

  const KEY = "jv_disposals";

  function loadData(){
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function saveData(list){
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function newDid(list){
    return "D" + String(list.length + 1).padStart(4, "0");
  }

  function showMessage(text, isError=false){
    msg.className = "msg " + (isError ? "err" : "ok");
    msg.textContent = text;
    setTimeout(() => msg.textContent = "", 1500);
  }

  function render(list){
    tableBody.innerHTML = "";
    list.forEach((d, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.disposalId}</td>
        <td>${d.unitId}</td>
        <td>${d.donorId}</td>
        <td>${d.verificationId || "-"}</td>
        <td>${d.date}</td>
        <td>${d.disposedBy}</td>
        <td>${d.reason}</td>
        <td>
          <button class="btn-mini danger" data-del="${i}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function applySearch(){
    const q = search.value.toLowerCase().trim();
    const list = loadData();
    const filtered = list.filter(d =>
      d.unitId.toLowerCase().includes(q) ||
      d.donorId.toLowerCase().includes(q)
    );
    render(filtered);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const list = loadData();

    const d = {
      disposalId: newDid(list),
      unitId: unitIdEl.value.trim().toUpperCase(),
      donorId: donorIdEl.value.trim().toUpperCase(),
      verificationId: verificationIdEl.value.trim().toUpperCase(),
      disposedBy: disposedByEl.value.trim(),
      date: dateEl.value,
      reason: reasonEl.value.trim()
    };

    if (!d.unitId || !d.donorId || !d.disposedBy || !d.date || !d.reason) {
      showMessage("Please fill required fields", true);
      return;
    }

    list.push(d);
    saveData(list);
    render(list);
    form.reset();
    dateEl.valueAsDate = new Date();
    showMessage("Disposal recorded ✅");
  });

  document.getElementById("disTable").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del]");
    if (!btn) return;

    const idx = Number(btn.dataset.del);
    const list = loadData();
    list.splice(idx, 1);
    saveData(list);
    applySearch();
    showMessage("Deleted");
  });

  search.addEventListener("input", applySearch);

  dateEl.valueAsDate = new Date();
  render(loadData());
}