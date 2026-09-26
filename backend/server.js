require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const authRoutes       = require('./routes/auth');
const IniciativaRoutes = require('./routes/iniciativa.routes');
const SolicitudRoutes  = require('./routes/solicitud.routes');
const EquipoRoutes     = require('./routes/equipo.routes');
const EntornoRoutes    = require('./routes/entorno.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/iniciativas', IniciativaRoutes);
app.use('/api/solicitudes', SolicitudRoutes);
app.use('/api/equipos', EquipoRoutes);
app.use('/api/entornos', EntornoRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error:', err));