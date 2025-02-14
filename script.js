document.addEventListener('DOMContentLoaded', () => {
  const DAILY_GOAL = 1800;
  let items = [];

  const form = document.getElementById('calorie-form');
  const foodNameInput = document.getElementById('food-name');
  const servingsInput = document.getElementById('servings');
  const caloriesInput = document.getElementById('calories-per-serving');
  const totalCaloriesEl = document.getElementById('total-calories');
  const progressEl = document.getElementById('progress');
  const remainingCaloriesEl = document.getElementById('remaining-calories');
  const footerTotalEl = document.getElementById('footer-total');
  const itemsListEl = document.getElementById('items-list');
  const errorMessageEl = document.getElementById('error-message');
  const clearAllBtn = document.getElementById('clear-all');

  loadItems();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();

    const name = foodNameInput.value.trim();
    const servings = parseFloat(servingsInput.value);
    const calories = parseFloat(caloriesInput.value);

    if (!name || isNaN(servings) || isNaN(calories) || servings <= 0 || calories <= 0) {
      displayError("Enter valid values.");
      return;
    }

    const newItem = { id: Date.now(), name, servings, calories };
    items.push(newItem);
    saveItems();
    updateUI();
    form.reset();
  });

  clearAllBtn.addEventListener('click', () => {
    if (confirm("Clear all items?")) {
      items = [];
      saveItems();
      updateUI();
    }
  });

  function updateUI() {
    const totalCalories = items.reduce((sum, item) => sum + item.servings * item.calories, 0);
    totalCaloriesEl.textContent = `Total: ${totalCalories} cal`;
    footerTotalEl.textContent = `Total Calories: ${totalCalories}`;

    const remaining = DAILY_GOAL - totalCalories;
    remainingCaloriesEl.textContent = remaining >= 0
      ? `${remaining} cal remaining`
      : `${Math.abs(remaining)} cal over`;

    const progressPercent = Math.min((totalCalories / DAILY_GOAL) * 100, 100);
    progressEl.style.width = progressPercent + '%';

    renderItems();
  }

  function renderItems() {
    if (!items.length) {
      itemsListEl.innerHTML = '<p class="empty-message">No items added yet.</p>';
      return;
    }
    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');

      const infoDiv = document.createElement('div');
      infoDiv.className = 'item-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'item-name';
      nameSpan.textContent = item.name;

      const servingsSpan = document.createElement('span');
      servingsSpan.textContent = `${item.servings} serving${item.servings > 1 ? 's' : ''}`;

      const caloriesSpan = document.createElement('span');
      caloriesSpan.textContent = `${item.calories} cal/serving`;

      infoDiv.append(nameSpan, servingsSpan, caloriesSpan);

      const totalDiv = document.createElement('div');
      totalDiv.textContent = `${item.servings * item.calories} cal`;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => removeItem(item.id));

      li.append(infoDiv, totalDiv, removeBtn);
      ul.appendChild(li);
    });
    itemsListEl.innerHTML = '';
    itemsListEl.appendChild(ul);
  }

  function removeItem(id) {
    items = items.filter(item => item.id !== id);
    saveItems();
    updateUI();
  }

  function saveItems() {
    localStorage.setItem('calorieItems', JSON.stringify(items));
  }

  function loadItems() {
    const stored = localStorage.getItem('calorieItems');
    if (stored) {
      try {
        items = JSON.parse(stored);
      } catch {
        items = [];
      }
    }
    updateUI();
  }

  function displayError(msg) {
    errorMessageEl.textContent = msg;
  }

  function clearError() {
    errorMessageEl.textContent = '';
  }
});
