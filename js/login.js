const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const togglePwd = document.getElementById("togglePwd");
const passwordEl = document.getElementById("password");
const forgotLink = document.getElementById("forgotLink");

togglePwd.addEventListener("click", () => {
  const isPwd = passwordEl.type === "password";
  passwordEl.type = isPwd ? "text" : "password";
  togglePwd.textContent = isPwd ? "Hide" : "Show";
});

forgotLink.addEventListener("click", (e) => {
  e.preventDefault();
  msg.className = "msg err";
  msg.textContent = "Demo mode: password is 1234 🙂";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const role = document.querySelector('input[name="role"]:checked')?.value;
  const email = document.getElementById("email").value.trim();
  const password = passwordEl.value.trim();
  const remember = document.getElementById("remember").checked;

  if (!email) return showError("Please enter email.");
  if (password !== "1234") return showError("Invalid password (demo: 1234).");

  // Save session
  const session = {
    role,
    email,
    loginAt: new Date().toISOString()
  };

  if (remember) {
    localStorage.setItem("jv_session", JSON.stringify(session));
  } else {
    sessionStorage.setItem("jv_session", JSON.stringify(session));
  }

  showOk("Login success! Redirecting...");

  // Redirect based on role (next page)
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 800);
});

function showError(text){
  msg.className = "msg err";
  msg.textContent = text;
}
function showOk(text){
  msg.className = "msg ok";
  msg.textContent = text;
}