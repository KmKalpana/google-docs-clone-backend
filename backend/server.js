import { Server } from "socket.io";
import { getDocument, updateDocument, updateDocumentName } from "./controller/document.js";
import { mongoose } from "mongoose";
import dotenv from 'dotenv'
dotenv.config();
const PORT = process.env.PORT || 5000
console.log(PORT)
const io = new Server(PORT, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const MONGODB_URI=process.env.MONGODB_URI
console.log(MONGODB_URI)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

io.on('connection', socket => {
  socket.on('get-document', async documentId => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

  socket.on('update-document-name', async(newName) =>{
        await updateDocumentName(documentId, newName);
        socket.broadcast.to(documentId).emit('update-document-name', newName)
  })
    socket.on('save-document', async (data, newName) => {
      await updateDocument(documentId, data);
    });
  });
});
