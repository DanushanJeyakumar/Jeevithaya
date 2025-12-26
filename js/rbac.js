
function getSession(){
  try {
    return JSON.parse(localStorage.getItem("jv_session")) ||
           JSON.parse(sessionStorage.getItem("jv_session"));
  } catch {
    return null;
  }
}

function applyRBAC(){
  const session = getSession();

  // if no session -> show login message (avoid blank)
  if (!session) {
    document.body.innerHTML = `
      <div style="font-family:system-ui; padding:40px;">
        <h2>Session not found</h2>
        <p>Please login first.</p>
        <a href="login.html">Go to Login</a>
      </div>
    `;
    return null;
  }

  const role = (session.role || "").trim();

  // hide/show menu items by role
  document.querySelectorAll(".menu [data-role]").forEach(link => {
    const allowed = link.getAttribute("data-role")
      .split(",")
      .map(r => r.trim());

    link.style.display = allowed.includes(role) ? "" : "none";
  });

  // show user email (optional)
  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) userEmailEl.textContent = session.email || "";

  // show welcome role (optional)
  const roleInfoEl = document.getElementById("roleInfo");
  if (roleInfoEl) roleInfoEl.textContent = `Role: ${role}`;

  // logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jv_session");
      sessionStorage.removeItem("jv_session");
      window.location.href = "login.html";
    });
  }

  return session;
}