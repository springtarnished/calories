const datePicker = document.getElementById('datePicker');
datePicker.value = new Date().toISOString().split('T')[0];
let totalCalories = 0;
let items = [];

function loadData() {
  const dateKey = 'calorieTracker-' + datePicker.value;
  const data = localStorage.getItem(dateKey);
  items = data ? JSON.parse(data) : [];
  totalCalories = 0;
  const tbody = document.querySelector('#foodTable tbody');
  tbody.innerHTML = '';
  items.forEach((item, index) => {
    totalCalories += item.totalCalories;
    const row = document.createElement('tr');
    row.id = `row-${index}`;
    row.innerHTML = `
      <td>${item.foodItem}</td>
      <td>${item.servingSize}</td>
      <td>${item.calPerServing}</td>
      <td>${item.totalCalories}</td>
      <td>
        <button onclick="editItem(${index})">Edit</button>
        <button onclick="deleteItem(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateProgress();
}

function saveData() {
  const dateKey = 'calorieTracker-' + datePicker.value;
  localStorage.setItem(dateKey, JSON.stringify(items));
}

function addItem() {
  const foodItem = document.getElementById('foodItem').value;
  const servingSize = parseFloat(document.getElementById('servingSize').value);
  const calPerServing = parseFloat(document.getElementById('calPerServing').value);
  if (!foodItem || isNaN(servingSize) || isNaN(calPerServing)) return;
  const itemCalories = servingSize * calPerServing;
  const newItem = { foodItem, servingSize, calPerServing, totalCalories: itemCalories };
  items.push(newItem);
  saveData();
  loadData();
  document.getElementById('foodItem').value = '';
  document.getElementById('servingSize').value = '';
  document.getElementById('calPerServing').value = '';
}

function updateProgress() {
  const progressPercent = Math.min((totalCalories / 1800) * 100, 100);
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = progressPercent + '%';
  progressBar.textContent = `${totalCalories} / 1800`;
}

function editItem(index) {
  const row = document.getElementById(`row-${index}`);
  const item = items[index];
  row.innerHTML = `
    <td><input type="text" id="edit-foodItem-${index}" value="${item.foodItem}"></td>
    <td><input type="number" id="edit-servingSize-${index}" value="${item.servingSize}"></td>
    <td><input type="number" id="edit-calPerServing-${index}" value="${item.calPerServing}"></td>
    <td>${item.servingSize * item.calPerServing}</td>
    <td>
      <button onclick="saveEdit(${index})">Save</button>
      <button onclick="loadData()">Cancel</button>
    </td>
  `;
}

function saveEdit(index) {
  const foodItem = document.getElementById(`edit-foodItem-${index}`).value;
  const servingSize = parseFloat(document.getElementById(`edit-servingSize-${index}`).value);
  const calPerServing = parseFloat(document.getElementById(`edit-calPerServing-${index}`).value);
  if (!foodItem || isNaN(servingSize) || isNaN(calPerServing)) return;
  const itemCalories = servingSize * calPerServing;
  items[index] = { foodItem, servingSize, calPerServing, totalCalories: itemCalories };
  saveData();
  loadData();
}

function deleteItem(index) {
  items.splice(index, 1);
  saveData();
  loadData();
}

datePicker.addEventListener('change', loadData);
loadData();
