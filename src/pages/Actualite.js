import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaClock, FaEye, FaFire, FaComment, FaShare } from 'react-icons/fa';

const Actualite = () => {
  const [news, setNews] = useState([
    {
      id: 1,
      title: "TchaMusic lance sa nouvelle interface utilisateur",
      content: "Découvrez notre nouvelle interface inspirée de Spotify avec des couleurs vibrantes et une expérience utilisateur améliorée. Cette mise à jour apporte de nombreuses fonctionnalités demandées par la communauté...",
      date: "2024-01-15",
      views: 2450,
      comments: 34,
      category: "Plateforme",
      featured: true,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Nouveau single de l'artiste TchaBeat fait sensation",
      content: "Le dernier titre de TchaBeat cartonne sur la plateforme avec plus de 50 000 écoutes en 24h. Un mélange parfait de hip-hop moderne et de sonorités africaines traditionnelles...",
      date: "2024-01-14",
      views: 1890,
      comments: 67,
      category: "Musique",
      featured: false
    },
    {
      id: 3,
      title: "TchaMusic atteint 25 000 utilisateurs actifs !",
      content: "Une étape importante franchie grâce à votre soutien. Nous continuons d'améliorer la plateforme pour offrir la meilleure expérience musicale possible...",
      date: "2024-01-13",
      views: 3200,
      comments: 128,
      category: "Communauté",
      featured: false
    },
    {
      id: 4,
      title: "Nouvelle fonctionnalité : Playlists collaboratives",
      content: "Créez et partagez des playlists avec vos amis ! Cette nouvelle fonctionnalité permet de créer des playlists à plusieurs et de découvrir de nouveaux sons ensemble...",
      date: "2024-01-12",
      views: 1567,
      comments: 45,
      category: "Fonctionnalités",
      featured: false
    }
  ]);

  const getCategoryColor = (category) => {
    const colors = {
      'Plateforme': '#1db954',
      'Musique': '#fbbf24',
      'Communauté': '#8b5cf6',
      'Fonctionnalités': '#1e3a8a'
    };
    return colors[category] || '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return React.createElement('div', {
    className: 'container',
    style: { paddingTop: '20px', paddingBottom: '40px' }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'fade-in-up',
      style: {
        textAlign: 'center',
        marginBottom: '40px'
      }
    }, [
      React.createElement('div', {
        key: 'icon-container',
        style: {
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)'
        }
      }, React.createElement(FaNewspaper, { size: 36, color: '#000000' })),

      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '12px'
        }
      }, 'Actualités TchaMusic'),

      React.createElement('p', {
        key: 'subtitle',
        style: {
          color: '#b3b3b3',
          fontSize: '16px',
          maxWidth: '500px',
          margin: '0 auto'
        }
      }, 'Restez informé des dernières nouveautés et mises à jour de la plateforme')
    ]),

    // Featured Article
    news.filter(article => article.featured).map(article => 
      React.createElement('article', {
        key: `featured-${article.id}`,
        className: 'card fade-in-up',
        style: {
          marginBottom: '40px',
          padding: '0',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #282828, #1a1a1a)'
        }
      }, [
        React.createElement('div', {
          key: 'featured-content',
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0'
          },
          className: 'md:grid-cols-2'
        }, [
          React.createElement('div', {
            key: 'image',
            style: {
              height: '250px',
              background: `linear-gradient(45deg, ${getCategoryColor(article.category)}, #1db954)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }
          }, [
            React.createElement('div', {
              key: 'featured-badge',
              style: {
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }
            }, [
              React.createElement(FaFire, { key: 'icon', size: 12 }),
              'À LA UNE'
            ]),
            React.createElement(FaNewspaper, { size: 64, color: 'rgba(255,255,255,0.3)' })
          ]),

          React.createElement('div', {
            key: 'content',
            style: { padding: '32px' }
          }, [
            React.createElement('div', {
              key: 'meta',
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }
            }, [
              React.createElement('span', {
                key: 'category',
                style: {
                  backgroundColor: getCategoryColor(article.category),
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }
              }, article.category),

              React.createElement('div', {
                key: 'date',
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#b3b3b3',
                  fontSize: '14px'
                }
              }, [
                React.createElement(FaClock, { key: 'icon', size: 12 }),
                formatDate(article.date)
              ])
            ]),

            React.createElement('h2', {
              key: 'title',
              style: {
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#ffffff',
                lineHeight: '1.3'
              }
            }, article.title),

            React.createElement('p', {
              key: 'excerpt',
              style: {
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#b3b3b3',
                marginBottom: '20px'
              }
            }, article.content.substring(0, 150) + '...'),

            React.createElement('div', {
              key: 'stats',
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '20px'
              }
            }, [
              React.createElement('div', {
                key: 'views',
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#b3b3b3',
                  fontSize: '14px'
                }
              }, [
                React.createElement(FaEye, { key: 'icon', size: 12 }),
                `${article.views} vues`
              ]),

              React.createElement('div', {
                key: 'comments',
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#b3b3b3',
                  fontSize: '14px'
                }
              }, [
                React.createElement(FaComment, { key: 'icon', size: 12 }),
                `${article.comments} commentaires`
              ])
            ]),

            React.createElement('button', {
              key: 'read-more',
              className: 'btn-primary',
              style: {
                padding: '12px 24px',
                borderRadius: '50px'
              }
            }, 'Lire l\'article complet')
          ])
        ])
      ])
    ),

    // Regular Articles Grid
    React.createElement('div', {
      key: 'articles-grid',
      className: 'grid grid-1 md:grid-2 lg:grid-3',
      style: { gap: '24px' }
    }, news.filter(article => !article.featured).map((article, index) => 
      React.createElement('article', {
        key: article.id,
        className: 'card fade-in-up',
        style: {
          cursor: 'pointer',
          animationDelay: `${index * 0.1}s`,
          transition: 'all 0.3s ease'
        }
      }, [
        React.createElement('div', {
          key: 'article-image',
          style: {
            height: '180px',
            background: `linear-gradient(45deg, ${getCategoryColor(article.category)}, #1db954)`,
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, React.createElement(FaNewspaper, { size: 48, color: 'rgba(255,255,255,0.3)' })),

        React.createElement('div', {
          key: 'meta',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }
        }, [
          React.createElement('span', {
            key: 'category',
            style: {
              backgroundColor: getCategoryColor(article.category),
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold'
            }
          }, article.category),

          React.createElement('div', {
            key: 'date',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#b3b3b3',
              fontSize: '12px'
            }
          }, [
            React.createElement(FaClock, { key: 'icon', size: 10 }),
            formatDate(article.date)
          ])
        ]),

        React.createElement('h3', {
          key: 'title',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#ffffff',
            lineHeight: '1.4'
          }
        }, article.title),

        React.createElement('p', {
          key: 'excerpt',
          style: {
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#b3b3b3',
            marginBottom: '16px'
          }
        }, article.content.substring(0, 100) + '...'),

        React.createElement('div', {
          key: 'stats',
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid #404040'
          }
        }, [
          React.createElement('div', {
            key: 'engagement',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }
          }, [
            React.createElement('div', {
              key: 'views',
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#b3b3b3',
                fontSize: '12px'
              }
            }, [
              React.createElement(FaEye, { key: 'icon', size: 10 }),
              article.views
            ]),

            React.createElement('div', {
              key: 'comments',
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#b3b3b3',
                fontSize: '12px'
              }
            }, [
              React.createElement(FaComment, { key: 'icon', size: 10 }),
              article.comments
            ])
          ]),

          React.createElement('button', {
            key: 'share',
            style: {
              background: 'none',
              border: 'none',
              color: '#1db954',
              cursor: 'pointer',
              padding: '4px'
            }
          }, React.createElement(FaShare, { size: 14 }))
        ])
      ])
    ))
  ]);
};

export default Actualite;
