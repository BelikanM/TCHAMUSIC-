import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { FaUpload, FaNewspaper, FaComments, FaMusic, FaHome, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#1db954' : 'transparent',
    color: isActive ? '#000000' : '#ffffff',
    fontSize: '14px'
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return React.createElement('nav', {
    style: {
      background: 'linear-gradient(90deg, #000000 0%, #121212 100%)',
      padding: '16px 0',
      boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(29, 185, 84, 0.2)'
    }
  }, [
    React.createElement('div', {
      key: 'container',
      className: 'container',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, [
      // Logo
      React.createElement('div', {
        key: 'logo',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1db954'
        }
      }, [
        React.createElement(FaMusic, { key: 'icon', size: 32 }),
        React.createElement('span', {
          key: 'text',
          style: {
            background: 'linear-gradient(45deg, #1db954, #1ed760)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '28px'
          }
        }, 'TchaMusic')
      ]),

      // Desktop Navigation
      React.createElement('div', {
        key: 'desktop-nav',
        style: {
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        },
        className: 'hidden md:flex'
      }, [
        React.createElement(NavLink, {
          key: 'home',
          to: '/',
          style: navLinkStyle
        }, [
          React.createElement(FaHome, { key: 'icon', size: 16 }),
          'Accueil'
        ]),

        React.createElement(NavLink, {
          key: 'upload',
          to: '/upload',
          style: navLinkStyle
        }, [
          React.createElement(FaUpload, { key: 'icon', size: 16 }),
          'Upload'
        ]),

        React.createElement(NavLink, {
          key: 'actualite',
          to: '/actualite',
          style: navLinkStyle
        }, [
          React.createElement(FaNewspaper, { key: 'icon', size: 16 }),
          'Actualité'
        ]),

        React.createElement(NavLink, {
          key: 'chat',
          to: '/chat',
          style: navLinkStyle
        }, [
          React.createElement(FaComments, { key: 'icon', size: 16 }),
          'Chat'
        ])
      ]),

      // User Section
      React.createElement('div', {
        key: 'user-section',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      }, [
        user ? React.createElement('div', {
          key: 'user-info',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, [
          React.createElement('img', {
            key: 'avatar',
            src: user.prefs?.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=1db954&color=000`,
            alt: user.name,
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #1db954'
            }
          }),
          React.createElement('span', {
            key: 'name',
            style: {
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500'
            },
            className: 'hidden md:block'
          }, user.name),
          React.createElement('button', {
            key: 'logout',
            onClick: logout,
            style: {
              background: 'none',
              border: 'none',
              color: '#b3b3b3',
              cursor: 'pointer',
              padding: '8px'
            }
          }, React.createElement(FaSignOutAlt, { size: 16 }))
        ]) : React.createElement('button', {
          key: 'login',
          onClick: () => setShowLoginModal(true),
          style: {
            backgroundColor: '#1db954',
            color: '#000000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '50px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px'
          }
        }, 'Se connecter'),

        // Mobile Menu Button
        React.createElement('button', {
          key: 'mobile-menu',
          onClick: toggleMobileMenu,
          style: {
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '8px'
          },
          className: 'md:hidden'
        }, React.createElement(mobileMenuOpen ? FaTimes : FaBars, { size: 20 }))
      ])
    ]),

    // Mobile Menu
    mobileMenuOpen && React.createElement('div', {
      key: 'mobile-menu',
      style: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, #121212 0%, #000000 100%)',
        padding: '20px',
        borderTop: '1px solid rgba(29, 185, 84, 0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      },
      className: 'md:hidden'
    }, [
      React.createElement(NavLink, {
        key: 'home-mobile',
        to: '/',
        style: { ...navLinkStyle({ isActive: false }), marginBottom: '8px' },
        onClick: () => setMobileMenuOpen(false)
      }, [
        React.createElement(FaHome, { key: 'icon', size: 16 }),
        'Accueil'
      ]),

      React.createElement(NavLink, {
        key: 'upload-mobile',
        to: '/upload',
        style: { ...navLinkStyle({ isActive: false }), marginBottom: '8px' },
        onClick: () => setMobileMenuOpen(false)
      }, [
        React.createElement(FaUpload, { key: 'icon', size: 16 }),
        'Upload'
      ]),

      React.createElement(NavLink, {
        key: 'actualite-mobile',
        to: '/actualite',
        style: { ...navLinkStyle({ isActive: false }), marginBottom: '8px' },
        onClick: () => setMobileMenuOpen(false)
      }, [
        React.createElement(FaNewspaper, { key: 'icon', size: 16 }),
        'Actualité'
      ]),

      React.createElement(NavLink, {
        key: 'chat-mobile',
        to: '/chat',
        style: navLinkStyle({ isActive: false }),
        onClick: () => setMobileMenuOpen(false)
      }, [
        React.createElement(FaComments, { key: 'icon', size: 16 }),
        'Chat'
      ])
    ]),

    React.createElement(LoginModal, {
      key: 'login-modal',
      isOpen: showLoginModal,
      onClose: () => setShowLoginModal(false)
    })
  ]);
};

export default Navbar;
