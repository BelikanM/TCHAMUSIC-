import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Actualite from './pages/Actualite';
import Chat from './pages/Chat';

function App() {
  return React.createElement(AuthProvider, null,
    React.createElement(Router, null, [
      React.createElement('div', {
        key: 'app',
        style: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #000000 100%)'
        }
      }, [
        React.createElement(Navbar, { key: 'navbar' }),
        React.createElement('main', {
          key: 'main'
        }, 
          React.createElement(Routes, null, [
            React.createElement(Route, {
              key: 'home',
              path: '/',
              element: React.createElement(Home)
            }),
            React.createElement(Route, {
              key: 'upload',
              path: '/upload',
              element: React.createElement(Upload)
            }),
            React.createElement(Route, {
              key: 'actualite',
              path: '/actualite',
              element: React.createElement(Actualite)
            }),
            React.createElement(Route, {
              key: 'chat',
              path: '/chat',
              element: React.createElement(Chat)
            })
          ])
        )
      ])
    ])
  );
}

export default App;
