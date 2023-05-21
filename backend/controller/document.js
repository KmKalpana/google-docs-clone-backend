import Document from '../schema/documentSchema.js';

export const getDocument = async(id) => {
    if(id===null) return;
    const document = await Document.findById(id);


      if (document) return document;
  return await Document.create({ _id: id, data: "", name: "Google Docs" });
}

export const updateDocument = async(id, data) => {
    return await Document.findByIdAndUpdate(id, {data});
}

export const updateDocumentName = async (id, name) => {
  return await Document.findByIdAndUpdate(id, { name });
};