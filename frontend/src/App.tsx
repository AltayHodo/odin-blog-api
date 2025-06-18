import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PostPage from './pages/PostPage';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';

function App() {
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(process.env.REACT_APP_API_URL + '/posts');
      const json = await data.json();
      console.log(json);
    };
    fetchData();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/post/:id" element={<PostPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
