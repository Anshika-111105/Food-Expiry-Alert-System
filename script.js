// ====================== CHECK LOGIN ======================
const user_id = localStorage.getItem("user_id");

// If user is not logged in, redirect back to login page
if (!user_id) {
  window.location.href = "login.html";
}

// Base URL for backend API
const API_URL = "http://localhost:5000";

// Select form and table body
const form = document.getElementById("foodForm");
const tableBody = document.querySelector("#foodTable tbody");

// ====================== ADD NEW ITEM ======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const item = {
    item_name: document.getElementById("item_name").value.trim(),
    quantity: document.getElementById("quantity").value.trim(),
    purchase_date: document.getElementById("purchase_date").value,
    expiry_date: document.getElementById("expiry_date").value,
    category: document.getElementById("category").value.trim(),
    user_id: user_id // 👈 include logged-in user's ID
  };

  try {
    const res = await fetch(`${API_URL}/add-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    const data = await res.json();
    alert(data.message);
    form.reset();
    loadItems();
  } catch (err) {
    console.error("Error adding item:", err);
    alert("Failed to add item.");
  }
});

// ====================== LOAD USER'S ITEMS ======================
async function loadItems() {
  try {
    const res = await fetch(`${API_URL}/items/${user_id}`);
    const items = await res.json();

    tableBody.innerHTML = "";
    const today = new Date();

    items.forEach(i => {
      const expiry = new Date(i.expiry_date);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      let status = "";
      let rowClass = "";

      if (diffDays < 0) {
        status = "Expired";
        rowClass = "expired";
      } else if (diffDays <= 2) {
        status = "Expiring Soon";
        rowClass = "soon";
      } else {
        status = "Fresh";
        rowClass = "safe";
      }

      const row = `
        <tr class="${rowClass}">
          <td>${i.id}</td>
          <td>${i.item_name}</td>
          <td>${i.quantity}</td>
          <td>${i.purchase_date}</td>
          <td>${i.expiry_date}</td>
          <td>${i.category}</td>
          <td>${status}</td>
          <td><button onclick="deleteItem(${i.id})">Delete</button></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (err) {
    console.error("Error loading items:", err);
  }
}

// ====================== DELETE ITEM ======================
async function deleteItem(id) {
  try {
    const res = await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.message);
    loadItems();
  } catch (err) {
    console.error("Error deleting item:", err);
  }
}

// Load items when dashboard opens
loadItems();
