const datePicker = document.getElementById('datePicker');
datePicker.value = new Date().toISOString().split('T')[0];
let totalCalories = 0;
let items = [];

function loadData() {
  const dateKey = 'calorieTracker-' + datePicker.value;
  const data = localStorage.getItem(dateKey);
  items = data ? JSON.parse(data) : [];
  totalCalories = 0;
  document.querySelector('#foodTable tbody').innerHTML = '';
  items.forEach(item => {
    totalCalories += item.totalCalories;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.foodItem}</td>
                     <td>${item.servingSize}</td>
                     <td>${item.calPerServing}</td>
                     <td>${item.totalCalories}</td>`;
    document.querySelector('#foodTable tbody').appendChild(row);
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
  totalCalories += itemCalories;
  const newItem = { foodItem, servingSize, calPerServing, totalCalories: itemCalories };
  items.push(newItem);

  const row = document.createElement('tr');
  row.innerHTML = `<td>${foodItem}</td>
                   <td>${servingSize}</td>
                   <td>${calPerServing}</td>
                   <td>${itemCalories}</td>`;
  document.querySelector('#foodTable tbody').appendChild(row);

  updateProgress();
  saveData();

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

datePicker.addEventListener('change', loadData);
loadData();
