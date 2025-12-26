const session = applyRBAC();
if (!session) return;

const form = document.getElementById("profileForm");
const msg = document.getElementById("msg");

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const roleEl = document.getElementById("role");
const passEl = document.getElementById("password");

// load session data
nameEl.value = session.name || "";
emailEl.value = session.email || "";
roleEl.value = session.role || "";

const USERS_KEY = "jv_users";

function loadUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(list){
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function showMessage(text, isError=false){
  msg.className = "msg " + (isError ? "err" : "ok");
  msg.textContent = text;
  setTimeout(() => msg.textContent = "", 1500);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const list = loadUsers();
  const idx = list.findIndex(u => u.email === session.email);

  if (idx === -1){
    showMessage("User not found", true);
    return;
  }

  // update name
  list[idx].name = nameEl.value.trim();

  // update password (demo only)
  if (passEl.value.trim()){
    list[idx].password = passEl.value;
  }

  saveUsers(list);

  // update session also
  session.name = list[idx].name;
  localStorage.setItem("jv_session", JSON.stringify(session));

  passEl.value = "";
  showMessage("Profile updated ✅");
});