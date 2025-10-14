
const API_URL = "http://localhost:5000";  // backend address

function toggleForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
}

// Register new user
async function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!name || !phone || !password) {
    alert("Please fill all fields!");
    return;
  }

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password }),
  });

  const data = await response.json();
  alert(data.message);
}

async function loginUser() {
  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password })
  });

  const data = await res.json();
  alert(data.message);

  if (data.success) {
    // ✅ Save login info in localStorage
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("name", data.name);

    // ✅ Redirect to dashboard page
    window.location.href = "frontened.html";
  }
}


