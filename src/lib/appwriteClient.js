import { Client, Databases, Storage, Account, ID, Query, Permission, Role } from 'appwrite';

// Configuration Appwrite
const PROJECT_ID = '681deee80012cf6d3e15';
const API_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const DATABASE_ID = 'tchamusic';
const BUCKET_ID = '6827864200044d72309a';

// Initialisation du client Appwrite
const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// ==================== GESTION DES ERREURS ====================
const handleError = (error, operation) => {
  console.error(`Erreur ${operation}:`, error);
  if (error.code === 404) {
    throw new Error(`Ressource non trouvée pour ${operation}`);
  }
  if (error.code === 401) {
    throw new Error(`Non autorisé pour ${operation}`);
  }
  throw error;
};

// ==================== USERS ====================
export async function createUser(userData) {
  try {
    const user = {
      userId: userData.userId || ID.unique(),
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName || userData.username,
      avatar: userData.avatar || null,
      bio: userData.bio || '',
      isPremium: userData.isPremium || false,
      followersCount: userData.followersCount || 0,
      followingCount: userData.followingCount || 0,
      country: userData.country || null
    };

    return await databases.createDocument(
      DATABASE_ID, 
      'users', 
      ID.unique(), 
      user,
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.userId)),
        Permission.delete(Role.user(user.userId))
      ]
    );
  } catch (error) {
    handleError(error, 'createUser');
  }
}

export async function getUserByUserId(userId) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'users', [
      Query.equal('userId', userId),
      Query.limit(1),
    ]);
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error('Erreur getUserByUserId:', error);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'users', [
      Query.equal('email', email),
      Query.limit(1),
    ]);
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error('Erreur getUserByEmail:', error);
    return null;
  }
}

export async function updateUser(userId, updateData) {
  try {
    const user = await getUserByUserId(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    
    return await databases.updateDocument(
      DATABASE_ID,
      'users',
      user.$id,
      updateData
    );
  } catch (error) {
    handleError(error, 'updateUser');
  }
}

// ==================== ARTISTS ====================
export async function createArtist(artistData, userId = 'anonymous') {
  try {
    const artist = {
      name: artistData.name,
      bio: artistData.bio || '',
      avatar: artistData.avatar || null,
      coverImage: artistData.coverImage || null,
      country: artistData.country || null,
      verified: artistData.verified || false,
      monthlyListeners: artistData.monthlyListeners || 0,
      totalStreams: artistData.totalStreams || 0
    };

    return await databases.createDocument(
      DATABASE_ID, 
      'artists', 
      ID.unique(), 
      artist,
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  } catch (error) {
    handleError(error, 'createArtist');
  }
}

export async function getAllArtists(limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'artists', [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('$createdAt'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getAllArtists:', error);
    return [];
  }
}

export async function getArtistById(artistId) {
  try {
    return await databases.getDocument(DATABASE_ID, 'artists', artistId);
  } catch (error) {
    console.error('Erreur getArtistById:', error);
    return null;
  }
}

export async function updateArtist(artistId, updateData) {
  try {
    return await databases.updateDocument(DATABASE_ID, 'artists', artistId, updateData);
  } catch (error) {
    handleError(error, 'updateArtist');
  }
}

export async function deleteArtist(artistId) {
  try {
    return await databases.deleteDocument(DATABASE_ID, 'artists', artistId);
  } catch (error) {
    handleError(error, 'deleteArtist');
  }
}

export async function searchArtists(searchTerm, limit = 20) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'artists', [
      Query.search('name', searchTerm),
      Query.limit(limit),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur searchArtists:', error);
    return [];
  }
}

// ==================== ALBUMS ====================
export async function createAlbum(albumData, userId = 'anonymous') {
  try {
    const album = {
      title: albumData.title,
      artistId: albumData.artistId,
      coverImage: albumData.coverImage || null,
      releaseDate: albumData.releaseDate,
      genre: albumData.genre || null,
      type: albumData.type || 'album',
      totalTracks: albumData.totalTracks || 0,
      duration: albumData.duration || 0,
      description: albumData.description || '',
      totalStreams: albumData.totalStreams || 0
    };

    return await databases.createDocument(
      DATABASE_ID, 
      'albums', 
      ID.unique(), 
      album,
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  } catch (error) {
    handleError(error, 'createAlbum');
  }
}

export async function getAllAlbums(limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'albums', [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('$createdAt'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getAllAlbums:', error);
    return [];
  }
}

export async function getAlbumById(albumId) {
  try {
    return await databases.getDocument(DATABASE_ID, 'albums', albumId);
  } catch (error) {
    console.error('Erreur getAlbumById:', error);
    return null;
  }
}

export async function getAlbumsByArtist(artistId, limit = 20) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'albums', [
      Query.equal('artistId', artistId),
      Query.limit(limit),
      Query.orderDesc('releaseDate'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getAlbumsByArtist:', error);
    return [];
  }
}

export async function updateAlbum(albumId, updateData) {
  try {
    return await databases.updateDocument(DATABASE_ID, 'albums', albumId, updateData);
  } catch (error) {
    handleError(error, 'updateAlbum');
  }
}

export async function deleteAlbum(albumId) {
  try {
    return await databases.deleteDocument(DATABASE_ID, 'albums', albumId);
  } catch (error) {
    handleError(error, 'deleteAlbum');
  }
}

export async function searchAlbums(searchTerm, limit = 20) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'albums', [
      Query.search('title', searchTerm),
      Query.limit(limit),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur searchAlbums:', error);
    return [];
  }
}

// ==================== SONGS ====================
export async function createSong(songData, userId = 'anonymous') {
  try {
    const song = {
      title: songData.title,
      artistId: songData.artistId,
      albumId: songData.albumId || null,
      audioFileId: songData.audioFileId,
      coverImage: songData.coverImage || null,
      duration: songData.duration || 0,
      trackNumber: songData.trackNumber || 1,
      genre: songData.genre || null,
      releaseDate: songData.releaseDate || new Date().toISOString().split('T')[0],
      lyrics: songData.lyrics || '',
      explicit: songData.explicit || false,
      streamCount: songData.streamCount || 0,
      likeCount: songData.likeCount || 0,
      description: songData.description || '',
      tags: songData.tags || [],
      credits: songData.credits || {
        producer: '',
        composer: '',
        lyricist: '',
        studio: ''
      },
      annotations: songData.annotations || []
    };

    return await databases.createDocument(
      DATABASE_ID, 
      'songs', 
      ID.unique(), 
      song,
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  } catch (error) {
    handleError(error, 'createSong');
  }
}

export async function getAllSongs(limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'songs', [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('$createdAt'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getAllSongs:', error);
    return [];
  }
}

export async function getSongById(songId) {
  try {
    return await databases.getDocument(DATABASE_ID, 'songs', songId);
  } catch (error) {
    console.error('Erreur getSongById:', error);
    return null;
  }
}

export async function getSongsByArtist(artistId, limit = 50) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'songs', [
      Query.equal('artistId', artistId),
      Query.limit(limit),
      Query.orderDesc('$createdAt'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getSongsByArtist:', error);
    return [];
  }
}

export async function getSongsByAlbum(albumId, limit = 50) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'songs', [
      Query.equal('albumId', albumId),
      Query.limit(limit),
      Query.orderAsc('trackNumber'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getSongsByAlbum:', error);
    return [];
  }
}

export async function getSongsByGenre(genre, limit = 50) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'songs', [
      Query.equal('genre', genre),
      Query.limit(limit),
      Query.orderDesc('streamCount'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getSongsByGenre:', error);
    return [];
  }
}

export async function updateSong(songId, updateData) {
  try {
    return await databases.updateDocument(DATABASE_ID, 'songs', songId, updateData);
  } catch (error) {
    handleError(error, 'updateSong');
  }
}

export async function deleteSong(songId) {
  try {
    return await databases.deleteDocument(DATABASE_ID, 'songs', songId);
  } catch (error) {
    handleError(error, 'deleteSong');
  }
}

export async function searchSongs(searchTerm, limit = 20) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'songs', [
      Query.search('title', searchTerm),
      Query.limit(limit),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur searchSongs:', error);
    return [];
  }
}

export async function getPopularSongs(limit = 20) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'songs', [
      Query.limit(limit),
      Query.orderDesc('streamCount'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getPopularSongs:', error);
    return [];
  }
}

export async function updateSongStats(songId, incrementStreams = false, incrementLikes = false) {
  try {
    const song = await getSongById(songId);
    if (!song) throw new Error('Chanson non trouvée');

    const updateData = {};
    if (incrementStreams) {
      updateData.streamCount = (song.streamCount || 0) + 1;
    }
    if (incrementLikes) {
      updateData.likeCount = (song.likeCount || 0) + 1;
    }

    return await databases.updateDocument(DATABASE_ID, 'songs', songId, updateData);
  } catch (error) {
    console.error('Erreur updateSongStats:', error);
    return null;
  }
}

// ==================== PLAYLISTS ====================
export async function createPlaylist(playlistData, userId) {
  try {
    const playlist = {
      name: playlistData.name,
      description: playlistData.description || '',
      coverImage: playlistData.coverImage || null,
      ownerId: userId,
      isPublic: playlistData.isPublic !== undefined ? playlistData.isPublic : true,
      collaborative: playlistData.collaborative || false,
      totalTracks: playlistData.totalTracks || 0,
      totalDuration: playlistData.totalDuration || 0,
      followerCount: playlistData.followerCount || 0
    };

    return await databases.createDocument(
      DATABASE_ID, 
      'playlists', 
      ID.unique(), 
      playlist,
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  } catch (error) {
    handleError(error, 'createPlaylist');
  }
}

export async function getPlaylistById(playlistId) {
  try {
    return await databases.getDocument(DATABASE_ID, 'playlists', playlistId);
  } catch (error) {
    console.error('Erreur getPlaylistById:', error);
    return null;
  }
}

export async function getUserPlaylists(userId, limit = 50) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'playlists', [
      Query.equal('ownerId', userId),
      Query.limit(limit),
      Query.orderDesc('$createdAt'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getUserPlaylists:', error);
    return [];
  }
}

export async function getPublicPlaylists(limit = 50) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'playlists', [
      Query.equal('isPublic', true),
      Query.limit(limit),
      Query.orderDesc('followerCount'),
    ]);
    return response.documents;
  } catch (error) {
    console.error('Erreur getPublicPlaylists:', error);
    return [];
  }
}

export async function updatePlaylist(playlistId, updateData) {
  try {
    return await databases.updateDocument(DATABASE_ID, 'playlists', playlistId, updateData);
  } catch (error) {
    handleError(error, 'updatePlaylist');
  }
}

export async function deletePlaylist(playlistId) {
  try {
    return await databases.deleteDocument(DATABASE_ID, 'playlists', playlistId);
  } catch (error) {
    handleError(error, 'deletePlaylist');
  }
}

// ==================== LIKES ====================
export async function likeSong(userId, songId) {
  try {
    // Vérifier si le like existe déjà
    const existingLike = await databases.listDocuments(DATABASE_ID, 'likes', [
      Query.equal('userId', userId),
      Query.equal('songId', songId),
      Query.limit(1),
    ]);

    if (existingLike.documents.length > 0) {
      throw new Error('Chanson déjà likée');
    }

    // Créer le like
    const like = await databases.createDocument(
      DATABASE_ID,
      'likes',
      ID.unique(),
      { userId, songId },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );

    // Incrémenter le compteur de likes de la chanson
    await updateSongStats(songId, false, true);

    return like;
  } catch (error) {
    handleError(error, 'likeSong');
  }
}

export async function unlikeSong(userId, songId) {
  try {
    const existingLike = await databases.listDocuments(DATABASE_ID, 'likes', [
      Query.equal('userId', userId),
      Query.equal('songId', songId),
      Query.limit(1),
    ]);

    if (existingLike.documents.length === 0) {
      throw new Error('Like non trouvé');
    }

    await databases.deleteDocument(DATABASE_ID, 'likes', existingLike.documents[0].$id);

    // Décrémenter le compteur de likes de la chanson
    const song = await getSongById(songId);
    if (song && song.likeCount > 0) {
      await databases.updateDocument(DATABASE_ID, 'songs', songId, {
        likeCount: song.likeCount - 1
      });
    }

    return true;
  } catch (error) {
    console.error('Erreur unlikeSong:', error);
    return false;
  }
}

export async function getUserLikedSongs(userId, limit = 50) {
  try {
    const likes = await databases.listDocuments(DATABASE_ID, 'likes', [
      Query.equal('userId', userId),
      Query.limit(limit),
      Query.orderDesc('$createdAt'),
    ]);

    // Récupérer les détails des chansons likées
    const songIds = likes.documents.map(like => like.songId);
    if (songIds.length === 0) return [];

    const songs = await Promise.all(
      songIds.map(songId => getSongById(songId))
    );

    return songs.filter(song => song !== null);
  } catch (error) {
    console.error('Erreur getUserLikedSongs:', error);
    return [];
  }
}

export async function isLikedByUser(userId, songId) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'likes', [
      Query.equal('userId', userId),
      Query.equal('songId', songId),
      Query.limit(1),
    ]);
    return response.documents.length > 0;
  } catch (error) {
    console.error('Erreur isLikedByUser:', error);
    return false;
  }
}

// ==================== STORAGE ====================
export async function uploadAudioFile(file, userId = 'anonymous') {
  try {
    const fileUpload = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file,
      [
        Permission.read(Role.any()),
        Permission.delete(Role.user(userId)),
      ]
    );
    return fileUpload;
  } catch (error) {
    handleError(error, 'uploadAudioFile');
  }
}

export async function uploadImage(file, userId = 'anonymous') {
  try {
    const fileUpload = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file,
      [
        Permission.read(Role.any()),
        Permission.delete(Role.user(userId)),
      ]
    );
    return fileUpload;
  } catch (error) {
    handleError(error, 'uploadImage');
  }
}

export function getFilePreview(fileId, width = 400, height = 400) {
  try {
    return storage.getFilePreview(BUCKET_ID, fileId, width, height);
  } catch (error) {
    console.error('Erreur getFilePreview:', error);
    return null;
  }
}

export function getFileView(fileId) {
  try {
    return storage.getFileView(BUCKET_ID, fileId);
  } catch (error) {
    console.error('Erreur getFileView:', error);
    return null;
  }
}

export function getFileDownload(fileId) {
  try {
    return storage.getFileDownload(BUCKET_ID, fileId);
  } catch (error) {
    console.error('Erreur getFileDownload:', error);
    return null;
  }
}

export async function deleteFile(fileId) {
  try {
    return await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error) {
    console.error('Erreur deleteFile:', error);
    return false;
  }
}

// ==================== AUTHENTICATION ====================
export async function createAccount(email, password, name) {
  try {
    return await account.create(ID.unique(), email, password, name);
  } catch (error) {
    handleError(error, 'createAccount');
  }
}

export async function loginUser(email, password) {
  try {
    return await account.createEmailSession(email, password);
  } catch (error) {
    handleError(error, 'loginUser');
  }
}

export async function logoutUser() {
  try {
    return await account.deleteSession('current');
  } catch (error) {
    console.error('Erreur logoutUser:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.error('Erreur getCurrentUser:', error);
    return null;
  }
}

// ==================== RECHERCHE GLOBALE ====================
export async function globalSearch(searchTerm, limit = 20) {
  try {
    const [songs, artists, albums] = await Promise.all([
      searchSongs(searchTerm, limit),
      searchArtists(searchTerm, limit),
      searchAlbums(searchTerm, limit)
    ]);

    return {
      songs,
      artists,
      albums,
      total: songs.length + artists.length + albums.length
    };
  } catch (error) {
    console.error('Erreur globalSearch:', error);
    return { songs: [], artists: [], albums: [], total: 0 };
  }
}

// ==================== STATISTIQUES ====================
export async function getStats() {
  try {
    const [songsCount, artistsCount, albumsCount, playlistsCount] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'songs', [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, 'artists', [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, 'albums', [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, 'playlists', [Query.limit(1)])
    ]);

    return {
      songs: songsCount.total,
      artists: artistsCount.total,
      albums: albumsCount.total,
      playlists: playlistsCount.total
    };
  } catch (error) {
    console.error('Erreur getStats:', error);
    return { songs: 0, artists: 0, albums: 0, playlists: 0 };
  }
}

// ==================== UTILITAIRES ====================
export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ==================== EXPORTS COMPLETS ====================
export { 
  client, 
  databases, 
  storage, 
  account, 
  DATABASE_ID, 
  BUCKET_ID,
  PROJECT_ID,
  API_ENDPOINT
};

// Export par défaut
export default {
  // Users
  createUser,
  getUserByUserId,
  getUserByEmail,
  updateUser,
  
  // Artists
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  searchArtists,
  
  // Albums
  createAlbum,
  getAllAlbums,
  getAlbumById,
  getAlbumsByArtist,
  updateAlbum,
  deleteAlbum,
  searchAlbums,
  
  // Songs
  createSong,
  getAllSongs,
  getSongById,
  getSongsByArtist,
  getSongsByAlbum,
  getSongsByGenre,
  updateSong,
  deleteSong,
  searchSongs,
  getPopularSongs,
  updateSongStats,
  
  // Playlists
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  getPublicPlaylists,
  updatePlaylist,
  deletePlaylist,
  
  // Likes
  likeSong,
  unlikeSong,
  getUserLikedSongs,
  isLikedByUser,
  
  // Storage
  uploadAudioFile,
  uploadImage,
  getFilePreview,
  getFileView,
  getFileDownload,
  deleteFile,
  
  // Auth
  createAccount,
  loginUser,
  logoutUser,
  getCurrentUser,
  
  // Search
  globalSearch,
  
  // Stats
  getStats,
  
  // Utils
  formatDuration,
  formatNumber
};

