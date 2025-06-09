import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { FaComments, FaPaperPlane, FaUser, FaSmile, FaImage, FaMicrophone } from 'react-icons/fa';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'TchaBeat',
      message: 'Salut tout le monde ! 🎵 Nouveau son en préparation !',
      time: '14:30',
      isOwn: false,
      avatar: 'https://ui-avatars.com/api/?name=TchaBeat&background=1db954&color=000'
    },
    {
      id: 2,
      user: 'MusicLover',
      message: 'Hey ! Quelqu\'un a écouté le dernier album de Jazz Fusion ?',
      time: '14:32',
      isOwn: false,
      avatar: 'https://ui-avatars.com/api/?name=MusicLover&background=fbbf24&color=000'
    },
    {
      id: 3,
      user: 'BeatMaker',
      message: 'J\'adore cette communauté ! 🔥',
      time: '14:35',
      isOwn: false,
      avatar: 'https://ui-avatars.com/api/?name=BeatMaker&background=8b5cf6&color=fff'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: user.name,
        message: newMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        avatar: user.prefs?.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=1db954&color=000`
      };
      setMessages([...messages, message]);
      setNewMessage('');

      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate a response
        const responses = [
          'Super message ! 👍',
          'Totalement d\'accord !',
          'Merci pour le partage ! 🎵',
          'Excellente découverte !',
          'J\'adore cette chanson aussi !'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const botMessage = {
          id: Date.now() + 1,
          user: 'CommunityBot',
          message: randomResponse,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          avatar: 'https://ui-avatars.com/api/?name=Bot&background=ef4444&color=fff'
        };
        setMessages(prev => [...prev, botMessage]);
      }, 2000);
    }
  };

  return React.createElement('div', {
    className: 'container',
    style: {
      paddingTop: '20px',
      paddingBottom: '20px',
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'fade-in-up',
      style: {
        textAlign: 'center',
        marginBottom: '24px'
      }
    }, [
      React.createElement('div', {
        key: 'icon-container',
        style: {
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
        }
      }, React.createElement(FaComments, { size: 28, color: '#ffffff' })),

      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '8px'
        }
      }, 'Chat Communauté'),

      React.createElement('p', {
        key: 'subtitle',
        style: {
          color: '#b3b3b3',
          fontSize: '14px'
        }
      }, `${messages.length} messages • ${user ? 'Connecté' : 'Hors ligne'}`)
    ]),

    // Chat Container
    React.createElement('div', {
      key: 'chat-container',
      className: 'card',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '0',
        minHeight: '400px'
      }
    }, [
      // Messages Area
      React.createElement('div', {
        key: 'messages',
        style: {
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '500px'
        }
      }, [
        ...messages.map(msg => 
          React.createElement('div', {
            key: msg.id,
            className: 'fade-in-up',
            style: {
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              flexDirection: msg.isOwn ? 'row-reverse' : 'row',
              animationDelay: '0s'
            }
          }, [
            React.createElement('img', {
              key: 'avatar',
              src: msg.avatar,
              alt: msg.user,
              style: {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                flexShrink: 0,
                border: `2px solid ${msg.isOwn ? '#1db954' : '#404040'}`
              }
            }),

            React.createElement('div', {
              key: 'content',
              style: {
                maxWidth: '70%',
                textAlign: msg.isOwn ? 'right' : 'left'
              }
            }, [
              React.createElement('div', {
                key: 'user-time',
                style: {
                  fontSize: '12px',
                  color: '#b3b3b3',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: msg.isOwn ? 'flex-end' : 'flex-start'
                }
              }, [
                React.createElement('span', { key: 'user' }, msg.user),
                React.createElement('span', { key: 'time' }, msg.time)
              ]),

              React.createElement('div', {
                key: 'message',
                style: {
                  backgroundColor: msg.isOwn ? '#1db954' : '#404040',
                  color: msg.isOwn ? '#000000' : '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }
              }, msg.message)
            ])
          ])
        ),

        // Typing Indicator
        isTyping && React.createElement('div', {
          key: 'typing',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            opacity: 0.7
          }
        }, [
          React.createElement('div', {
            key: 'avatar',
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#404040',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }, React.createElement(FaUser, { size: 12, color: '#b3b3b3' })),

          React.createElement('div', {
            key: 'dots',
            style: {
              backgroundColor: '#404040',
              padding: '8px 12px',
              borderRadius: '12px',
              color: '#b3b3b3',
              fontSize: '12px'
            }
          }, 'En train d\'écrire...')
        ]),

        React.createElement('div', { key: 'scroll-anchor', ref: messagesEndRef })
      ]),

      // Input Area
      React.createElement('div', {
        key: 'input-area',
        style: {
          padding: '20px',
          borderTop: '1px solid #404040',
          backgroundColor: '#1a1a1a'
        }
      }, [
        React.createElement('form', {
          key: 'input-form',
          onSubmit: sendMessage,
          style: {
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }
        }, [
          React.createElement('div', {
            key: 'input-container',
            style: {
              flex: 1,
              position: 'relative'
            }
          }, [
            React.createElement('input', {
              key: 'input',
              type: 'text',
              value: newMessage,
              onChange: (e) => setNewMessage(e.target.value),
              placeholder: user ? 'Tapez votre message...' : 'Connectez-vous pour chatter',
              disabled: !user,
              style: {
                width: '100%',
                padding: '12px 50px 12px 16px',
                backgroundColor: '#282828',
                border: '2px solid #404040',
                borderRadius: '24px',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }
            }),

            React.createElement('div', {
              key: 'input-actions',
              style: {
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: '4px'
              }
            }, [
              React.createElement('button', {
                key: 'emoji',
                type: 'button',
                style: {
                  background: 'none',
                  border: 'none',
                  color: '#b3b3b3',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%'
                }
              }, React.createElement(FaSmile, { size: 16 }))
            ])
          ]),

          React.createElement('button', {
            key: 'send',
            type: 'submit',
            disabled: !user || !newMessage.trim(),
            style: {
              backgroundColor: (!user || !newMessage.trim()) ? '#404040' : '#1db954',
              color: (!user || !newMessage.trim()) ? '#b3b3b3' : '#000000',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!user || !newMessage.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }
          }, React.createElement(FaPaperPlane, { size: 16 }))
        ])
      ])
    ]),

    React.createElement(LoginModal, {
      key: 'login-modal',
      isOpen: showLoginModal,
      onClose: () => setShowLoginModal(false)
    })
  ]);
};

export default Chat;
