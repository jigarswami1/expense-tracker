
function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);
}

async function refresh() {
  const rowsEl = document.getElementById('rows');
  rowsEl.innerHTML = '';
  const txns = await getAllTxns();

  // summary
  const month = new Date().toISOString().slice(0,7); // YYYY-MM
  let income = 0, expense = 0;
  txns.forEach(t => {
    if ((t.date || '').startsWith(month)) {
      if (t.type === 'income') income += Number(t.amount || 0);
      else expense += Number(t.amount || 0);
    }
  });
  document.getElementById('incomeTotal').textContent = formatINR(income);
  document.getElementById('expenseTotal').textContent = formatINR(expense);
  document.getElementById('monthlyTotal').textContent = formatINR(income - expense);

  // table
  txns.sort((a,b) => (a.date||'').localeCompare(b.date||''));
  txns.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.date || ''}</td>
      <td>${t.type || ''}</td>
      <td>${t.category || ''}</td>
      <td>${formatINR(t.amount)}</td>
      <td>${t.notes || ''}</td>
      <td>
        <button data-id="${t.id}" class="del">Delete</button>
      </td>`;
    rowsEl.appendChild(tr);
  });

  document.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteTxn(Number(btn.dataset.id));
      refresh();
    });
  });
}

document.getElementById('addBtn').addEventListener('click', async () => {
  const date = document.getElementById('date').value || new Date().toISOString().slice(0,10);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value.trim() || 'General';
  const amount = Number(document.getElementById('amount').value);
  const notes = document.getElementById('notes').value.trim();
  if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
  await addTxn({ date, type, category, amount, notes });
  document.getElementById('amount').value = '';
  document.getElementById('notes').value = '';
  refresh();
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  const data = await getAllTxns();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'expense_data.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('Invalid JSON format');
    await replaceAllTxns(data);
    refresh();
  } catch (err) {
    alert('Import failed: ' + err.message);
  } finally {
    e.target.value = '';
  }
});

refresh();
