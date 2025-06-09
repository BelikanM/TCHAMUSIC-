import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaMusic, FaTimes } from 'react-icons/fa';

const LoginModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };

  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    onClick: onClose
  }, 
    React.createElement('div', {
      style: {
        background: 'linear-gradient(145deg, #181818, #282828)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        border: '1px solid rgba(29, 185, 84, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      },
      onClick: (e) => e.stopPropagation()
    }, [
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        style: {
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          color: '#b3b3b3',
          cursor: 'pointer',
          fontSize: '20px'
        }
      }, React.createElement(FaTimes)),

      React.createElement('div', {
        key: 'icon',
        style: {
          marginBottom: '24px',
          color: '#1db954'
        }
      }, React.createElement(FaMusic, { size: 48 })),

      React.createElement('h2', {
        key: 'title',
        style: {
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#ffffff'
        }
      }, 'Connexion à TchaMusic'),

      React.createElement('p', {
        key: 'subtitle',
        style: {
          color: '#b3b3b3',
          marginBottom: '32px',
          fontSize: '16px'
        }
      }, 'Connectez-vous pour uploader et gérer votre musique'),

      React.createElement('button', {
        key: 'google-btn',
        onClick: handleGoogleLogin,
        style: {
          width: '100%',
          padding: '16px',
          backgroundColor: '#1db954',
          color: '#000000',
          border: 'none',
          borderRadius: '50px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          transition: 'all 0.3s ease'
        }
      }, [
        React.createElement(FaGoogle, { key: 'icon', size: 20 }),
        'Continuer avec Google'
      ])
    ])
  );
};

export default LoginModal;
