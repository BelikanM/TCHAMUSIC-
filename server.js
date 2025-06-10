import express from 'express';
import mysql from 'mysql2/promise';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Configuration MySQL
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'BelikanM',
  password: process.env.DB_PASSWORD || 'Dieu19961991??!??!',
  database: process.env.DB_NAME || 'TchaMusic',
  charset: 'utf8mb4'
};

// Pool de connexions MySQL
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configuration Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// ==================== ROUTES API ====================

// Route de test
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    res.json({ 
      message: 'Connexion MySQL réussie', 
      data: rows,
      storage: 'MySQL Database Storage Active',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur MySQL:', error);
    res.status(500).json({ 
      error: 'Erreur de connexion MySQL', 
      details: error.message 
    });
  }
});

// Route pour récupérer tous les genres
app.get('/api/genres', async (req, res) => {
  try {
    const [genres] = await pool.execute('SELECT * FROM genres ORDER BY name');
    res.json(genres);
  } catch (error) {
    console.error('Erreur récupération genres:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des genres', 
      details: error.message 
    });
  }
});

// Route pour récupérer toutes les chansons
app.get('/api/songs', async (req, res) => {
  try {
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.duration, s.release_date, s.stream_count, s.like_count,
             a.name as artist_name, a.verified as artist_verified, g.name as genre_name
      FROM songs s 
      LEFT JOIN artists a ON s.artist_id = a.id 
      LEFT JOIN genres g ON s.genre_id = g.id 
      WHERE s.is_public = true 
      ORDER BY s.created_at DESC
      LIMIT 50
    `);

    res.json(songs);
  } catch (error) {
    console.error('Erreur récupération chansons:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des chansons', 
      details: error.message 
    });
  }
});

// Route d'upload de fichiers
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    const { userId = 'anonymous', type = 'unknown' } = req.body;
    const fileBase64 = req.file.buffer.toString('base64');
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;
    const fileId = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Créer la table si elle n'existe pas
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS file_storage (
        id VARCHAR(255) PRIMARY KEY,
        file_name VARCHAR(500) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        file_data LONGTEXT NOT NULL,
        uploaded_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insérer le fichier
    await pool.execute(
      'INSERT INTO file_storage (id, file_name, file_type, file_size, file_data, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [fileId, fileName, fileType, fileSize, fileBase64, userId]
    );

    res.json({
      message: 'Fichier uploadé avec succès',
      fileId: fileId,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload', 
      details: error.message 
    });
  }
});

// Route pour créer un artiste
app.post('/api/artists', async (req, res) => {
  try {
    const { 
      name, 
      bio = '', 
      verified = false, 
      monthlyListeners = 0, 
      userId = 'anonymous' 
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom de l\'artiste est requis' });
    }

    // Vérifier si l'artiste existe déjà
    const [existing] = await pool.execute(
      'SELECT * FROM artists WHERE name = ? LIMIT 1',
      [name]
    );

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    // Créer un nouvel artiste
    const [result] = await pool.execute(
      'INSERT INTO artists (user_id, name, bio, verified, monthly_listeners) VALUES (?, ?, ?, ?, ?)',
      [userId, name, bio, verified, monthlyListeners]
    );

    // Récupérer l'artiste créé
    const [newArtist] = await pool.execute(
      'SELECT * FROM artists WHERE id = ?',
      [result.insertId]
    );

    res.json(newArtist[0]);

  } catch (error) {
    console.error('Erreur création artiste:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'artiste', 
      details: error.message 
    });
  }
});

// Route pour les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const [songCount] = await pool.execute('SELECT COUNT(*) as count FROM songs WHERE is_public = true');
    const [artistCount] = await pool.execute('SELECT COUNT(*) as count FROM artists');
    const [genreCount] = await pool.execute('SELECT COUNT(*) as count FROM genres');

    res.json({
      songs: songCount[0].count,
      artists: artistCount[0].count,
      genres: genreCount[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques', 
      details: error.message 
    });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'TchaMusic API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API TchaMusic! 🎵',
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      songs: '/api/songs',
      genres: '/api/genres',
      upload: 'POST /api/upload',
      artists: 'POST /api/artists',
      stats: '/api/stats',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('\n🚀 ═══════════════════════════════════');
  console.log('   SERVEUR TCHAMUSIC DÉMARRÉ');
  console.log('🚀 ═══════════════════════════════════');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`💾 Base: MySQL (${dbConfig.database})`);
  console.log('🚀 ═══════════════════════════════════\n');
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  try {
    await pool.end();
    console.log('✅ Connexions MySQL fermées');
  } catch (error) {
    console.error('❌ Erreur fermeture MySQL:', error);
  }
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

