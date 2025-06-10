import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { FaUpload, FaMusic, FaCloudUploadAlt, FaCheckCircle, FaImage, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink } from 'react-icons/fa';

const Upload = () => {
  const { user } = useAuth();
  const [songData, setSongData] = useState({
    title: '',
    artistName: '',
    genre: '',
    duration: 0,
    biography: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const biographyRef = useRef(null);

  // Fonctions pour l'éditeur de texte
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    biographyRef.current.focus();
    updateBiography();
  };

  const updateBiography = () => {
    if (biographyRef.current) {
      setSongData({...songData, biography: biographyRef.current.innerHTML});
    }
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Fonction pour uploader les fichiers vers votre serveur
  const uploadFileToServer = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('userId', user.$id);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.jwt}` // Token d'authentification
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload du fichier');
    }

    return await response.json();
  };

  // Fonction pour créer/récupérer un artiste via API
  const createOrGetArtist = async (artistData) => {
    const response = await fetch('/api/artists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.jwt}`
      },
      body: JSON.stringify({
        name: artistData.name,
        bio: artistData.bio,
        verified: false,
        monthlyListeners: 0,
        coverImage: artistData.coverImage,
        userId: user.$id
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'artiste');
    }

    return await response.json();
  };

  // Fonction pour créer une chanson via API
  const createSongInDB = async (songData) => {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.jwt}`
      },
      body: JSON.stringify({
        ...songData,
        userId: user.$id,
        releaseDate: new Date().toISOString(),
        streamCount: 0,
        likeCount: 0
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la chanson');
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!audioFile) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }

    setUploading(true);
    try {
      // Upload du fichier audio vers votre serveur
      const uploadedAudio = await uploadFileToServer(audioFile, 'audio');
      
      // Upload de l'image si présente
      let uploadedImage = null;
      if (imageFile) {
        uploadedImage = await uploadFileToServer(imageFile, 'image');
      }

      // Créer ou récupérer l'artiste dans MySQL
      const artist = await createOrGetArtist({
        name: songData.artistName,
        bio: songData.biography,
        coverImage: uploadedImage ? uploadedImage.filePath : null
      });

      // Créer la chanson dans MySQL
      await createSongInDB({
        title: songData.title,
        artistId: artist.id,
        audioFilePath: uploadedAudio.filePath,
        audioFileUrl: uploadedAudio.fileUrl,
        duration: songData.duration,
        genre: songData.genre,
        coverImage: uploadedImage ? uploadedImage.filePath : null,
        coverImageUrl: uploadedImage ? uploadedImage.fileUrl : null
      });

      setUploadSuccess(true);
      setSongData({ title: '', artistName: '', genre: '', duration: 0, biography: '' });
      setAudioFile(null);
      setImageFile(null);
      if (biographyRef.current) {
        biographyRef.current.innerHTML = '';
      }
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return React.createElement('div', {
    className: 'container',
    style: { paddingTop: '20px', paddingBottom: '40px' }
  }, [
    React.createElement('div', {
      key: 'upload-container',
      style: {
        maxWidth: '800px',
        margin: '0 auto'
      }
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
            background: 'linear-gradient(45deg, #1db954, #1ed760)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(29, 185, 84, 0.3)'
          }
        }, React.createElement(FaCloudUploadAlt, { size: 36, color: '#000000' })),

        React.createElement('h1', {
          key: 'title',
          style: {
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '12px'
          }
        }, 'Uploader votre musique'),

        React.createElement('p', {
          key: 'subtitle',
          style: {
            color: '#b3b3b3',
            fontSize: '16px',
            maxWidth: '400px',
            margin: '0 auto'
          }
        }, 'Partagez vos créations avec la communauté TchaMusic')
      ]),

      // Success Message
      uploadSuccess && React.createElement('div', {
        key: 'success',
        className: 'card card-green fade-in-up',
        style: {
          textAlign: 'center',
          marginBottom: '24px',
          padding: '20px'
        }
      }, [
        React.createElement(FaCheckCircle, {
          key: 'icon',
          size: 32,
          color: '#000000',
          style: { marginBottom: '12px' }
        }),
        React.createElement('h3', {
          key: 'text',
          style: {
            color: '#000000',
            fontSize: '18px',
            fontWeight: 'bold'
          }
        }, 'Chanson uploadée avec succès ! 🎉')
      ]),

      // Upload Form
      React.createElement('form', {
        key: 'form',
        onSubmit: handleSubmit,
        className: 'card fade-in-up',
        style: {
          padding: '32px',
          animationDelay: '0.2s'
        }
      }, [
        // Title Field
        React.createElement('div', {
          key: 'title-field',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '14px'
            }
          }, 'Titre de la chanson *'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            value: songData.title,
            onChange: (e) => setSongData({...songData, title: e.target.value}),
            style: {
              width: '100%',
              padding: '16px',
              backgroundColor: '#282828',
              border: '2px solid #404040',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#ffffff',
              transition: 'border-color 0.3s ease'
            },
            placeholder: 'Entrez le titre de votre chanson',
            required: true
          })
        ]),

        // Artist Field
        React.createElement('div', {
          key: 'artist-field',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '14px'
            }
          }, 'Nom de l\'artiste *'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            value: songData.artistName,
            onChange: (e) => setSongData({...songData, artistName: e.target.value}),
            style: {
              width: '100%',
              padding: '16px',
              backgroundColor: '#282828',
              border: '2px solid #404040',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#ffffff',
              transition: 'border-color 0.3s ease'
            },
            placeholder: 'Nom de l\'artiste ou du groupe',
            required: true
          })
        ]),

        // Genre Field
        React.createElement('div', {
          key: 'genre-field',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '14px'
            }
          }, 'Genre musical'),
          React.createElement('select', {
            key: 'select',
            value: songData.genre,
            onChange: (e) => setSongData({...songData, genre: e.target.value}),
            style: {
              width: '100%',
              padding: '16px',
              backgroundColor: '#282828',
              border: '2px solid #404040',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#ffffff'
            }
          }, [
            React.createElement('option', { key: 'default', value: '' }, 'Sélectionner un genre'),
            React.createElement('option', { key: 'pop', value: 'Pop' }, 'Pop'),
            React.createElement('option', { key: 'rock', value: 'Rock' }, 'Rock'),
            React.createElement('option', { key: 'hip-hop', value: 'Hip-Hop' }, 'Hip-Hop'),
            React.createElement('option', { key: 'electronic', value: 'Electronic' }, 'Electronic'),
            React.createElement('option', { key: 'jazz', value: 'Jazz' }, 'Jazz'),
            React.createElement('option', { key: 'classical', value: 'Classical' }, 'Classique'),
            React.createElement('option', { key: 'reggae', value: 'Reggae' }, 'Reggae'),
            React.createElement('option', { key: 'country', value: 'Country' }, 'Country'),
            React.createElement('option', { key: 'blues', value: 'Blues' }, 'Blues'),
            React.createElement('option', { key: 'folk', value: 'Folk' }, 'Folk')
          ])
        ]),

        // Biography Field with Rich Text Editor
        React.createElement('div', {
          key: 'biography-field',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '14px'
            }
          }, 'Biographie de l\'artiste'),
          
          // Toolbar
          React.createElement('div', {
            key: 'toolbar',
            style: {
              display: 'flex',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#1a1a1a',
              border: '2px solid #404040',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              flexWrap: 'wrap'
            }
          }, [
            React.createElement('button', {
              key: 'bold',
              type: 'button',
              onClick: () => execCommand('bold'),
              style: {
                padding: '8px 12px',
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }
            }, [React.createElement(FaBold, { key: 'icon', size: 12 }), 'Gras']),
            
            React.createElement('button', {
              key: 'italic',
              type: 'button',
              onClick: () => execCommand('italic'),
              style: {
                padding: '8px 12px',
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }
            }, [React.createElement(FaItalic, { key: 'icon', size: 12 }), 'Italique']),
            
            React.createElement('button', {
              key: 'underline',
              type: 'button',
              onClick: () => execCommand('underline'),
              style: {
                padding: '8px 12px',
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }
            }, [React.createElement(FaUnderline, { key: 'icon', size: 12 }), 'Souligné']),
            
            React.createElement('button', {
              key: 'ul',
              type: 'button',
              onClick: () => execCommand('insertUnorderedList'),
              style: {
                padding: '8px 12px',
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }
            }, [React.createElement(FaListUl, { key: 'icon', size: 12 }), 'Liste']),
            
            React.createElement('button', {
              key: 'ol',
              type: 'button',
              onClick: () => execCommand('insertOrderedList'),
              style: {
                padding: '8px 12px',
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }
            }, [React.createElement(FaListOl, { key: 'icon', size: 12 }), 'Numérotée']),
            
            React.createElement('button', {
              key: 'link',
              type: 'button',
              onClick: insertLink,
              style: {
                padding: '8px 12px',
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }
            }, [React.createElement(FaLink, { key: 'icon', size: 12 }), 'Lien'])
          ]),
          
          // Editor
          React.createElement('div', {
            key: 'editor',
            ref: biographyRef,
            contentEditable: true,
            onInput: updateBiography,
            style: {
              minHeight: '150px',
              padding: '16px',
              backgroundColor: '#282828',
              border: '2px solid #404040',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              color: '#ffffff',
              fontSize: '16px',
              lineHeight: '1.5',
              outline: 'none'
            },
            'data-placeholder': 'Écrivez la biographie de l\'artiste...'
          })
        ]),

        // Image Upload Field
        React.createElement('div', {
          key: 'image-field',
          style: { marginBottom: '24px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '14px'
            }
          }, 'Image de couverture'),
          React.createElement('div', {
            key: 'image-container',
            style: {
              position: 'relative',
              border: '2px dashed #404040',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#1a1a1a',
              transition: 'all 0.3s ease'
            }
          }, [
            React.createElement('input', {
              key: 'input',
              type: 'file',
              accept: 'image/*',
              onChange: (e) => setImageFile(e.target.files[0]),
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }
            }),
            React.createElement(FaImage, {
              key: 'icon',
              size: 28,
              color: '#1db954',
              style: { marginBottom: '8px' }
            }),
            React.createElement('p', {
              key: 'text',
              style: {
                color: imageFile ? '#1db954' : '#b3b3b3',
                fontSize: '14px',
                fontWeight: imageFile ? 'bold' : 'normal'
              }
            }, imageFile ? imageFile.name : 'Cliquez pour ajouter une image'),
            React.createElement('p', {
              key: 'hint',
              style: {
                color: '#666666',
                fontSize: '11px',
                marginTop: '4px'
              }
            }, 'JPG, PNG, GIF (max 5MB)')
          ])
        ]),

        // Audio File Field
        React.createElement('div', {
          key: 'file-field',
          style: { marginBottom: '32px' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '14px'
            }
          }, 'Fichier audio *'),
          React.createElement('div', {
            key: 'file-container',
            style: {
              position: 'relative',
              border: '2px dashed #404040',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              backgroundColor: '#1a1a1a',
              transition: 'all 0.3s ease'
            }
          }, [
            React.createElement('input', {
              key: 'input',
              type: 'file',
              accept: 'audio/*',
              onChange: (e) => setAudioFile(e.target.files[0]),
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              },
              required: true
            }),
            React.createElement(FaMusic, {
              key: 'icon',
              size: 32,
              color: '#1db954',
              style: { marginBottom: '12px' }
            }),
            React.createElement('p', {
              key: 'text',
              style: {
                color: audioFile ? '#1db954' : '#b3b3b3',
                fontSize: '16px',
                fontWeight: audioFile ? 'bold' : 'normal'
              }
            }, audioFile ? audioFile.name : 'Cliquez ou glissez votre fichier audio ici'),
            React.createElement('p', {
              key: 'hint',
              style: {
                color: '#666666',
                fontSize: '12px',
                marginTop: '8px'
              }
            }, 'Formats supportés: MP3, WAV, FLAC, AAC')
          ])
        ]),

        // Submit Button
        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          disabled: uploading || !user,
          className: uploading ? '' : 'btn-primary',
          style: {
            width: '100%',
            backgroundColor: uploading ? '#404040' : '#1db954',
            color: uploading ? '#b3b3b3' : '#000000',
            padding: '18px',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: uploading || !user ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.3s ease'
          }
        }, [
          React.createElement(uploading ? FaMusic : FaUpload, { 
            key: 'icon', 
            size: 18,
            className: uploading ? 'pulse' : ''
          }),
          uploading ? 'Upload en cours...' : !user ? 'Connectez-vous pour uploader' : 'Uploader la chanson'
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

export default Upload;



