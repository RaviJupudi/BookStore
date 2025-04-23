import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';



function App() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await axios.get('https://ebookstore-hqlf.onrender.com/books');
    setBooks(res.data);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    await axios.post('https://ebookstore-hqlf.onrender.com/books', formData);
    fetchBooks();
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Bookstore Upload & Viewer</h1>

      <div className="mb-6">
        <input type="file" onChange={e => setFile(e.target.files[0])} className="mb-2" />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-1 mr-2"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border p-1 mr-2"
        />
        <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-1 rounded">Upload</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="border rounded p-2 shadow">
            <h3 className="font-semibold">{book.title}</h3>
            <p className="text-sm text-gray-600">{book.category}</p>
            <button
              onClick={() => setSelectedBookId(book.id)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
            >
              View Book
            </button>
          </div>
        ))}
      </div>

      {selectedBookId && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Reading Book</h2>
          <iframe
            src={`https://ebookstore-hqlf.onrender.com/books/${selectedBookId}/stream`}
            title="PDF Viewer"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default App;
