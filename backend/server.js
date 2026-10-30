require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const http     = require('http'); // <-- NUEVO
const { Server } = require('socket.io'); // <-- NUEVO

const authRoutes       = require('./routes/auth');
const IniciativaRoutes = require('./routes/iniciativa.routes');
const SolicitudRoutes  = require('./routes/solicitud.routes');
const EquipoRoutes     = require('./routes/equipo.routes');
const EntornoRoutes    = require('./routes/entorno.routes');
const MensajeRoutesFactory = require('./routes/mensaje.routes'); // <-- Asegúrate de tenerlo

const app  = express();
const server = http.createServer(app); // <-- NUEVO: Creamos el servidor HTTP

// Configuración de Socket.io con CORS habilitado
const io = new Server(server, {
  cors: {
    origin: '*', // Permite conexiones desde cualquier puerto (ideal para dev)
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/iniciativas', IniciativaRoutes);
app.use('/api/solicitudes', SolicitudRoutes);
app.use('/api/equipos', EquipoRoutes);
app.use('/api/entornos', EntornoRoutes);
app.use('/api/mensajes', MensajeRoutesFactory(io));

// ==========================================
// CONFIGURACIÓN DE SOCKET.IO
// ==========================================
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado:', socket.id);

  // El frontend nos dice a qué entorno se está uniendo
  socket.on('unirse_entorno', (entornoId) => {
    socket.join(entornoId);
    console.log(`👤 Usuario ${socket.id} se unió al entorno ${entornoId}`);
  });

  // El frontend nos envía un mensaje
  socket.on('nuevo_mensaje', (data) => {
    // data = { entornoId, mensaje }
    // Reenviamos el mensaje a TODOS los que estén en ese entorno
    io.to(data.entornoId).emit('mensaje_recibido', data.mensaje);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado:', socket.id);
  });
});

// Usamos "server.listen" en lugar de "app.listen"
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error:', err));