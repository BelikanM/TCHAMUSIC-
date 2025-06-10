import React, { useState, useEffect } from 'react';
import { 
  getAllSongs, 
  getAllArtists, 
  getFilePreview,
  getCurrentUser
} from '../lib/appwriteClient';
import { 
  FaMusic, 
  FaClock, 
  FaComment,
  FaChevronRight,
  FaPlay,
  FaExpand
} from 'react-icons/fa';
import SongEditor from './SongEditor';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [songsData, artistsData, user] = await Promise.all([
        getAllSongs(20),
        getAllArtists(10),
        getCurrentUser()
      ]);
      setSongs(songsData);
      setArtists(artistsData);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSongEditor = (song) => {
    setSelectedSong(song);
    setEditorOpen(true);
  };

  const closeSongEditor = () => {
    setEditorOpen(false);
    setTimeout(() => {
      setSelectedSong(null);
    }, 300);
  };

  const handleSongUpdate = (updatedSong) => {
    setSongs(prev => prev.map(song => 
      song.$id === updatedSong.$id ? updatedSong : song
    ));
    setSelectedSong(updatedSong);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
      }, 'Chargement des œuvres...')
    ]);
  }

  return React.createElement('div', {
    className: 'container',
    style: { 
      paddingTop: '20px', 
      paddingBottom: '40px',
      position: 'relative'
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'fade-in-up',
      style: {
        background: 'linear-gradient(135deg, #1db954 0%, #1ed760 50%, #fbbf24 100%)',
        borderRadius: '20px',
        padding: '40px 30px',
        textAlign: 'center',
        marginBottom: '30px'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '900',
          marginBottom: '16px',
          color: '#000000'
        }
      }, '🎵 Éditeur d\'Œuvres'),

      React.createElement('p', {
        key: 'subtitle',
        style: {
          fontSize: '16px',
          color: '#000000',
          opacity: 0.8,
          marginBottom: '20px'
        }
      }, 'Annotez, éditez et enrichissez vos créations musicales'),

      React.createElement('div', {
        key: 'stats',
        style: {
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }
      }, [
        React.createElement('div', {
          key: 'songs-stat',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', {
            key: 'number',
            style: { fontSize: '24px', fontWeight: 'bold', color: '#000000' }
          }, songs.length),
          React.createElement('div', {
            key: 'label',
            style: { fontSize: '12px', color: '#000000', opacity: 0.7 }
          }, 'Œuvres')
        ]),

        React.createElement('div', {
          key: 'artists-stat',
          style: { textAlign: 'center' }
        }, [
          React.createElement('div', {
            key: 'number',
            style: { fontSize: '24px', fontWeight: 'bold', color: '#000000' }
          }, artists.length),
          React.createElement('div', {
            key: 'label',
            style: { fontSize: '12px', color: '#000000', opacity: 0.7 }
          }, 'Artistes')
        ])
      ])
    ]),

    // Liste des chansons
    React.createElement('div', {
      key: 'songs-list',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h2', {
        key: 'list-title',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      }, [
        React.createElement(FaMusic, { key: 'icon', size: 20 }),
        'Vos Œuvres'
      ]),

      React.createElement('div', {
        key: 'songs-grid',
        style: { 
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }
      }, songs.map((song, index) => 
        React.createElement('div', {
          key: song.$id,
          className: 'card fade-in-up',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            padding: '20px',
            animationDelay: `${index * 0.05}s`,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          },
          onClick: () => openSongEditor(song),
          onMouseEnter: (e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.3)';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }, [
          // Cover image avec contrôles
          React.createElement('div', {
            key: 'cover',
            style: {
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              background: song.coverImage ? 
                `url(${getFilePreview(song.coverImage, 80, 80)}) center/cover` :
                `linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #1db954)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative'
            }
          }, [
            !song.coverImage && React.createElement(FaMusic, { 
              key: 'music-icon',
              size: 24, 
              color: '#ffffff' 
            }),
            
            // Overlay avec contrôles
            React.createElement('div', {
              key: 'play-overlay',
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              onMouseEnter: (e) => e.target.style.opacity = 1,
              onMouseLeave: (e) => e.target.style.opacity = 0
            }, [
              React.createElement('div', {
                key: 'controls',
                style: {
                  display: 'flex',
                  gap: '8px'
                }
              }, [
                React.createElement('button', {
                  key: 'play',
                  style: {
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1db954',
                    border: 'none',
                    color: '#000000',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  },
                  onClick: (e) => {
                    e.stopPropagation();
                    // Logique de lecture
                  }
                }, React.createElement(FaPlay, { size: 10 })),
                
                React.createElement('button', {
                  key: 'expand',
                  style: {
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }, React.createElement(FaExpand, { size: 10 }))
              ])
            ])
          ]),

          // Info
          React.createElement('div', {
            key: 'info',
            style: { flex: 1, minWidth: 0 }
          }, [
            React.createElement('h4', {
              key: 'title',
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '6px',
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
                marginBottom: '10px'
              }
            }, song.artistId),

            React.createElement('div', {
              key: 'metadata',
              style: {
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }
            }, [
              song.genre && React.createElement('span', {
                key: 'genre',
                style: {
                  backgroundColor: 'rgba(29, 185, 84, 0.2)',
                  color: '#1db954',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }
              }, song.genre),

              React.createElement('span', {
                key: 'duration',
                style: {
                  color: '#b3b3b3',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, [
                React.createElement(FaClock, { key: 'icon', size: 10 }),
                formatDuration(song.duration || 0)
              ]),

              song.annotations && song.annotations.length > 0 && React.createElement('span', {
                key: 'annotations',
                style: {
                  color: '#fbbf24',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, [
                React.createElement(FaComment, { key: 'icon', size: 10 }),
                `${song.annotations.length}`
              ])
            ])
          ]),

          // Flèche d'ouverture
          React.createElement('div', {
            key: 'arrow',
            style: {
              color: '#1db954',
              transition: 'transform 0.3s ease'
            }
          }, React.createElement(FaChevronRight, { size: 16 }))
        ])
      ))
    ]),

    // Composant SongEditor
    React.createElement(SongEditor, {
      key: 'song-editor',
      song: selectedSong,
      isOpen: editorOpen,
      onClose: closeSongEditor,
      onSave: handleSongUpdate,
      currentUser: currentUser
    })
  ]);
};

export default Home;

