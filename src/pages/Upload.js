import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createSong, uploadAudioFile, createArtist } from '../lib/appwriteClient';
import LoginModal from '../components/LoginModal';
import { FaUpload, FaMusic, FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';

const Upload = () => {
  const { user } = useAuth();
  const [songData, setSongData] = useState({
    title: '',
    artistName: '',
    genre: '',
    duration: 0
  });
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      // Upload du fichier audio
      const uploadedFile = await uploadAudioFile(audioFile, user.$id);
      
      // Créer ou récupérer l'artiste
      const artist = await createArtist({
        name: songData.artistName,
        verified: false,
        monthlyListeners: 0
      }, user.$id);

      // Créer la chanson
      await createSong({
        title: songData.title,
        artistId: artist.$id,
        audioFileId: uploadedFile.$id,
        duration: songData.duration,
        genre: songData.genre,
        releaseDate: new Date().toISOString(),
        streamCount: 0,
        likeCount: 0
      }, user.$id);

      setUploadSuccess(true);
      setSongData({ title: '', artistName: '', genre: '', duration: 0 });
      setAudioFile(null);
      
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
        maxWidth: '600px',
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

        // File Field
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
