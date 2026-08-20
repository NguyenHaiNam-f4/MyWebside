const STORAGE_KEY = "finance_manager_transactions_v1";

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const monthFilterInput = document.getElementById("month-filter");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const listEl = document.getElementById("transaction-list");
const emptyStateEl = document.getElementById("empty-state");

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function getMonthKey(dateString) {
  return dateString.slice(0, 7);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function render(transactions) {
  const monthValue = monthFilterInput.value;
  const visibleTransactions = monthValue
    ? transactions.filter((item) => getMonthKey(item.date) === monthValue)
    : transactions;

  let income = 0;
  let expense = 0;

  visibleTransactions.forEach((item) => {
    if (item.type === "income") income += item.amount;
    if (item.type === "expense") expense += item.amount;
  });

  const balance = income - expense;
  incomeEl.textContent = currencyFormatter.format(income);
  expenseEl.textContent = currencyFormatter.format(expense);
  balanceEl.textContent = currencyFormatter.format(balance);

  listEl.innerHTML = "";
  emptyStateEl.style.display =
    visibleTransactions.length === 0 ? "block" : "none";

  visibleTransactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .forEach((item) => {
      const row = document.createElement("tr");
      const amountClass =
        item.type === "income" ? "amount-income" : "amount-expense";
      const typeLabel = item.type === "income" ? "Thu" : "Chi";

      row.innerHTML = `
        <td>${formatDate(item.date)}</td>
        <td>${item.description}</td>
        <td>${item.category}</td>
        <td>${typeLabel}</td>
        <td class="${amountClass}">${currencyFormatter.format(item.amount)}</td>
        <td><button class="delete-btn" data-id="${item.id}" title="Xóa">Xóa</button></td>
      `;

      listEl.appendChild(row);
    });
}

function resetForm() {
  form.reset();
  dateInput.valueAsDate = new Date();
  descriptionInput.focus();
}

const transactions = loadTransactions();
if (!dateInput.value) {
  dateInput.valueAsDate = new Date();
}
render(transactions);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(amountInput.value);
  if (!Number.isFinite(amount) || amount <= 0) return;

  const newTransaction = {
    id: createId(),
    description: descriptionInput.value.trim(),
    amount,
    type: typeInput.value,
    category: categoryInput.value.trim(),
    date: dateInput.value,
  };

  if (
    !newTransaction.description ||
    !newTransaction.category ||
    !newTransaction.date
  )
    return;

  transactions.push(newTransaction);
  saveTransactions(transactions);
  render(transactions);
  resetForm();
});

monthFilterInput.addEventListener("change", () => {
  render(transactions);
});

listEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.dataset.id;
  if (!id) return;

  const next = transactions.filter((item) => item.id !== id);
  transactions.length = 0;
  transactions.push(...next);

  saveTransactions(transactions);
  render(transactions);
});
