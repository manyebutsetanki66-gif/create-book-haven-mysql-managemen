/*
 * Dashboard - statistics calculated by the backend from real database records.
 * Books with fewer than two available copies are highlighted.
 */
import { getDashboard } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { useAuth } from '../context/AuthContext.jsx';
import { roleLabel } from '../utils/format.js';
import StatCard from '../components/StatCard.jsx';
import BookList from '../components/BookList.jsx';
import TransactionList from '../components/TransactionList.jsx';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useAsync(getDashboard, null);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <section className="welcome-card">
        <div>
          <h1>Welcome back, {user.name}</h1>
          <p>{roleLabel(user.role)} account</p>
        </div>
        <span className="welcome-date">{today}</span>
      </section>

      <Alert message={error} />
      {loading && <Loader text="Loading dashboard..." />}

      {data && (
        <>
          <section className="dashboard-cards" aria-label="Library statistics">
            <StatCard icon="fa-book" label="Registered books" value={data.totalBooks} />
            <StatCard icon="fa-layer-group" label="Available copies" value={data.totalAvailableCopies} />
            <StatCard icon="fa-users" label="Registered users" value={data.totalUsers} />
            <StatCard
              icon="fa-triangle-exclamation"
              label="Low stock books"
              value={data.lowStockCount}
              tone={data.lowStockCount > 0 ? 'warning' : ''}
            />
          </section>

          <section className="section-card">
            <div className="section-header">
              <h2>Low stock books</h2>
              <span className="section-hint">Fewer than {data.lowStockLimit} copies available</span>
            </div>
            {data.lowStockBooks.length === 0
              ? <p className="empty-state">All books are well stocked.</p>
              : <BookList books={data.lowStockBooks} />}
          </section>

          {data.recentTransactions && (
            <section className="section-card">
              <div className="section-header"><h2>Recent transactions</h2></div>
              <TransactionList transactions={data.recentTransactions} showRecorder={false} />
            </section>
          )}
        </>
      )}
    </>
  );
}
