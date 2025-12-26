const session = applyRBAC();
if (!session) return;

// extra safety
if (session.role !== "System Admin") {
  document.body.innerHTML = `
    <div style="padding:40px;font-family:system-ui">
      <h2>Access Denied</h2>
      <p>Only System Admin can manage users.</p>
    </div>
  `;
  return;
}

const form = document.getElementById("userForm");
const tableBody = document.querySelector("#userTable tbody");
const msg = document.getElementById("msg");

const KEY = "jv_users";

function loadUsers(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function saveUsers(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}

function newUserId(list){
  return "U" + String(list.length + 1).padStart(3, "0");
}

function showMessage(text, isError=false){
  msg.className = "msg " + (isError ? "err" : "ok");
  msg.textContent = text;
  setTimeout(() => msg.textContent = "", 1500);
}

function render(){
  const list = loadUsers();
  tableBody.innerHTML = "";

  list.forEach((u, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.userId}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>
        <button class="btn-mini danger" data-del="${i}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadUsers();

  const user = {
    userId: newUserId(list),
    name: form.name.value.trim(),
    email: form.email.value.trim().toLowerCase(),
    role: form.role.value,
    password: form.password.value   // demo only
  };

  if (!user.name || !user.email || !user.role || !user.password){
    showMessage("Fill all fields", true);
    return;
  }

  if (list.some(u => u.email === user.email)){
    showMessage("Email already exists", true);
    return;
  }

  list.push(user);
  saveUsers(list);
  form.reset();
  render();
  showMessage("User created ✅");
});

document.getElementById("userTable").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const list = loadUsers();
  list.splice(btn.dataset.del, 1);
  saveUsers(list);
  render();
  showMessage("Deleted");
});

render();