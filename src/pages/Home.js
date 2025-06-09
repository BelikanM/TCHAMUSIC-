import React, { useState, useEffect } from 'react';
import { getAllSongs, getAllArtists } from '../lib/appwriteClient';
import { FaPlay, FaHeart, FaUser, FaFire, FaStar, FaHeadphones } from 'react-icons/fa';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [songsData, artistsData] = await Promise.all([
          getAllSongs(12),
          getAllArtists(8)
        ]);
        setSongs(songsData);
        setArtists(artistsData);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        fontSize: '18px',
        color: '#b3b3b3'
      }
    }, [
      React.createElement('div', {
        key: 'spinner',
        style: {
          width: '40px',
          height: '40px',
          border: '4px solid #282828',
          borderTop: '4px solid #1db954',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }
      }),
      React.createElement('span', {
        key: 'text',
        style: { marginLeft: '16px' }
      }, 'Chargement de votre musique...')
    ]);
  }

  return React.createElement('div', {
    className: 'container',
    style: { paddingTop: '20px', paddingBottom: '40px' }
  }, [
    // Hero Section
    React.createElement('section', {
      key: 'hero',
      className: 'fade-in-up',
      style: {
        background: 'linear-gradient(135deg, #1db954 0%, #1ed760 50%, #fbbf24 100%)',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }
    }, [
      React.createElement('div', {
        key: 'hero-content',
        style: { position: 'relative', zIndex: 2 }
      }, [
        React.createElement('h1', {
          key: 'title',
          style: {
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: '900',
            marginBottom: '20px',
            color: '#000000',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }
        }, '🎵 Bienvenue sur TchaMusic'),

        React.createElement('p', {
          key: 'subtitle',
          style: {
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            marginBottom: '30px',
            color: '#000000',
            opacity: 0.8,
            maxWidth: '600px',
            margin: '0 auto 30px'
          }
        }, 'Découvrez, partagez et écoutez la meilleure musique du monde entier'),

        React.createElement('div', {
          key: 'stats',
          style: {
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            marginTop: '30px'
          }
        }, [
          React.createElement('div', {
            key: 'songs-stat',
            style: { textAlign: 'center' }
          }, [
            React.createElement('div', {
              key: 'number',
              style: {
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#000000'
              }
            }, songs.length),
            React.createElement('div', {
              key: 'label',
              style: {
                fontSize: '14px',
                color: '#000000',
                opacity: 0.7
              }
            }, 'Chansons')
          ]),

          React.createElement('div', {
            key: 'artists-stat',
            style: { textAlign: 'center' }
          }, [
            React.createElement('div', {
              key: 'number',
              style: {
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#000000'
              }
            }, artists.length),
            React.createElement('div', {
              key: 'label',
              style: {
                fontSize: '14px',
                color: '#000000',
                opacity: 0.7
              }
            }, 'Artistes')
          ])
        ])
      ])
    ]),

    // Quick Actions
    React.createElement('section', {
      key: 'quick-actions',
      style: { marginBottom: '40px' }
    }, [
      React.createElement('div', {
        key: 'actions-grid',
        className: 'grid grid-2 md:grid-4',
        style: { gap: '16px' }
      }, [
        React.createElement('div', {
          key: 'trending',
          className: 'card card-green',
          style: {
            textAlign: 'center',
            cursor: 'pointer',
            padding: '24px'
          }
        }, [
          React.createElement(FaFire, {
            key: 'icon',
            size: 32,
            style: { marginBottom: '12px', color: '#000000' }
          }),
          React.createElement('h3', {
            key: 'title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, 'Tendances')
        ]),

        React.createElement('div', {
          key: 'top-rated',
          className: 'card card-yellow',
          style: {
            textAlign: 'center',
            cursor: 'pointer',
            padding: '24px'
          }
        }, [
          React.createElement(FaStar, {
            key: 'icon',
            size: 32,
            style: { marginBottom: '12px', color: '#000000' }
          }),
          React.createElement('h3', {
            key: 'title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, 'Top Rated')
        ]),

        React.createElement('div', {
          key: 'new-releases',
          className: 'card card-blue',
          style: {
            textAlign: 'center',
            cursor: 'pointer',
            padding: '24px'
          }
        }, [
          React.createElement(FaHeadphones, {
            key: 'icon',
            size: 32,
            style: { marginBottom: '12px', color: '#ffffff' }
          }),
          React.createElement('h3', {
            key: 'title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff'
            }
          }, 'Nouveautés')
        ]),

        React.createElement('div', {
          key: 'favorites',
          className: 'card card-purple',
          style: {
            textAlign: 'center',
            cursor: 'pointer',
            padding: '24px'
          }
        }, [
          React.createElement(FaHeart, {
            key: 'icon',
            size: 32,
            style: { marginBottom: '12px', color: '#ffffff' }
          }),
          React.createElement('h3', {
            key: 'title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff'
            }
          }, 'Favoris')
        ])
      ])
    ]),

    // Artists Section
    React.createElement('section', {
      key: 'artists',
      style: { marginBottom: '40px' }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: {
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      }, [
        React.createElement('span', { key: 'emoji' }, '🎤'),
        'Artistes Populaires'
      ]),

      React.createElement('div', {
        key: 'artists-grid',
        className: 'grid grid-2 md:grid-4',
        style: { gap: '20px' }
      }, artists.map((artist, index) => 
        React.createElement('div', {
          key: artist.$id,
          className: `card fade-in-up`,
          style: {
            textAlign: 'center',
            cursor: 'pointer',
            padding: '24px',
            animationDelay: `${index * 0.1}s`
          }
        }, [
          React.createElement('div', {
            key: 'avatar',
            style: {
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(45deg, #1db954, #1ed760)`,
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(29, 185, 84, 0.3)'
            }
          }, React.createElement(FaUser, { size: 32, color: '#000000' })),

          React.createElement('h3', {
            key: 'name',
            style: {
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#ffffff'
            }
          }, artist.name),

          React.createElement('p', {
            key: 'listeners',
            style: {
              color: '#b3b3b3',
              fontSize: '14px',
              marginBottom: '12px'
            }
          }, `${artist.monthlyListeners || Math.floor(Math.random() * 10000)} auditeurs/mois`),

          artist.verified && React.createElement('span', {
            key: 'verified',
            style: {
              backgroundColor: '#1db954',
              color: '#000000',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          }, '✓ Vérifié')
        ])
      ))
    ]),

    // Songs Section
    React.createElement('section', {
      key: 'songs'
    }, [
      React.createElement('h2', {
        key: 'title',
        style: {
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      }, [
        React.createElement('span', { key: 'emoji' }, '🎶'),
        'Dernières Chansons'
      ]),

      React.createElement('div', {
        key: 'songs-grid',
        className: 'grid grid-1 md:grid-2 lg:grid-3',
        style: { gap: '16px' }
      }, songs.map((song, index) => 
        React.createElement('div', {
          key: song.$id,
          className: 'card fade-in-up',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            padding: '16px',
            animationDelay: `${index * 0.05}s`
          }
        }, [
          React.createElement('div', {
            key: 'cover',
            style: {
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: `linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #1db954)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }
          }, React.createElement(FaPlay, { size: 20, color: '#ffffff' })),

          React.createElement('div', {
            key: 'info',
            style: { flex: 1, minWidth: 0 }
          }, [
            React.createElement('h4', {
              key: 'title',
              style: {
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }, song.title),

            React.createElement('p', {
              key: 'artist',
              style: {
                color: '#b3b3b3',
                fontSize: '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }, song.artistId),

            song.genre && React.createElement('span', {
              key: 'genre',
              style: {
                backgroundColor: 'rgba(29, 185, 84, 0.2)',
                color: '#1db954',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                marginTop: '4px',
                display: 'inline-block'
              }
            }, song.genre)
          ]),

          React.createElement('div', {
            key: 'actions',
            style: {
              display: 'flex',
              gap: '8px',
              flexShrink: 0
            }
          }, [
            React.createElement('button', {
              key: 'play',
              className: 'btn-primary',
              style: {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }
            }, React.createElement(FaPlay, { size: 14 })),

            React.createElement('button', {
              key: 'like',
              style: {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: '2px solid #ef4444',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }
            }, React.createElement(FaHeart, { size: 14 }))
          ])
        ])
      ))
    ])
  ]);
};

export default Home;
