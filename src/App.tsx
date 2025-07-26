import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


const recordSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num > 0, { message: 'Amount must be positive' }),
  category: z.enum(['Income', 'Expense'], { required_error: 'Select category' }),
  date: z.string().min(1, { message: 'Date is required' }),
});

const targetSchema = z.object({
  target: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num > 0, { message: 'Target must be positive' }),
});

const transferSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num > 0, { message: 'Transfer must be positive' }),
});

type RecordItem = z.infer<typeof recordSchema> & { id: number };

type TargetForm = z.infer<typeof targetSchema>;
type TransferForm = z.infer<typeof transferSchema>;

const App: React.FC = () => {
  const [records, setRecords] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem('records-data');
    return saved ? JSON.parse(saved) : [];
  });

  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('target-savings');
    return saved ? JSON.parse(saved) : 0;
  });

  const [currentsavings, setCurrentsavings] = useState(() => {
    const saved = localStorage.getItem('current-savings');
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('records-data', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('target-savings', JSON.stringify(target));
  }, [target]);

  useEffect(() => {
    localStorage.setItem('current-savings', JSON.stringify(currentsavings));
  }, [currentsavings]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(recordSchema) });

  const {
    register: registerTarget,
    handleSubmit: handleSubmitTarget,
    formState: { errors: errorsTarget },
    reset: resetTarget,
  } = useForm<TargetForm>({ resolver: zodResolver(targetSchema) });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    formState: { errors: errorsTransfer },
    reset: resetTransfer,
  } = useForm<TransferForm>({ resolver: zodResolver(transferSchema) });

  const onRecordSubmit = (data: z.infer<typeof recordSchema>) => {
    const newRecord = { ...data, id: Date.now() };
    setRecords([...records, newRecord]);
    reset();
  };

  const onTargetSubmit = (data: TargetForm) => {
    setTarget(data.target);
    resetTarget();
  };

  const onTransferSubmit = (data: TransferForm) => {
    setCurrentsavings((prev) => prev + data.amount);
    resetTransfer();
  };

  const handleDelete = (id: number) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleResetSavings = () => {
    setCurrentsavings(0);
  };

  const total = records.reduce(
    (sum, rec) => (rec.category === 'Expense' ? sum - rec.amount : sum + rec.amount),
    0
  );
  const netTotal = total - currentsavings;
  const progress = (currentsavings / (target || 1)) * 100;
  const clampedProgress = Math.min(progress, 130);

  return (
    <div className="App">
      <h1>Income & Expense Tracker</h1>

      <form onSubmit={handleSubmit(onRecordSubmit)}>
        <input {...register('name')} placeholder="Name" />
        {errors.name && <p>{errors.name.message}</p>}

        <input type="number" {...register('amount')} placeholder="Amount" />
        {errors.amount && <p>{errors.amount.message}</p>}

        <select {...register('category')} defaultValue="">
          <option value="" disabled>
            Select Category
          </option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        {errors.category && <p>{errors.category.message}</p>}

        <input type="date" {...register('date')} />
        {errors.date && <p>{errors.date.message}</p>}

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
                <button onClick={() => handleDelete(rec.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <strong>Total (after savings):</strong>{' '}
        <span style={{ color: netTotal < 0 ? 'red' : 'green' }}>
          ${netTotal.toFixed(2)}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <form onSubmit={handleSubmitTransfer(onTransferSubmit)}>
            <input type="number" placeholder="Transfer amount" {...registerTransfer('amount')} />
            {errorsTransfer.amount && <p>{errorsTransfer.amount.message}</p>}
            <button type="submit">Transfer</button>
          </form>
        </div>

        <div style={{ textAlign: 'left', flex: 1 }}>
          <form onSubmit={handleSubmitTarget(onTargetSubmit)}>
            <input type="number" placeholder="Target savings" {...registerTarget('target')} />
            {errorsTarget.target && <p>{errorsTarget.target.message}</p>}
            <button type="submit">Set Target</button>
            <button type="button" onClick={() => setTarget(0)}>Reset Target</button>
          </form>
          <p><strong>Target:</strong> {target}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <strong>Current Savings:</strong> {currentsavings} <button onClick={handleResetSavings}>Reset Savings</button>
      </div>

      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '5px',
          height: '20px',
          width: '300px',
          marginTop: '20px',
          marginLeft: 'auto',
          marginRight: '0',
          textAlign: 'center',
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

      <p style={{ textAlign: 'center', marginRight: '0' }}>{Math.floor(progress)}% of target</p>
    </div>
  );
};

export default App;
