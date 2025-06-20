import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Navbar.module.css'; 

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/">Home</Link>
        </li>
        {user ? (
          <>
            <li>
              <span className={styles.welcomeText}>
                Welcome, {user.username}
              </span>
            </li>
            <li>
              <button onClick={logout} className={styles.logoutButton}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Sign up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
