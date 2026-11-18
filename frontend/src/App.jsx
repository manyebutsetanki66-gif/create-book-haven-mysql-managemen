/*
 * App.jsx - the route table.
 * Logged-out users can only open /login. Books and Dashboard are open to every
 * logged-in user, Transactions needs staff (administrator or librarian) and Users
 * needs an administrator. The backend repeats every check, so hiding a link is
 * never the only protection.
 */
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Users from './pages/Users.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute roles={['administrator', 'librarian']}><Transactions /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['administrator']}><Users /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
