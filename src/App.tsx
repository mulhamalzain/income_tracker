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
  const [records, setRecords] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem('records-data');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('form-data');
    return saved
      ? JSON.parse(saved)
      : { name: '', amount: '', category: '', date: '' };
  });

  // 🔁 Keep records saved
  useEffect(() => {
    localStorage.setItem('records-data', JSON.stringify(records));
  }, [records]);

  // 🔁 Keep form inputs saved
  useEffect(() => {
    localStorage.setItem('form-data', JSON.stringify(form));
  }, [form]);

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

  const total = records.reduce(
    (sum, rec) =>
      rec.category === 'Expense' ? sum - rec.amount : sum + rec.amount,
    0
  );

  return (
    <div className="App">
      <h1>Income & Expense Tracker</h1>

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

      <div>
        <strong>Total:</strong>{' '}
        <span style={{ color: total < 0 ? 'red' : 'green' }}>
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default App;
