const donors = [
  { id: "D001", name: "Charith K", blood: "O+", phone: "0777678678", status: "Eligible" },
  { id: "D002", name: "Vithuran", blood: "A+", phone: "0711123123", status: "Not Eligible" },
  { id: "D003", name: "Sula", blood: "B-", phone: "0755123123", status: "Eligible" },
  { id: "D004", name: "Walakulu", blood: "AB+", phone: "0788123123", status: "Eligible" }
];

const tableBody = document.querySelector("#donorTable tbody");
const bloodFilter = document.getElementById("bloodFilter");
const eligibilityFilter = document.getElementById("eligibilityFilter");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

// session check
const session =
  JSON.parse(localStorage.getItem("jv_session")) ||
  JSON.parse(sessionStorage.getItem("jv_session"));

if (!session) window.location.href = "login.html";

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jv_session");
  sessionStorage.removeItem("jv_session");
  window.location.href = "login.html";
});

function renderTable(data){
  tableBody.innerHTML = "";
  data.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.name}</td>
      <td>${d.blood}</td>
      <td>${d.phone}</td>
      <td class="${d.status === "Eligible" ? "status done" : "status urgent"}">
        ${d.status}
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function applyFilters(){
  const blood = bloodFilter.value;
  const status = eligibilityFilter.value;
  const search = searchInput.value.toLowerCase();

  const filtered = donors.filter(d =>
    (!blood || d.blood === blood) &&
    (!status || d.status === status) &&
    (d.name.toLowerCase().includes(search) || d.phone.includes(search))
  );

  renderTable(filtered);
}

bloodFilter.addEventListener("change", applyFilters);
eligibilityFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

// initial load
renderTable(donors);