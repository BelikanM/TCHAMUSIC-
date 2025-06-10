import React, { useState, useRef, useEffect } from 'react';
import { 
  updateSong,
  uploadImage,
  getFilePreview
} from '../lib/appwriteClient';
import { 
  FaEdit, 
  FaImage, 
  FaSave, 
  FaTrash, 
  FaMusic, 
  FaTag, 
  FaClock, 
  FaInfoCircle,
  FaUpload,
  FaTimes,
  FaComment,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

const SongEditor = ({ 
  song, 
  isOpen, 
  onClose, 
  onSave, 
  currentUser 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
  const editorRef = useRef(null);

  // Initialiser les données quand une chanson est sélectionnée
  useEffect(() => {
    if (song) {
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
    }
  }, [song]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setEditMode(false);
    setIsFullscreen(false);
    onClose();
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
      
      setEditData(prev => ({
        ...prev,
        coverImage: uploadedFile.$id
      }));
      
      alert('Image uploadée avec succès !');
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!song || !currentUser) return;

    try {
      setSaving(true);
      
      const updateData = {
        ...editData,
        updatedAt: new Date().toISOString(),
        lastEditedBy: currentUser.$id
      };

      await updateSong(song.$id, updateData);
      
      // Callback pour mettre à jour la liste parent
      onSave && onSave({ ...song, ...updateData });
      
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!isOpen || !song) return null;

  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isFullscreen ? '0' : '20px'
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

    // Overlay de fond
    React.createElement('div', {
      key: 'overlay',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)'
      },
      onClick: handleClose
    }),

    // Conteneur principal de l'éditeur
    React.createElement('div', {
      key: 'editor-container',
      ref: editorRef,
      style: {
        position: 'relative',
        width: isFullscreen ? '100vw' : 'min(90vw, 1200px)',
        height: isFullscreen ? '100vh' : 'min(90vh, 800px)',
        backgroundColor: '#181818',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
      },
      onClick: (e) => e.stopPropagation()
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
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
            editMode ? 'Édition' : 'Détails de l\'œuvre'
          ]),

          React.createElement('p', {
            key: 'song-title',
            style: {
              color: '#b3b3b3',
              fontSize: '14px',
              margin: 0
            }
          }, song.title)
        ]),

        React.createElement('div', {
          key: 'header-actions',
          style: { display: 'flex', gap: '8px', alignItems: 'center' }
        }, [
          React.createElement('button', {
            key: 'fullscreen-toggle',
            onClick: toggleFullscreen,
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '6px',
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
          }, React.createElement(isFullscreen ? FaCompress : FaExpand, { size: 12 })),

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
            onClick: handleSave,
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
            onClick: handleClose,
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '6px',
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
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.borderColor = '#ef4444';
              e.target.style.color = '#ffffff';
            },
            onMouseLeave: (e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#404040';
              e.target.style.color = '#b3b3b3';
            }
          }, React.createElement(FaTimes, { size: 14 }))
        ])
      ]),

      // Contenu principal
      React.createElement('div', {
        key: 'main-content',
        style: {
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }
      }, [
        // Panneau gauche - Informations et lecteur
        React.createElement('div', {
          key: 'left-panel',
          style: {
            width: isFullscreen ? '400px' : '350px',
            backgroundColor: '#1a1a1a',
            borderRight: '1px solid #404040',
            overflow: 'auto',
            flexShrink: 0
          }
        }, [
          // Cover avec lecteur
          React.createElement('div', {
            key: 'cover-section',
            style: {
              padding: '24px',
              borderBottom: '1px solid #404040'
            }
          }, [
            React.createElement('div', {
              key: 'cover-container',
              style: {
                width: '100%',
                aspectRatio: '1',
                borderRadius: '12px',
                background: (editData.coverImage || song.coverImage) ? 
                  `url(${getFilePreview(editData.coverImage || song.coverImage, 400, 400)}) center/cover` :
                  'linear-gradient(45deg, #1db954, #1ed760)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '16px',
                border: editMode ? '2px dashed #404040' : 'none'
              }
            }, [
              !(editData.coverImage || song.coverImage) && React.createElement(FaMusic, { 
                key: 'placeholder', 
                size: 48, 
                color: 'rgba(255,255,255,0.3)' 
              }),

              // Overlay d'upload
              editMode && React.createElement('div', {
                key: 'upload-overlay',
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
                  key: 'upload-content',
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ffffff',
                    textAlign: 'center'
                  }
                }, [
                  React.createElement(FaUpload, { key: 'icon', size: 24 }),
                  React.createElement('div', {
                    key: 'text',
                    style: { fontSize: '14px', fontWeight: 'bold' }
                  }, uploadingImage ? 'Upload...' : 'Changer l\'image')
                ])
              ]),

              // Contrôles de lecture
              !editMode && React.createElement('div', {
                key: 'player-controls',
                style: {
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderRadius: '8px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)'
                }
              }, [
                React.createElement('div', {
                  key: 'controls-row',
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }
                }, [
                  React.createElement('button', {
                    key: 'play',
                    style: {
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#1db954',
                      border: 'none',
                      color: '#000000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }, React.createElement(FaPlay, { size: 12 })),

                  React.createElement('div', {
                    key: 'progress',
                    style: { flex: 1 }
                  }, [
                    React.createElement('div', {
                      key: 'bar',
                      style: {
                        width: '100%',
                        height: '4px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: '2px'
                      }
                    }, React.createElement('div', {
                      style: {
                        width: '30%',
                        height: '100%',
                        backgroundColor: '#1db954',
                        borderRadius: '2px'
                      }
                    }))
                  ]),

                  React.createElement('button', {
                    key: 'volume',
                    style: {
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#b3b3b3',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }, React.createElement(FaVolumeUp, { size: 10 }))
                ]),

                React.createElement('div', {
                  key: 'time-display',
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#b3b3b3'
                  }
                }, [
                  React.createElement('span', { key: 'current' }, '1:23'),
                  React.createElement('span', { key: 'total' }, formatDuration(song.duration || 0))
                ])
              ])
            ]),

            // Infos principales
            React.createElement('div', {
              key: 'song-info',
              style: { textAlign: 'center' }
            }, [
              React.createElement('h2', {
                key: 'title',
                style: {
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '8px'
                }
              }, song.title),

              React.createElement('p', {
                key: 'artist',
                style: {
                  fontSize: '14px',
                  color: '#b3b3b3',
                  marginBottom: '16px'
                }
              }, song.artistId),

              // Stats
              React.createElement('div', {
                key: 'stats',
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px'
                }
              }, [
                React.createElement('div', {
                  key: 'duration-stat',
                  style: {
                    padding: '8px',
                    backgroundColor: 'rgba(29, 185, 84, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }
                }, [
                  React.createElement('div', {
                    key: 'value',
                    style: { fontSize: '14px', fontWeight: 'bold', color: '#1db954' }
                  }, formatDuration(song.duration || 0)),
                  React.createElement('div', {
                    key: 'label',
                    style: { fontSize: '10px', color: '#b3b3b3' }
                  }, 'Durée')
                ]),

                React.createElement('div', {
                  key: 'annotations-stat',
                  style: {
                    padding: '8px',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }
                }, [
                  React.createElement('div', {
                    key: 'value',
                    style: { fontSize: '14px', fontWeight: 'bold', color: '#fbbf24' }
                  }, annotations.length),
                  React.createElement('div', {
                    key: 'label',
                    style: { fontSize: '10px', color: '#b3b3b3' }
                  }, 'Notes')
                ]),

                React.createElement('div', {
                  key: 'tags-stat',
                  style: {
                    padding: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }
                }, [
                  React.createElement('div', {
                    key: 'value',
                    style: { fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6' }
                  }, (song.tags || []).length),
                  React.createElement('div', {
                    key: 'label',
                    style: { fontSize: '10px', color: '#b3b3b3' }
                  }, 'Tags')
                ])
              ])
            ])
          ])
        ]),

        // Panneau droit - Éditeur
        React.createElement('div', {
          key: 'right-panel',
          style: {
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#181818'
          }
        }, [
          React.createElement('div', {
            key: 'editor-content',
            style: { padding: '24px' }
          }, [
            // Titre de section
            React.createElement('h4', {
              key: 'editor-title',
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, [
              React.createElement(FaEdit, { key: 'icon', size: 16 }),
              editMode ? 'Édition des informations' : 'Informations détaillées'
            ]),

            // Formulaire d'édition
            React.createElement('div', {
              key: 'form-fields',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }
            }, [
              // Titre
              React.createElement('div', {
                key: 'title-field'
              }, [
                React.createElement('label', {
                  key: 'label',
                  style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '8px'
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
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #404040',
                      backgroundColor: '#282828',
                      color: '#ffffff',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    },
                    onFocus: (e) => e.target.style.borderColor = '#1db954',
                    onBlur: (e) => e.target.style.borderColor = '#404040'
                  }) :
                  React.createElement('div', {
                    key: 'value',
                    style: {
                      padding: '12px 16px',
                      backgroundColor: '#282828',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }
                  }, song.title || 'Non défini')
              ]),

              // Genre et Date
              React.createElement('div', {
                key: 'genre-date-row',
                style: {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }
              }, [
                // Genre
                React.createElement('div', {
                  key: 'genre-field'
                }, [
                  React.createElement('label', {
                    key: 'label',
                    style: {
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }
                  }, 'Genre'),

                  editMode ? 
                    React.createElement('select', {
                      key: 'select',
                      value: editData.genre,
                      onChange: (e) => handleInputChange('genre', e.target.value),
                      style: {
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #404040',
                        backgroundColor: '#282828',
                        color: '#ffffff',
                        fontSize: '14px'
                      }
                    }, [
                      React.createElement('option', { key: 'empty', value: '' }, 'Sélectionner'),
                      ['Hip-Hop', 'R&B', 'Pop', 'Rock', 'Jazz', 'Blues', 'Reggae', 'Afrobeat', 'Électro', 'Classique'].map(genre =>
                        React.createElement('option', { key: genre, value: genre }, genre)
                      )
                    ]) :
                    React.createElement('div', {
                      key: 'value',
                      style: {
                        padding: '12px 16px',
                        backgroundColor: '#282828',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }
                    }, song.genre ? 
                      React.createElement('span', {
                        style: {
                          backgroundColor: 'rgba(29, 185, 84, 0.2)',
                          color: '#1db954',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      }, song.genre) :
                      React.createElement('span', {
                        style: { color: '#b3b3b3', fontStyle: 'italic' }
                      }, 'Non défini')
                    )
                ]),

                // Date
                React.createElement('div', {
                  key: 'date-field'
                }, [
                  React.createElement('label', {
                    key: 'label',
                    style: {
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }
                  }, 'Date de sortie'),

                  editMode ? 
                    React.createElement('input', {
                      key: 'input',
                      type: 'date',
                      value: editData.releaseDate,
                      onChange: (e) => handleInputChange('releaseDate', e.target.value),
                      style: {
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #404040',
                        backgroundColor: '#282828',
                        color: '#ffffff',
                        fontSize: '14px'
                      }
                    }) :
                    React.createElement('div', {
                      key: 'value',
                      style: {
                        padding: '12px 16px',
                        backgroundColor: '#282828',
                        borderRadius: '8px',
                        color: song.releaseDate ? '#ffffff' : '#b3b3b3',
                        fontSize: '14px',
                        fontStyle: song.releaseDate ? 'normal' : 'italic'
                      }
                    }, formatDate(song.releaseDate))
                ])
              ]),

              // Description
              React.createElement('div', {
                key: 'description-field'
              }, [
                React.createElement('label', {
                  key: 'label',
                  style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }
                }, 'Description'),

                                editMode ? 
                  React.createElement('textarea', {
                    key: 'textarea',
                    value: editData.description,
                    onChange: (e) => handleInputChange('description', e.target.value),
                    rows: 4,
                    placeholder: 'Décrivez votre œuvre...',
                    style: {
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #404040',
                      backgroundColor: '#282828',
                      color: '#ffffff',
                      fontSize: '14px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit'
                    },
                    onFocus: (e) => e.target.style.borderColor = '#1db954',
                    onBlur: (e) => e.target.style.borderColor = '#404040'
                  }) :
                  React.createElement('div', {
                    key: 'value',
                    style: {
                      padding: '12px 16px',
                      backgroundColor: '#282828',
                      borderRadius: '8px',
                      color: song.description ? '#ffffff' : '#b3b3b3',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontStyle: song.description ? 'normal' : 'italic',
                      minHeight: '60px'
                    }
                  }, song.description || 'Aucune description')
              ]),

              // Tags
              React.createElement('div', {
                key: 'tags-field'
              }, [
                React.createElement('label', {
                  key: 'label',
                  style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }
                }, 'Tags'),

                React.createElement('div', {
                  key: 'tags-container',
                  style: {
                    padding: '12px 16px',
                    backgroundColor: '#282828',
                    borderRadius: '8px',
                    minHeight: '50px'
                  }
                }, [
                  React.createElement('div', {
                    key: 'tags-list',
                    style: {
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: editMode ? '12px' : '0'
                    }
                  }, (editMode ? editData.tags : song.tags || []).map(tag =>
                    React.createElement('span', {
                      key: tag,
                      style: {
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }
                    }, [
                      React.createElement('span', { key: 'text' }, tag),
                      editMode && React.createElement('button', {
                        key: 'remove',
                        onClick: () => removeTag(tag),
                        style: {
                          background: 'none',
                          border: 'none',
                          color: '#8b5cf6',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center'
                        }
                      }, React.createElement(FaTimes, { size: 10 }))
                    ])
                  )),

                  editMode && React.createElement('div', {
                    key: 'add-tag',
                    style: {
                      display: 'flex',
                      gap: '8px'
                    }
                  }, [
                    React.createElement('input', {
                      key: 'input',
                      type: 'text',
                      placeholder: 'Ajouter un tag...',
                      style: {
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #404040',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '12px'
                      },
                      onKeyPress: (e) => {
                        if (e.key === 'Enter') {
                          addTag(e.target.value.trim());
                          e.target.value = '';
                        }
                      }
                    }),
                    React.createElement('button', {
                      key: 'add-btn',
                      onClick: (e) => {
                        const input = e.target.previousElementSibling;
                        addTag(input.value.trim());
                        input.value = '';
                      },
                      style: {
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#8b5cf6',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }
                    }, 'Ajouter')
                  ])
                ])
              ]),

              // Durée
              React.createElement('div', {
                key: 'duration-field'
              }, [
                React.createElement('label', {
                  key: 'label',
                  style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }
                }, 'Durée (secondes)'),

                editMode ? 
                  React.createElement('input', {
                    key: 'input',
                    type: 'number',
                    value: editData.duration,
                    onChange: (e) => handleInputChange('duration', parseInt(e.target.value) || 0),
                    min: 0,
                    style: {
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #404040',
                      backgroundColor: '#282828',
                      color: '#ffffff',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    },
                    onFocus: (e) => e.target.style.borderColor = '#1db954',
                    onBlur: (e) => e.target.style.borderColor = '#404040'
                  }) :
                  React.createElement('div', {
                    key: 'value',
                    style: {
                      padding: '12px 16px',
                      backgroundColor: '#282828',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }
                  }, `${song.duration || 0} secondes (${formatDuration(song.duration || 0)})`)
              ]),

              // Crédits
              React.createElement('div', {
                key: 'credits-field'
              }, [
                React.createElement('label', {
                  key: 'label',
                  style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }
                }, 'Crédits'),

                React.createElement('div', {
                  key: 'credits-grid',
                  style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#282828',
                    borderRadius: '8px'
                  }
                }, [
                  // Producteur
                  React.createElement('div', {
                    key: 'producer'
                  }, [
                    React.createElement('label', {
                      key: 'label',
                      style: {
                        display: 'block',
                        fontSize: '11px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }
                    }, 'Producteur'),

                    editMode ? 
                      React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: editData.credits.producer,
                        onChange: (e) => handleInputChange('producer', e.target.value, 'credits'),
                        style: {
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #404040',
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          fontSize: '12px'
                        }
                      }) :
                      React.createElement('div', {
                        key: 'value',
                        style: {
                          padding: '8px 12px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '6px',
                          color: song.credits?.producer ? '#ffffff' : '#b3b3b3',
                          fontSize: '12px',
                          fontStyle: song.credits?.producer ? 'normal' : 'italic'
                        }
                      }, song.credits?.producer || 'Non défini')
                  ]),

                  // Compositeur
                  React.createElement('div', {
                    key: 'composer'
                  }, [
                    React.createElement('label', {
                      key: 'label',
                      style: {
                        display: 'block',
                        fontSize: '11px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }
                    }, 'Compositeur'),

                    editMode ? 
                      React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: editData.credits.composer,
                        onChange: (e) => handleInputChange('composer', e.target.value, 'credits'),
                        style: {
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #404040',
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          fontSize: '12px'
                        }
                      }) :
                      React.createElement('div', {
                        key: 'value',
                        style: {
                          padding: '8px 12px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '6px',
                          color: song.credits?.composer ? '#ffffff' : '#b3b3b3',
                          fontSize: '12px',
                          fontStyle: song.credits?.composer ? 'normal' : 'italic'
                        }
                      }, song.credits?.composer || 'Non défini')
                  ]),

                  // Parolier
                  React.createElement('div', {
                    key: 'lyricist'
                  }, [
                    React.createElement('label', {
                      key: 'label',
                      style: {
                        display: 'block',
                        fontSize: '11px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }
                    }, 'Parolier'),

                    editMode ? 
                      React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: editData.credits.lyricist,
                        onChange: (e) => handleInputChange('lyricist', e.target.value, 'credits'),
                        style: {
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #404040',
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          fontSize: '12px'
                        }
                      }) :
                      React.createElement('div', {
                        key: 'value',
                        style: {
                          padding: '8px 12px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '6px',
                          color: song.credits?.lyricist ? '#ffffff' : '#b3b3b3',
                          fontSize: '12px',
                          fontStyle: song.credits?.lyricist ? 'normal' : 'italic'
                        }
                      }, song.credits?.lyricist || 'Non défini')
                  ]),

                  // Studio
                  React.createElement('div', {
                    key: 'studio'
                  }, [
                    React.createElement('label', {
                      key: 'label',
                      style: {
                        display: 'block',
                        fontSize: '11px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }
                    }, 'Studio'),

                    editMode ? 
                      React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: editData.credits.studio,
                        onChange: (e) => handleInputChange('studio', e.target.value, 'credits'),
                        style: {
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #404040',
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          fontSize: '12px'
                        }
                      }) :
                      React.createElement('div', {
                        key: 'value',
                        style: {
                          padding: '8px 12px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '6px',
                          color: song.credits?.studio ? '#ffffff' : '#b3b3b3',
                          fontSize: '12px',
                          fontStyle: song.credits?.studio ? 'normal' : 'italic'
                        }
                      }, song.credits?.studio || 'Non défini')
                  ])
                ])
              ]),

              // Annotations
              React.createElement('div', {
                key: 'annotations-field'
              }, [
                React.createElement('label', {
                  key: 'label',
                  style: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }
                }, 'Annotations'),

                React.createElement('div', {
                  key: 'annotations-container',
                  style: {
                    backgroundColor: '#282828',
                    borderRadius: '8px',
                    padding: '16px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }
                }, [
                  React.createElement('div', {
                    key: 'annotations-list',
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginBottom: editMode ? '16px' : '0'
                    }
                  }, annotations.length > 0 ? annotations.map(annotation =>
                    React.createElement('div', {
                      key: annotation.id,
                      style: {
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        position: 'relative'
                      }
                    }, [
                      React.createElement('div', {
                        key: 'content',
                        style: {
                          color: '#ffffff',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          marginBottom: '8px'
                        }
                      }, annotation.text),

                      React.createElement('div', {
                        key: 'meta',
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }
                      }, [
                        React.createElement('div', {
                          key: 'author-date',
                          style: {
                            fontSize: '11px',
                            color: '#b3b3b3'
                          }
                        }, `${annotation.author} • ${formatDate(annotation.timestamp)}`),

                        editMode && React.createElement('button', {
                          key: 'delete',
                          onClick: () => removeAnnotation(annotation.id),
                          style: {
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }
                        }, React.createElement(FaTrash, { size: 10 }))
                      ])
                    ])
                  ) : React.createElement('div', {
                    style: {
                      textAlign: 'center',
                      color: '#b3b3b3',
                      fontSize: '14px',
                      fontStyle: 'italic',
                      padding: '20px'
                    }
                  }, 'Aucune annotation')),

                  editMode && React.createElement('div', {
                    key: 'add-annotation',
                    style: {
                      borderTop: annotations.length > 0 ? '1px solid #404040' : 'none',
                      paddingTop: annotations.length > 0 ? '16px' : '0'
                    }
                  }, [
                    React.createElement('textarea', {
                      key: 'textarea',
                      value: newAnnotation,
                      onChange: (e) => setNewAnnotation(e.target.value),
                      placeholder: 'Ajouter une annotation...',
                      rows: 3,
                      style: {
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #404040',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        fontSize: '14px',
                        resize: 'vertical',
                        marginBottom: '8px',
                        fontFamily: 'inherit'
                      }
                    }),

                    React.createElement('button', {
                      key: 'add-btn',
                      onClick: addAnnotation,
                      disabled: !newAnnotation.trim(),
                      style: {
                        padding: '8px 16px',
                        borderRadius: '6px',
                        backgroundColor: newAnnotation.trim() ? '#fbbf24' : '#404040',
                        border: 'none',
                        color: newAnnotation.trim() ? '#000000' : '#b3b3b3',
                        cursor: newAnnotation.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }
                    }, 'Ajouter annotation')
                  ])
                ])
              ])
            ])
          ])
        ])
      ])
    ])
  ]);
};

export default SongEditor;

