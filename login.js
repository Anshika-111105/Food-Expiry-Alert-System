// ====================== CONFIG ======================
const API_BASE = "http://localhost:5000";
const DASHBOARD_PATH = "frontend.html";   // both pages in /public

// ====================== TOGGLE BETWEEN FORMS ======================
function toggleForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
}

// ====================== COUNTRY CODE LIST ======================
const countryCodes = [
  { name: "India", code: "+91" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Canada", code: "+1" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Italy", code: "+39" },
  { name: "Japan", code: "+81" },
  { name: "China", code: "+86" },
  { name: "Brazil", code: "+55" },
  { name: "South Africa", code: "+27" },
  { name: "Singapore", code: "+65" },
  { name: "United Arab Emirates", code: "+971" },
  { name: "Russia", code: "+7" },
  { name: "Mexico", code: "+52" },
  { name: "Spain", code: "+34" },
  { name: "New Zealand", code: "+64" },
  { name: "Nepal", code: "+977" },
  { name: "Bangladesh", code: "+880" },
];

// ====================== POPULATE COUNTRY DROPDOWNS ======================
function populateCountryCodes() {
  const selects = document.querySelectorAll(".countryCodeSelect");
  selects.forEach(select => {
    select.innerHTML = "";
    countryCodes.forEach(c => {
      const option = document.createElement("option");
      option.value = c.code;
      option.textContent = `${c.name} (${c.code})`;
      if (c.code === "+91") option.selected = true; // default India
      select.appendChild(option);
    });
  });
}
window.addEventListener("DOMContentLoaded", populateCountryCodes);

// ====================== REGISTER ======================
async function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const countryCode = document.getElementById("regCountryCode").value;
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!name || !phone || !password) {
    alert("Please fill all fields!");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    alert("📱 Please enter a valid 10-digit phone number.");
    return;
  }

  const fullPhone = `${countryCode}${phone}`;

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: fullPhone, password }),
    });

    const data = await response.json();
    alert(data.message);

    if (data.success) {
      alert("Registration successful! Please log in.");
      toggleForm();
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Server error — please try again later.");
  }
}

// ====================== LOGIN ======================
async function loginUser() {
  const countryCode = document.getElementById("loginCountryCode").value;
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!phone || !password) {
    alert("Please enter both phone number and password.");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    alert("📱 Please enter a valid 10-digit phone number.");
    return;
  }

  const fullPhone = `${countryCode}${phone}`;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      if (data.user_id && data.name) {
        localStorage.setItem("user_id", data.user_id.toString());
        localStorage.setItem("user_name", data.name);
        window.location.href = DASHBOARD_PATH;
      } else {
        console.error("Missing user data in response:", data);
        alert("Login failed: Missing user data");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Server error — please try again later.");
  }
}
