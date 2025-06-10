import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllSongs, 
  getAllArtists, 
  getFileView, 
  getFilePreview,
  updateSong,
  uploadImage,
  getCurrentUser,
  getSongById,
  createSong
} from '../lib/appwriteClient';
import { 
  FaEdit, 
  FaImage, 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaMusic, 
  FaUser, 
  FaTag, 
  FaClock, 
  FaCalendar,
  FaFileAudio,
  FaInfoCircle,
  FaUpload,
  FaTimes,
  FaEye,
  FaComment,
  FaStar,
  FaHeart,
  FaChevronRight,
  FaExpand
} from 'react-icons/fa';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // États pour l'édition
  const [editData, setEditData] = useState({
    title: '',
    genre: '',
    description: '',
    lyrics: '',
    releaseDate: '',
    duration: 0,
    explicit: false,
    tags: [],
    credits: {
      producer: '',
      composer: '',
      lyricist: '',
      studio: ''
    },
    annotations: [],
    coverImage: null
  });

  const fileInputRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [drawerOpen]);

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

  const selectSong = async (song) => {
    setSelectedSong(song);
    setEditData({
      title: song.title || '',
      genre: song.genre || '',
      description: song.description || '',
      lyrics: song.lyrics || '',
      releaseDate: song.releaseDate || '',
      duration: song.duration || 0,
      explicit: song.explicit || false,
      tags: song.tags || [],
      credits: song.credits || {
        producer: '',
        composer: '',
        lyricist: '',
        studio: ''
      },
      annotations: song.annotations || [],
      coverImage: song.coverImage || null
    });
    setAnnotations(song.annotations || []);
    setEditMode(false);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedSong(null);
      setEditMode(false);
    }, 300);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setEditData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addTag = (tag) => {
    if (tag && !editData.tags.includes(tag)) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAnnotation = () => {
    if (newAnnotation.trim()) {
      const annotation = {
        id: Date.now(),
        text: newAnnotation,
        timestamp: new Date().toISOString(),
        author: currentUser?.name || 'Anonyme'
      };
      
      const updatedAnnotations = [...annotations, annotation];
      setAnnotations(updatedAnnotations);
      setEditData(prev => ({
        ...prev,
        annotations: updatedAnnotations
      }));
      setNewAnnotation('');
    }
  };

  const removeAnnotation = (annotationId) => {
    const updatedAnnotations = annotations.filter(ann => ann.id !== annotationId);
    setAnnotations(updatedAnnotations);
    setEditData(prev => ({
      ...prev,
      annotations: updatedAnnotations
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedFile = await uploadImage(file, currentUser?.$id);
      
      // Mettre à jour immédiatement l'état avec la nouvelle image
      setEditData(prev => ({
        ...prev,
        coverImage: uploadedFile.$id
      }));
      
      console.log('Image uploadée:', uploadedFile.$id);
      alert('Image uploadée avec succès !');
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveSong = async () => {
    if (!selectedSong || !currentUser) return;

    try {
      setSaving(true);
      
      const updateData = {
        ...editData,
        updatedAt: new Date().toISOString(),
        lastEditedBy: currentUser.$id
      };

      await updateSong(selectedSong.$id, updateData);
      
      setSongs(prev => prev.map(song => 
        song.$id === selectedSong.$id 
          ? { ...song, ...updateData }
          : song
      ));
      
      setSelectedSong({ ...selectedSong, ...updateData });
      setEditMode(false);
      alert('Modifications sauvegardées !');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour obtenir l'URL de l'image avec gestion d'erreur
  const getImageUrl = (imageId, width = 400, height = 300) => {
    if (!imageId) return null;
    try {
      return getFilePreview(imageId, width, height);
    } catch (error) {
      console.error('Erreur getImageUrl:', error);
      return null;
    }
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
    // Input file caché
    React.createElement('input', {
      key: 'file-input',
      ref: fileInputRef,
      type: 'file',
      accept: 'image/*',
      style: { display: 'none' },
      onChange: handleImageUpload
    }),

    // Contenu principal
    React.createElement('div', {
      key: 'main-content',
      style: {
        transition: 'all 0.3s ease',
        transform: drawerOpen ? 'translateX(-20px)' : 'translateX(0)',
        opacity: drawerOpen ? 0.7 : 1
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
            onClick: () => selectSong(song),
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.3)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }, [
            // Cover image
            React.createElement('div', {
              key: 'cover',
              style: {
                width: '70px',
                height: '70px',
                borderRadius: '12px',
                background: song.coverImage ? 
                  `url(${getImageUrl(song.coverImage, 70, 70)}) center/cover` :
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
              React.createElement('div', {
                key: 'play-overlay',
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }
              }, React.createElement(FaExpand, { size: 16, color: '#ffffff' }))
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
      ])
    ]),

    // Overlay du tiroir
    drawerOpen && React.createElement('div', {
      key: 'drawer-overlay',
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        opacity: drawerOpen ? 1 : 0,
        transition: 'opacity 0.3s ease'
      },
      onClick: closeDrawer
    }),

    // Tiroir d'édition
    selectedSong && React.createElement('div', {
      key: 'edit-drawer',
      ref: drawerRef,
      style: {
        position: 'fixed',
        top: 0,
        right: drawerOpen ? 0 : '-600px',
        width: '600px',
        height: '100vh',
        backgroundColor: '#181818',
        borderLeft: '1px solid #404040',
        zIndex: 1001,
        transition: 'right 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }
    }, [
      // Header du tiroir
      React.createElement('div', {
        key: 'drawer-header',
        style: {
          padding: '20px 24px',
          borderBottom: '1px solid #404040',
          backgroundColor: '#1f1f1f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }
      }, [
        React.createElement('div', {
          key: 'header-info',
          style: { flex: 1 }
        }, [
          React.createElement('h3', {
            key: 'title',
            style: {
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaInfoCircle, { key: 'icon', size: 16 }),
            editMode ? 'Édition' : 'Détails'
          ]),

          React.createElement('p', {
            key: 'song-title',
            style: {
              color: '#b3b3b3',
              fontSize: '14px',
              margin: 0
            }
          }, selectedSong.title)
        ]),

        React.createElement('div', {
          key: 'header-actions',
          style: { display: 'flex', gap: '8px', alignItems: 'center' }
        }, [
          React.createElement('button', {
            key: 'edit-toggle',
            onClick: toggleEditMode,
            style: {
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: editMode ? '#ef4444' : '#1db954',
              border: 'none',
              color: editMode ? '#ffffff' : '#000000',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }
          }, editMode ? 'Annuler' : 'Éditer'),

          editMode && React.createElement('button', {
            key: 'save',
            onClick: saveSong,
            disabled: saving,
            style: {
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: '#fbbf24',
              border: 'none',
              color: '#000000',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }
          }, saving ? 'Sauvegarde...' : 'Sauvegarder'),

          React.createElement('button', {
            key: 'close',
            onClick: closeDrawer,
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: '1px solid #404040',
              color: '#b3b3b3',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            },
            onMouseEnter: (e) => {
              e.target.style.backgroundColor = '#404040';
              e.target.style.color = '#ffffff';
            },
            onMouseLeave: (e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#b3b3b3';
            }
          }, React.createElement(FaTimes, { size: 14 }))
        ])
      ]),

      // Contenu scrollable du tiroir
      React.createElement('div', {
        key: 'drawer-content',
        style: {
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }
      }, [
        // Image de couverture
        React.createElement('div', {
          key: 'cover-section',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('label', {
            key: 'cover-label',
            style: {
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '8px'
            }
          }, 'Image de couverture'),

          React.createElement('div', {
            key: 'cover-container',
            style: {
              width: '100%',
              height: '200px',
              borderRadius: '12px',
              background: editData.coverImage ? 
                `url(${getImageUrl(editData.coverImage, 600, 200)}) center/cover` :
                'linear-gradient(45deg, #1db954, #1ed760)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '2px dashed #404040'
            }
          }, [
            !editData.coverImage && React.createElement(FaImage, { 
              key: 'placeholder', 
              size: 48, 
              color: 'rgba(255,255,255,0.3)' 
            }),

            editMode && React.createElement('div', {
              key: 'overlay',
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
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              onClick: () => fileInputRef.current?.click(),
              onMouseEnter: (e) => e.target.style.opacity = 1,
              onMouseLeave: (e) => e.target.style.opacity = 0
            }, [
              React.createElement('div', {
                key: 'upload-button',
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ffffff'
                }
              }, [
                React.createElement(FaUpload, { key: 'icon', size: 24 }),
                React.createElement('span', { 
                  key: 'text',
                  style: { fontSize: '14px', fontWeight: 'bold' }
                }, uploadingImage ? 'Upload...' : 'Changer l\'image')
              ])
            ])
          ])
        ]),

        // Informations générales
        React.createElement('div', {
          key: 'general-info',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h4', {
            key: 'section-title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaTag, { key: 'icon', size: 14 }),
            'Informations générales'
          ]),

          // Titre
          React.createElement('div', {
            key: 'title-field',
            style: { marginBottom: '16px' }
          }, [
            React.createElement('label', {
              key: 'label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#b3b3b3',
                marginBottom: '4px'
              }
            }, 'Titre'),

            editMode ? 
              React.createElement('input', {
                key: 'input',
                type: 'text',
                value: editData.title,
                onChange: (e) => handleInputChange('title', e.target.value),
                style: {
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #404040',
                  backgroundColor: '#ffffff', // ← CHANGÉ pour fond blanc
                  color: '#000000', // ← CHANGÉ pour texte noir
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                },
                onFocus: (e) => {
                  e.target.style.borderColor = '#1db954';
                  e.target.style.backgroundColor = '#ffffff';
                },
                onBlur: (e) => {
                  e.target.style.borderColor = '#404040';
                }
              }) :
              React.createElement('p', {
                key: 'value',
                style: {
                  color: '#ffffff',
                  fontSize: '14px',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  margin: 0
                }
              }, selectedSong.title)
          ]),

          // Genre
          React.createElement('div', {
            key: 'genre-field',
            style: { marginBottom: '16px' }
          }, [
            React.createElement('label', {
              key: 'label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#b3b3b3',
                marginBottom: '4px'
              }
            }, 'Genre'),

            editMode ? 
              React.createElement('select', {
                key: 'select',
                value: editData.genre,
                onChange: (e) => handleInputChange('genre', e.target.value),
                style: {
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #404040',
                  backgroundColor: '#ffffff', // ← CHANGÉ pour fond blanc
                  color: '#000000', // ← CHANGÉ pour texte noir
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                },
                onFocus: (e) => {
                  e.target.style.borderColor = '#1db954';
                },
                onBlur: (e) => {
                  e.target.style.borderColor = '#404040';
                }
              }, [
                             React.createElement('div', {
                key: 'value',
                style: {
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px'
                }
              }, selectedSong.genre ? 
                React.createElement('span', {
                  style: {
                    backgroundColor: 'rgba(29, 185, 84, 0.2)',
                    color: '#1db954',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }
                }, selectedSong.genre) :
                React.createElement('span', {
                  style: {
                    color: '#b3b3b3',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }
                }, 'Non défini')
              )
          ]),

          // Description
          React.createElement('div', {
            key: 'description-field'
          }, [
            React.createElement('label', {
              key: 'label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#b3b3b3',
                marginBottom: '4px'
              }
            }, 'Description'),

            editMode ? 
              React.createElement('textarea', {
                key: 'textarea',
                value: editData.description,
                onChange: (e) => handleInputChange('description', e.target.value),
                rows: 4,
                style: {
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #404040',
                  backgroundColor: '#ffffff', // ← Fond blanc
                  color: '#000000', // ← Texte noir
                  fontSize: '14px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  fontFamily: 'inherit'
                },
                onFocus: (e) => {
                  e.target.style.borderColor = '#1db954';
                },
                onBlur: (e) => {
                  e.target.style.borderColor = '#404040';
                }
              }) :
              React.createElement('p', {
                key: 'value',
                style: {
                  color: selectedSong.description ? '#ffffff' : '#b3b3b3',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontStyle: selectedSong.description ? 'normal' : 'italic',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  margin: 0
                }
              }, selectedSong.description || 'Aucune description')
          ])
        ]),

        // Crédits
        React.createElement('div', {
          key: 'credits-section',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h4', {
            key: 'section-title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaUser, { key: 'icon', size: 14 }),
            'Crédits'
          ]),

          ['producer', 'composer', 'lyricist', 'studio'].map(credit =>
            React.createElement('div', {
              key: credit,
              style: { marginBottom: '12px' }
            }, [
              React.createElement('label', {
                key: 'label',
                style: {
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#b3b3b3',
                  marginBottom: '4px'
                }
              }, credit.charAt(0).toUpperCase() + credit.slice(1)),

              editMode ? 
                React.createElement('input', {
                  key: 'input',
                  type: 'text',
                  value: editData.credits[credit] || '',
                  onChange: (e) => handleInputChange(credit, e.target.value, 'credits'),
                  style: {
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '2px solid #404040',
                    backgroundColor: '#ffffff', // ← Fond blanc
                    color: '#000000', // ← Texte noir
                    fontSize: '12px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  },
                  onFocus: (e) => {
                    e.target.style.borderColor = '#1db954';
                  },
                  onBlur: (e) => {
                    e.target.style.borderColor = '#404040';
                  }
                }) :
                React.createElement('p', {
                  key: 'value',
                  style: {
                    color: '#ffffff',
                    fontSize: '12px',
                    fontStyle: selectedSong.credits?.[credit] ? 'normal' : 'italic',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    margin: 0
                  }
                }, selectedSong.credits?.[credit] || 'Non renseigné')
            ])
          )
        ]),

        // Tags section
        React.createElement('div', {
          key: 'tags-section',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h4', {
            key: 'section-title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaTag, { key: 'icon', size: 14 }),
            'Tags'
          ]),

          // Affichage des tags
          React.createElement('div', {
            key: 'tags-display',
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: editMode ? '12px' : '0'
            }
          }, editData.tags.length > 0 ? 
            editData.tags.map(tag => 
              React.createElement('span', {
                key: tag,
                style: {
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  color: '#fbbf24',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, [
                React.createElement('span', { key: 'text' }, `#${tag}`),
                editMode && React.createElement('button', {
                  key: 'remove',
                  onClick: () => removeTag(tag),
                  style: {
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    padding: '0',
                    marginLeft: '4px'
                  }
                }, React.createElement(FaTimes, { size: 8 }))
              ])
            ) :
            React.createElement('span', {
              key: 'no-tags',
              style: {
                color: '#b3b3b3',
                fontSize: '12px',
                fontStyle: 'italic'
              }
            }, 'Aucun tag')
          ),

          // Ajouter des tags (mode édition)
          editMode && React.createElement('div', {
            key: 'add-tags',
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }
          }, [
            'Populaire', 'Nouveau', 'Collaboration', 'Live', 'Remix', 'Instrumental', 'Radio Edit', 'Explicit'
          ].filter(tag => !editData.tags.includes(tag)).map(tag =>
            React.createElement('button', {
              key: tag,
              onClick: () => addTag(tag),
              style: {
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #404040',
                color: '#b3b3b3',
                cursor: 'pointer',
                fontSize: '10px',
                transition: 'all 0.2s ease'
              },
              onMouseEnter: (e) => {
                e.target.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
                e.target.style.borderColor = '#fbbf24';
                e.target.style.color = '#fbbf24';
              },
              onMouseLeave: (e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#404040';
                e.target.style.color = '#b3b3b3';
              }
            }, `+ ${tag}`)
          ))
        ]),

        // Annotations
        React.createElement('div', {
          key: 'annotations-section',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h4', {
            key: 'section-title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaComment, { key: 'icon', size: 14 }),
            `Annotations (${annotations.length})`
          ]),

          // Ajouter une annotation
          editMode && React.createElement('div', {
            key: 'add-annotation',
            style: {
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }
          }, [
            React.createElement('input', {
              key: 'input',
              type: 'text',
              value: newAnnotation,
              onChange: (e) => setNewAnnotation(e.target.value),
              placeholder: 'Ajouter une note...',
              style: {
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: '2px solid #404040',
                backgroundColor: '#ffffff', // ← Fond blanc
                color: '#000000', // ← Texte noir
                fontSize: '12px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              },
              onFocus: (e) => {
                e.target.style.borderColor = '#1db954';
              },
              onBlur: (e) => {
                e.target.style.borderColor = '#404040';
              },
              onKeyPress: (e) => e.key === 'Enter' && addAnnotation()
            }),

            React.createElement('button', {
              key: 'add-btn',
              onClick: addAnnotation,
              disabled: !newAnnotation.trim(),
              style: {
                padding: '8px 12px',
                borderRadius: '20px',
                backgroundColor: newAnnotation.trim() ? '#1db954' : '#404040',
                border: 'none',
                color: newAnnotation.trim() ? '#000000' : '#b3b3b3',
                cursor: newAnnotation.trim() ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, React.createElement(FaPlus, { size: 10 }))
          ]),

          // Liste des annotations
          React.createElement('div', {
            key: 'annotations-list',
            style: {
              maxHeight: '200px',
              overflow: 'auto'
            }
          }, annotations.length > 0 ? 
            annotations.map(annotation => 
              React.createElement('div', {
                key: annotation.id,
                style: {
                  backgroundColor: 'rgba(29, 185, 84, 0.1)',
                  border: '1px solid rgba(29, 185, 84, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }
              }, [
                React.createElement('div', {
                  key: 'annotation-header',
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }
                }, [
                  React.createElement('div', {
                    key: 'author-info',
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }
                  }, [
                    React.createElement('div', {
                      key: 'avatar',
                      style: {
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#1db954',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }, React.createElement(FaUser, { size: 8, color: '#000000' })),

                    React.createElement('span', {
                      key: 'author',
                      style: {
                        fontSize: '11px',
                        color: '#1db954',
                        fontWeight: 'bold'
                      }
                    }, annotation.author),

                    React.createElement('span', {
                      key: 'timestamp',
                      style: {
                        fontSize: '10px',
                        color: '#b3b3b3'
                      }
                    }, new Date(annotation.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }))
                  ]),

                  editMode && React.createElement('button', {
                    key: 'delete',
                    onClick: () => removeAnnotation(annotation.id),
                    style: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px'
                    }
                  }, React.createElement(FaTimes, { size: 10 }))
                ]),

                React.createElement('p', {
                  key: 'text',
                  style: {
                    fontSize: '12px',
                    color: '#ffffff',
                    lineHeight: '1.4',
                    margin: 0
                  }
                }, annotation.text)
              ])
            ) :
            React.createElement('div', {
              key: 'no-annotations',
              style: {
                textAlign: 'center',
                padding: '20px',
                color: '#b3b3b3',
                fontSize: '12px',
                fontStyle: 'italic'
              }
            }, 'Aucune annotation pour le moment')
          )
        ]),

        // Paroles (Lyrics)
        React.createElement('div', {
          key: 'lyrics-section',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h4', {
            key: 'section-title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaMusic, { key: 'icon', size: 14 }),
            'Paroles'
          ]),

          editMode ? 
            React.createElement('textarea', {
              key: 'lyrics-textarea',
              value: editData.lyrics,
              onChange: (e) => handleInputChange('lyrics', e.target.value),
              placeholder: 'Saisir les paroles...',
              rows: 8,
              style: {
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #404040',
                backgroundColor: '#ffffff', // ← Fond blanc
                color: '#000000', // ← Texte noir
                fontSize: '12px',
                lineHeight: '1.6',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              },
              onFocus: (e) => {
                e.target.style.borderColor = '#1db954';
              },
              onBlur: (e) => {
                e.target.style.borderColor = '#404040';
              }
            }) :
            React.createElement('div', {
              key: 'lyrics-display',
              style: {
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid #404040',
                borderRadius: '8px',
                padding: '12px',
                maxHeight: '200px',
                overflow: 'auto'
              }
            }, selectedSong.lyrics ? 
              React.createElement('pre', {
                key: 'lyrics-text',
                style: {
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#ffffff',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit'
                }
              }, selectedSong.lyrics) :
              React.createElement('span', {
                key: 'no-lyrics',
                style: {
                  color: '#b3b3b3',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }
              }, 'Aucune parole disponible')
            )
        ]),

        // Statistiques et métadonnées
        React.createElement('div', {
          key: 'metadata-section'
        }, [
          React.createElement('h4', {
            key: 'section-title',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(FaStar, { key: 'icon', size: 14 }),
            'Statistiques'
          ]),

          React.createElement('div', {
            key: 'stats-grid',
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }
          }, [
            // Durée
            React.createElement('div', {
              key: 'duration-stat',
              style: {
                backgroundColor: 'rgba(29, 185, 84, 0.1)',
                border: '1px solid rgba(29, 185, 84, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }
            }, [
              React.createElement('div', {
                key: 'icon',
                style: {
                  fontSize: '16px',
                  marginBottom: '4px'
                }
              }, React.createElement(FaClock, { size: 16, color: '#1db954' })),
              
              React.createElement('div', {
                key: 'value',
                style: {
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '2px'
                }
              }, formatDuration(selectedSong.duration || 0)),
              
              React.createElement('div', {
                key: 'label',
                style: {
                  fontSize: '10px',
                  color: '#b3b3b3'
                }
              }, 'Durée')
            ]),

            // Écoutes
            React.createElement('div', {
              key: 'plays-stat',
              style: {
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }
            }, [
              React.createElement('div', {
                key: 'icon',
                style: {
                  fontSize: '16px',
                  marginBottom: '4px'
                }
              }, React.createElement(FaHeart, { size: 16, color: '#fbbf24' })),
              
              React.createElement('div', {
                key: 'value',
                style: {
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '2px'
                }
              }, selectedSong.streamCount || 0),
              
              React.createElement('div', {
                key: 'label',
                style: {
                  fontSize: '10px',
                  color: '#b3b3b3'
                }
              }, 'Écoutes')
            ]),

            // Date de sortie
            React.createElement('div', {
              key: 'release-stat',
              style: {
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }
            }, [
              React.createElement('div', {
                key: 'icon',
                style: {
                  fontSize: '16px',
                  marginBottom: '4px'
                }
              }, React.createElement(FaCalendar, { size: 16, color: '#8b5cf6' })),
              
              React.createElement('div', {
                key: 'value',
                style: {
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '2px'
                }
              }, selectedSong.releaseDate ? 
                new Date(selectedSong.releaseDate).toLocaleDateString('fr-FR') : 
                'Non définie'
              ),
              
              React.createElement('div', {
                key: 'label',
                style: {
                  fontSize: '10px',
                  color: '#b3b3b3'
                }
              }, 'Sortie')
            ]),

            // Notes/Annotations
            React.createElement('div', {
              key: 'annotations-stat',
              style: {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }
            }, [
              React.createElement('div', {
                key: 'icon',
                style: {
                  fontSize: '16px',
                  marginBottom: '4px'
                }
              }, React.createElement(FaComment, { size: 16, color: '#ef4444' })),
              
              React.createElement('div', {
                key: 'value',
                style: {
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '2px'
                }
              }, annotations.length),
              
              React.createElement('div', {
                key: 'label',
                style: {
                  fontSize: '10px',
                  color: '#b3b3b3'
                }
              }, 'Annotations')
            ])
          ]),

          // Informations techniques
          React.createElement('div', {
            key: 'technical-info',
            style: {
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid #404040'
            }
          }, [
            React.createElement('h5', {
              key: 'tech-title',
              style: {
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }
            }, [
              React.createElement(FaFileAudio, { key: 'icon', size: 10 }),
              'Informations techniques'
            ]),

            React.createElement('div', {
              key: 'tech-details',
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '11px'
              }
            }, [
              React.createElement('div', {
                key: 'created',
                style: { color: '#b3b3b3' }
              }, [
                React.createElement('span', { key: 'label', style: { fontWeight: 'bold' } }, 'Créé: '),
                selectedSong.$createdAt ? 
                  new Date(selectedSong.$createdAt).toLocaleDateString('fr-FR') : 
                  'Inconnu'
              ]),

              React.createElement('div', {
                key: 'updated',
                style: { color: '#b3b3b3' }
              }, [
                React.createElement('span', { key: 'label', style: { fontWeight: 'bold' } }, 'Modifié: '),
                selectedSong.updatedAt ? 
                  new Date(selectedSong.updatedAt).toLocaleDateString('fr-FR') : 
                  'Jamais'
              ]),

              React.createElement('div', {
                key: 'file-size',
                style: { color: '#b3b3b3' }
              }, [
                React.createElement('span', { key: 'label', style: { fontWeight: 'bold' } }, 'Taille: '),
                selectedSong.fileSize ? `${(selectedSong.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Inconnue'
              ]),

              React.createElement('div', {
                key: 'format',
                style: { color: '#b3b3b3' }
              }, [
                React.createElement('span', { key: 'label', style: { fontWeight: 'bold' } }, 'Format: '),
                selectedSong.audioFormat || 'MP3'
              ])
            ])
          ])
        ])
      ])
    ])
  ]);
};

export default Home;

