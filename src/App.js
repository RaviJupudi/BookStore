import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);

      const response = await axios.post(
        'https://ebookstore-hqlf.onrender.com/books',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      alert(response.data);
      setTitle('');
      setCategory('');
      setFile(null);
      fetchBooks();
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      alert('Upload failed: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`https://ebookstore-hqlf.onrender.com/books/${id}`);
        fetchBooks();
      } catch (error) {
        alert('Delete failed: ' + (error.response?.data || error.message));
      }
    }
  };

  const booksByCategory = books.reduce((group, book) => {
    group[book.category] = group[book.category] || [];
    group[book.category].push(book);
    return group;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Bookstore Upload & Viewer</h1>
  
      {/* Upload Section */}
      <div className="bg-gray-50 p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload a New Book</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </div>
      </div>
  
      {/* Books Listing Section */}
      {Object.entries(
        books.reduce((acc, book) => {
          acc[book.category] = acc[book.category] || [];
          acc[book.category].push(book);
          return acc;
        }, {})
      ).map(([category, booksInCategory]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xl font-bold mb-2">{category}</h3>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2">View/Open Book</th>
                <th className="border px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {booksInCategory.map(book => (
                <tr key={book.id} className="text-center">
                  <td className="border px-4 py-2 text-left">{book.title}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => setSelectedBookId(book.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      View
                    </button>
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
  
      {/* PDF Viewer */}
      {selectedBookId && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-2">📖 Reading Book</h2>
          <iframe
            src={`https://ebookstore-hqlf.onrender.com/books/${selectedBookId}/stream`}
            title="PDF Viewer"
            width="100%"
            height="600px"
            className="border shadow"
          ></iframe>
        </div>
      )}
    </div>
  );
  
}

export default App;
