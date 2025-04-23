import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('https://ebookstore-hqlf.onrender.com/api/books');
      setBooks(res.data);
    } catch (error) {
      setError('Error fetching books: ' + error.message);
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);

      setLoading(true);
      await axios.post(
        'https://ebookstore-hqlf.onrender.com/api/books/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      alert('Upload successful!');
      setTitle('');
      setCategory('');
      setFile(null);
      fetchBooks();
    } catch (error) {
      setError('Upload failed: ' + (error.response?.data?.message || error.message));
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        setLoading(true);
        await axios.delete(`https://ebookstore-hqlf.onrender.com/api/books/delete/${publicId}`);
        fetchBooks();
      } catch (error) {
        setError('Delete failed: ' + (error.response?.data?.message || error.message));
        console.error('Delete failed:', error);
      } finally {
        setLoading(false);
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-gray-50 p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload a New Book</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <input 
            type="file" 
            onChange={e => setFile(e.target.files[0])} 
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
            required
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Books Listing Section */}
      {loading && books.length === 0 ? (
        <div className="text-center">Loading books...</div>
      ) : (
        Object.entries(booksByCategory).map(([category, booksInCategory]) => (
          <div key={category} className="mb-6">
            <h3 className="text-xl font-bold mb-2">{category}</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Title</th>
                  <th className="border px-4 py-2">View/Open Book</th>
                  <th className="border px-4 py-2">Download</th>
                  <th className="border px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {booksInCategory.map(book => (
                  <tr key={book.publicId} className="text-center">
                    <td className="border px-4 py-2 text-left">{book.title}</td>
                    <td className="border px-4 py-2">
                      <a
                        href={`https://ebookstore-hqlf.onrender.com/api/books/view/${book.publicId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        View
                      </a>
                    </td>
                    <td className="border px-4 py-2">
                      <a
                        href={`https://ebookstore-hqlf.onrender.com/api/books/download/${book.publicId}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Download
                      </a>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDelete(book.publicId)}
                        disabled={loading}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default App;