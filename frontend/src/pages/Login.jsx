import { Navigate, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />; // already logged in

  const handleLogin = async (membershipId, password) => {
    await login(membershipId, password);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-intro">
        <span className="login-logo"><i className="fa-solid fa-book-open" aria-hidden="true" /></span>
        <h1>Book Haven</h1>
        <p>Library Management System. Log in with your membership ID.</p>
      </div>
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
