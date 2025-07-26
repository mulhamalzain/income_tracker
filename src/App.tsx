import React, { useState, useEffect } from 'react';

type RecordItem = {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
};

const categories = ['Income', 'Expense'];

const App: React.FC = () => {
  // Records
  const [records, setRecords] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem('records-data');
    return saved ? JSON.parse(saved) : [];
  });

  // Form
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('form-data');
    return saved
      ? JSON.parse(saved)
      : { name: '', amount: '', category: '', date: '' };
  });

  // Target and Savings (persisted)
  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('target-savings');
    return saved ? JSON.parse(saved) : 0;
  });

  const [currentsavings, setCurrentsavings] = useState(() => {
    const saved = localStorage.getItem('current-savings');
    return saved ? JSON.parse(saved) : 0;
  });

  const [amoutToTransfer, setAmountToTransfer] = useState('');

  // Auto-save records and form
  useEffect(() => {
    localStorage.setItem('records-data', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('form-data', JSON.stringify(form));
  }, [form]);

  // Auto-save target and savings
  useEffect(() => {
    localStorage.setItem('target-savings', JSON.stringify(target));
  }, [target]);

  useEffect(() => {
    localStorage.setItem('current-savings', JSON.stringify(currentsavings));
  }, [currentsavings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: RecordItem = {
      id: Date.now(),
      name: form.name,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
    };
    setRecords([...records, newRecord]);
    setForm({ name: '', amount: '', category: '', date: '' });
    localStorage.removeItem('form-data');
  };

  const handleDelete = (id: number) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleEdit = (id: number) => {
    const record = records.find((r) => r.id === id);
    if (record) {
      setForm({
        name: record.name,
        amount: record.amount.toString(),
        category: record.category,
        date: record.date,
      });
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amoutToTransfer);
    if (!isNaN(amount) && amount > 0) {
      setCurrentsavings((prev) => prev + amount);
      setAmountToTransfer('');
    }
  };

  const total = records.reduce(
    (sum, rec) =>
      rec.category === 'Expense' ? sum - rec.amount : sum + rec.amount,
    0
  );

  const netTotal = total - currentsavings;

  const progress = (currentsavings / (target || 1)) * 100;
  const clampedProgress = Math.min(progress, 130);

  return (
    <div className="App">
      <h1>Income & Expense Tracker</h1>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          placeholder="Income/Expense Name"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="amount"
          value={form.amount}
          placeholder="Income/Expense Amount"
          onChange={handleChange}
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Income or Expense
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <button type="submit">Add</button>
      </form>

      {/* Records Table */}
      <div className="expense-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>{rec.name}</td>
                <td>${rec.amount.toFixed(2)}</td>
                <td>{rec.category}</td>
                <td>{rec.date}</td>
                <td>
                  <button onClick={() => handleEdit(rec.id)}>Edit</button>
                  <button onClick={() => handleDelete(rec.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Net Total */}
      <div>
        <strong>Total:</strong>{' '}
        <span style={{ color: netTotal < 0 ? 'red' : 'green' }}>
          ${netTotal.toFixed(2)}
        </span>
      </div>

      {/* Target Savings Form */}
      <form
        className="target_savings"
        onSubmit={(e) => {
          e.preventDefault();
          const value = e.target.elements['target savings'].value;
          setTarget(Number(value));
        }}
      >
        <input
          type="number"
          name="target savings"
          placeholder="Target savings"
        />
        <button type="button" onClick={() => setTarget(0)}>
          Reset Target
        </button>
      </form>

      {/* Target and Current Savings */}
      <div className="Target">
        <strong>Target:</strong> <span>{target}</span>
      </div>
      <div className="current_savings">
        <strong>Current savings:</strong> <span>{currentsavings}</span>
      </div>

      {/* Transfer Form */}
      <form
        onSubmit={handleTransfer}
        className="transfer_to_savings_account"
      >
        <span className="strong">
          <strong>Transfer to Savings Account:</strong>
        </span>
        <input
          type="number"
          name="transfer_to_savings_account"
          placeholder="Transfer"
          value={amoutToTransfer}
          onChange={(e) => setAmountToTransfer(e.target.value)}
        />
        <button>Transfer</button>
      </form>

      {/* Progress Bar */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '5px',
          height: '20px',
          width: '300px',
          marginTop: '20px',
          marginLeft: 'auto',
          marginRight: '0',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedProgress}%`,
            backgroundColor: progress >= 100 ? '#2196f3' : '#4caf50',
            borderRadius: '5px',
            transition: 'width 0.5s ease',
          }}
        ></div>
      </div>
      <p style={{ textAlign: 'right', marginRight: '0' }}>
        {Math.floor(progress)}% of target
      </p>
    </div>
  );
};

export default App;
