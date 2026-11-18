/*
 * Transactions - record borrowing or stock arrival, and see the history.
 * After every transaction we reload books (fresh stock numbers) and the history.
 */
import { useState } from 'react';
import { getBooks, getUsers, getTransactions } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';

// Defined outside the component so the function stays the same between renders.
const loadAll = async () => {
  const [books, users, transactions] = await Promise.all([getBooks(), getUsers(), getTransactions()]);
  return { books, users, transactions };
};
const INITIAL = { books: [], users: [], transactions: [] };

export default function Transactions() {
  const { data, loading, error, reload } = useAsync(loadAll, INITIAL);
  const [notice, setNotice] = useState(null);

  const handleRecorded = async (t) => {
    const text = t.type === 'BORROW'
      ? `${t.user_name} borrowed ${t.quantity} x "${t.book_title}".`
      : `Received ${t.quantity} x "${t.book_title}" into stock.`;
    setNotice({ type: 'success', text });
    await reload();
  };

  return (
    <>
      <Alert type={notice?.type} message={notice?.text} onClose={() => setNotice(null)} />
      <Alert message={error} />

      {loading ? <Loader text="Loading transactions..." /> : (
        <>
          <section className="form-card">
            <h2>New transaction</h2>
            <TransactionForm books={data.books} users={data.users} onRecorded={handleRecorded} />
          </section>

          <section className="section-card">
            <div className="section-header"><h2>Transaction history</h2></div>
            <TransactionList transactions={data.transactions} />
          </section>
        </>
      )}
    </>
  );
}
