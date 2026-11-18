import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { roleLabel } from '../utils/format.js';

export default function Navbar() {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!user) return null; // no navbar on the login page

  // The search box in the navbar opens the Books page with the search word filled in.
  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/books?search=${encodeURIComponent(term)}` : '/books');
    setQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        <i className="fa-solid fa-book-open" aria-hidden="true" />
        <span>Book Haven</span>
      </NavLink>

      <form className="search-form" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Search books..."
          aria-label="Search books"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" aria-label="Search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /></button>
      </form>

      <nav className="nav-links" aria-label="Main">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>
        {isStaff && <NavLink to="/transactions">Transactions</NavLink>}
        {isAdmin && <NavLink to="/users">Users</NavLink>}
      </nav>

      <div className="nav-user">
        <span className="nav-user-name">{user.name}<small>{roleLabel(user.role)}</small></span>
        <button className="btn btn-secondary btn-small" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
