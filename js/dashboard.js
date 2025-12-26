const session =
  JSON.parse(localStorage.getItem("jv_session")) ||
  JSON.parse(sessionStorage.getItem("jv_session"));

if (!session) {
  window.location.href = "login.html";
}

const roleMap = {
  system_admin: "System Admin",
  hospital_admin: "Hospital Admin",
  frontoffice_user: "Front Office User",
  lab_assistant: "Lab Assistant"
};

document.getElementById("userEmail").textContent = session.email;
document.getElementById("roleInfo").textContent =
  "Role: " + (roleMap[session.role] || "User");

document.getElementById("welcome").textContent =
  "Welcome, " + (roleMap[session.role] || "User");

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("jv_session");
  sessionStorage.removeItem("jv_session");
  window.location.href = "login.html";
});