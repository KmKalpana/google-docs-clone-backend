import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { mongoose } from 'mongoose';
import { Server } from 'socket.io';
import cors from 'cors';
import { getDocument, updateDocument, updateDocumentName } from './controller/document.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
//app.use(cors())
app.use(cors({
origin:"https://google-docs-clone-frontend-js4w.vercel.app"
}))
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL,"https://google-docs-clone-frontend-js4w.vercel.app"],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
// console.log(MONGODB_URI);
// console.log(PORT)

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
