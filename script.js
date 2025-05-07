// Utility to format currency
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Elements
const tabInputBtn = document.getElementById('tabInputBtn');
const tabSavedBtn = document.getElementById('tabSavedBtn');
const tabInput = document.getElementById('tabInput');
const tabSaved = document.getElementById('tabSaved');

// Tab switching
tabInputBtn.addEventListener('click', () => {
  tabInputBtn.classList.add('border-blue-600', 'text-blue-600', 'font-semibold');
  tabInputBtn.setAttribute('aria-selected', 'true');
  tabSavedBtn.classList.remove('border-blue-600', 'text-blue-600', 'font-semibold');
  tabSavedBtn.setAttribute('aria-selected', 'false');
  tabInput.classList.remove('hidden');
  tabSaved.classList.add('hidden');
  clearSavedDetails();
});

tabSavedBtn.addEventListener('click', () => {
  tabSavedBtn.classList.add('border-blue-600', 'text-blue-600', 'font-semibold');
  tabSavedBtn.setAttribute('aria-selected', 'true');
  tabInputBtn.classList.remove('border-blue-600', 'text-blue-600', 'font-semibold');
  tabInputBtn.setAttribute('aria-selected', 'false');
  tabSaved.classList.remove('hidden');
  tabInput.classList.add('hidden');
  loadSavedDataList();
});

// Dynamic additional incomes and bills
const additionalIncomesList = document.getElementById('additionalIncomesList');
const addIncomeBtn = document.getElementById('addIncomeBtn');
const billsList = document.getElementById('billsList');
const addBillBtn = document.getElementById('addBillBtn');

function createIncomeInput(day = '', value = '') {
  const div = document.createElement('div');
  div.className = 'flex flex-wrap gap-4 items-end';

  const dayDiv = document.createElement('div');
  dayDiv.className = 'flex flex-col flex-grow';
  const dayLabel = document.createElement('label');
  dayLabel.textContent = 'Dia do pagamento';
  dayLabel.className = 'mb-1 font-medium';
  const dayInput = document.createElement('input');
  dayInput.type = 'number';
  dayInput.min = '1';
  dayInput.max = '31';
  dayInput.required = true;
  dayInput.value = day;
  dayInput.className = 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500';
  dayDiv.appendChild(dayLabel);
  dayDiv.appendChild(dayInput);

  const valueDiv = document.createElement('div');
  valueDiv.className = 'flex flex-col flex-grow';
  const valueLabel = document.createElement('label');
  valueLabel.textContent = 'Valor (R$)';
  valueLabel.className = 'mb-1 font-medium';
  const valueInput = document.createElement('input');
  valueInput.type = 'number';
  valueInput.min = '0';
  valueInput.step = '0.01';
  valueInput.required = true;
  valueInput.value = value;
  valueInput.className = 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500';
  valueDiv.appendChild(valueLabel);
  valueDiv.appendChild(valueInput);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'ml-2 text-red-600 hover:text-red-800 focus:outline-none';
  removeBtn.title = 'Remover rendimento';
  removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
  removeBtn.addEventListener('click', () => {
    div.remove();
  });

  div.appendChild(dayDiv);
  div.appendChild(valueDiv);
  div.appendChild(removeBtn);

  return div;
}

function createBillInput(day = '', value = '') {
  const div = document.createElement('div');
  div.className = 'flex flex-wrap gap-4 items-end';

  const dayDiv = document.createElement('div');
  dayDiv.className = 'flex flex-col flex-grow';
  const dayLabel = document.createElement('label');
  dayLabel.textContent = 'Data de vencimento';
  dayLabel.className = 'mb-1 font-medium';
  const dayInput = document.createElement('input');
  dayInput.type = 'number';
  dayInput.min = '1';
  dayInput.max = '31';
  dayInput.required = true;
  dayInput.value = day;
  dayInput.className = 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500';
  dayDiv.appendChild(dayLabel);
  dayDiv.appendChild(dayInput);

  const valueDiv = document.createElement('div');
  valueDiv.className = 'flex flex-col flex-grow';
  const valueLabel = document.createElement('label');
  valueLabel.textContent = 'Valor (R$)';
  valueLabel.className = 'mb-1 font-medium';
  const valueInput = document.createElement('input');
  valueInput.type = 'number';
  valueInput.min = '0';
  valueInput.step = '0.01';
  valueInput.required = true;
  valueInput.value = value;
  valueInput.className = 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500';
  valueDiv.appendChild(valueLabel);
  valueDiv.appendChild(valueInput);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'ml-2 text-red-600 hover:text-red-800 focus:outline-none';
  removeBtn.title = 'Remover conta';
  removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
  removeBtn.addEventListener('click', () => {
    div.remove();
  });

  div.appendChild(dayDiv);
  div.appendChild(valueDiv);
  div.appendChild(removeBtn);

  return div;
}

addIncomeBtn.addEventListener('click', () => {
  additionalIncomesList.appendChild(createIncomeInput());
});

addBillBtn.addEventListener('click', () => {
  billsList.appendChild(createBillInput());
});

// Initialize with one additional income and one bill input empty
addIncomeBtn.click();
addBillBtn.click();

// Calculation and suggestions
const calculateBtn = document.getElementById('calculateBtn');
const resultsSection = document.getElementById('resultsSection');
const totalDebtsSpan = document.getElementById('totalDebts');
const totalIncomesSpan = document.getElementById('totalIncomes');
const balanceSpan = document.getElementById('balance');
const balanceStatus = document.getElementById('balanceStatus');
const paymentSuggestions = document.getElementById('paymentSuggestions');
const improvementSuggestions = document.getElementById('improvementSuggestions');

function parseInputs() {
  const mainIncomeDay = parseInt(document.getElementById('mainIncomeDay').value);
  const mainIncomeValue = parseFloat(document.getElementById('mainIncomeValue').value);

  const additionalIncomes = [];
  for (const div of additionalIncomesList.children) {
    const inputs = div.getElementsByTagName('input');
    const day = parseInt(inputs[0].value);
    const value = parseFloat(inputs[1].value);
    if (!isNaN(day) && !isNaN(value)) {
      additionalIncomes.push({ day, value });
    }
  }

  const bills = [];
  for (const div of billsList.children) {
    const inputs = div.getElementsByTagName('input');
    const day = parseInt(inputs[0].value);
    const value = parseFloat(inputs[1].value);
    if (!isNaN(day) && !isNaN(value)) {
      bills.push({ day, value });
    }
  }

  return { mainIncomeDay, mainIncomeValue, additionalIncomes, bills };
}

function calculate() {
  const { mainIncomeDay, mainIncomeValue, additionalIncomes, bills } = parseInputs();

  if (isNaN(mainIncomeDay) || isNaN(mainIncomeValue)) {
    alert('Por favor, preencha o dia e valor do rendimento principal.');
    return null;
  }

  // Total incomes
  let totalIncomes = mainIncomeValue;
  for (const income of additionalIncomes) {
    totalIncomes += income.value;
  }

  // Total debts
  let totalDebts = 0;
  for (const bill of bills) {
    totalDebts += bill.value;
  }

  // Balance
  const balance = totalIncomes - totalDebts;

  return { mainIncomeDay, mainIncomeValue, additionalIncomes, bills, totalIncomes, totalDebts, balance };
}

function generatePaymentPlan(data) {
  // Sort incomes and bills by day ascending
  const incomesSorted = [{ day: data.mainIncomeDay, value: data.mainIncomeValue }, ...data.additionalIncomes].sort((a, b) => a.day - b.day);
  const billsSorted = data.bills.slice().sort((a, b) => a.day - b.day);

  let availableBalance = 0;
  let incomeIndex = 0;
  let paymentPlan = [];

  for (const bill of billsSorted) {
    // Add incomes received before or on bill day
    while (incomeIndex < incomesSorted.length && incomesSorted[incomeIndex].day <= bill.day) {
      availableBalance += incomesSorted[incomeIndex].value;
      incomeIndex++;
    }
    if (availableBalance >= bill.value) {
      paymentPlan.push({ billDay: bill.day, billValue: bill.value, status: 'Pago' });
      availableBalance -= bill.value;
    } else {
      paymentPlan.push({ billDay: bill.day, billValue: bill.value, status: 'Não Pago' });
    }
  }

  return paymentPlan;
}

function generateImprovementSuggestions(balance) {
  if (balance < 0) {
    return 'Seu saldo está negativo. Considere reduzir despesas, negociar prazos ou buscar rendimentos extras.';
  } else if (balance === 0) {
    return 'Seu saldo está zerado. Tente economizar para criar uma reserva financeira.';
  } else {
    return 'Seu saldo está positivo. Considere investir ou guardar parte do valor para emergências.';
  }
}

calculateBtn.addEventListener('click', () => {
  const data = calculate();
  if (!data) return;

  totalDebtsSpan.textContent = data.totalDebts.toFixed(2);
  totalIncomesSpan.textContent = data.totalIncomes.toFixed(2);
  balanceSpan.textContent = data.balance.toFixed(2);

  if (data.balance > 0) {
    balanceStatus.textContent = 'Saldo positivo';
    balanceStatus.className = 'font-semibold mt-2 text-green-600';
  } else if (data.balance < 0) {
    balanceStatus.textContent = 'Saldo negativo';
    balanceStatus.className = 'font-semibold mt-2 text-red-600';
  } else {
    balanceStatus.textContent = 'Saldo zerado';
    balanceStatus.className = 'font-semibold mt-2 text-yellow-600';
  }

  // Payment suggestions
  const paymentPlan = generatePaymentPlan(data);
  paymentSuggestions.innerHTML = '<h4 class="font-semibold mb-2">Sugestões de Pagamento:</h4>';
  const ul = document.createElement('ul');
  ul.className = 'list-disc list-inside';
  for (const plan of paymentPlan) {
    const li = document.createElement('li');
    li.textContent = `Conta com vencimento no dia ${plan.billDay}: R$ ${plan.billValue.toFixed(2)} - ${plan.status}`;
    li.className = plan.status === 'Pago' ? 'text-green-700' : 'text-red-700';
    ul.appendChild(li);
  }
  paymentSuggestions.appendChild(ul);

  // Improvement suggestions
  improvementSuggestions.textContent = generateImprovementSuggestions(data.balance);

  resultsSection.classList.remove('hidden');
});

// Saving and loading data
const saveBtn = document.getElementById('saveBtn');
const saveNameInput = document.getElementById('saveName');

function getSavedData() {
  const saved = localStorage.getItem('debtManagerData');
  return saved ? JSON.parse(saved) : [];
}

function saveData(data) {
  const saved = getSavedData();
  saved.push(data);
  localStorage.setItem('debtManagerData', JSON.stringify(saved));
}

saveBtn.addEventListener('click', () => {
  const data = calculate();
  if (!data) return;

  const saveName = saveNameInput.value.trim();
  if (!saveName) {
    alert('Por favor, informe um nome para salvar os dados.');
    return;
  }

  const dataToSave = {
    id: Date.now(),
    name: saveName,
    mainIncomeDay: data.mainIncomeDay,
    mainIncomeValue: data.mainIncomeValue,
    additionalIncomes: data.additionalIncomes,
    bills: data.bills,
    totalIncomes: data.totalIncomes,
    totalDebts: data.totalDebts,
    balance: data.balance,
    savedAt: new Date().toISOString()
  };

  saveData(dataToSave);
  alert('Dados salvos com sucesso!');
  saveNameInput.value = '';
  clearForm();
});

function clearForm() {
  document.getElementById('mainIncomeDay').value = '';
  document.getElementById('mainIncomeValue').value = '';
  additionalIncomesList.innerHTML = '';
  billsList.innerHTML = '';
  addIncomeBtn.click();
  addBillBtn.click();
  resultsSection.classList.add('hidden');
}

// Saved data tab
const savedDataList = document.getElementById('savedDataList');
const savedDataDetails = document.getElementById('savedDataDetails');
const savedDetailsContent = document.getElementById('savedDetailsContent');
const deleteAllBtn = document.getElementById('deleteAllBtn');

function loadSavedDataList() {
  savedDataList.innerHTML = '';
  const saved = getSavedData();
  if (saved.length === 0) {
    savedDataList.innerHTML = '<p class="text-gray-600">Nenhum dado salvo.</p>';
    savedDataDetails.classList.add('hidden');
    return;
  }

  saved.forEach(item => {
    const li = document.createElement('li');
    li.className = 'bg-white p-4 rounded shadow flex justify-between items-center cursor-pointer hover:bg-gray-100';
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-pressed', 'false');

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<strong>${item.name}</strong><br/>
      Total Dívidas: R$ ${item.totalDebts.toFixed(2)} | Total Rendimentos: R$ ${item.totalIncomes.toFixed(2)} | Saldo: R$ ${item.balance.toFixed(2)}`;
    li.appendChild(infoDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ml-4 text-red-600 hover:text-red-800 focus:outline-none';
    deleteBtn.title = 'Excluir este dado';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Excluir "${item.name}"?`)) {
        deleteSavedData(item.id);
      }
    });

    li.appendChild(deleteBtn);

    li.addEventListener('click', () => {
      showSavedDetails(item);
    });

    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showSavedDetails(item);
      }
    });

    savedDataList.appendChild(li);
  });

  savedDataDetails.classList.add('hidden');
}

function showSavedDetails(item) {
  savedDetailsContent.innerHTML = `
    <p><strong>Nome:</strong> ${item.name}</p>
    <p><strong>Rendimento Principal:</strong> Dia ${item.mainIncomeDay} - R$ ${item.mainIncomeValue.toFixed(2)}</p>
    <p><strong>Outros Rendimentos:</strong></p>
    <ul class="list-disc list-inside mb-2">
      ${item.additionalIncomes.map(i => `<li>Dia ${i.day} - R$ ${i.value.toFixed(2)}</li>`).join('')}
    </ul>
    <p><strong>Contas a Pagar:</strong></p>
    <ul class="list-disc list-inside mb-2">
      ${item.bills.map(b => `<li>Vencimento dia ${b.day} - R$ ${b.value.toFixed(2)}</li>`).join('')}
    </ul>
    <p><strong>Total de Rendimentos:</strong> R$ ${item.totalIncomes.toFixed(2)}</p>
    <p><strong>Total de Dívidas:</strong> R$ ${item.totalDebts.toFixed(2)}</p>
    <p><strong>Saldo:</strong> R$ ${item.balance.toFixed(2)}</p>
    <p><strong>Salvo em:</strong> ${new Date(item.savedAt).toLocaleString('pt-BR')}</p>
  `;
  savedDataDetails.classList.remove('hidden');
}

function deleteSavedData(id) {
  let saved = getSavedData();
  saved = saved.filter(item => item.id !== id);
  localStorage.setItem('debtManagerData', JSON.stringify(saved));
  loadSavedDataList();
  savedDataDetails.classList.add('hidden');
}

deleteAllBtn.addEventListener('click', () => {
  if (confirm('Deseja realmente excluir todos os dados salvos?')) {
    localStorage.removeItem('debtManagerData');
    loadSavedDataList();
    savedDataDetails.classList.add('hidden');
  }
});

function clearSavedDetails() {
  savedDataDetails.classList.add('hidden');
  savedDetailsContent.innerHTML = '';
}
