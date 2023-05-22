import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { getDocument, updateDocument, updateDocumentName } from './controller/document.js';
import { mongoose } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);
console.log(PORT)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

io.on('connection', (socket) => {
  socket.on('get-document', async (documentId) => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('update-document-name', async (newName) => {
      await updateDocumentName(documentId, newName);
      socket.broadcast.to(documentId).emit('update-document-name', newName);
    });

    socket.on('save-document', async (data, newName) => {
      await updateDocument(documentId, data);
    });
  });
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
