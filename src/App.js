import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('https://ebookstore-hqlf.onrender.com/api/books');
      
      if (Array.isArray(res.data)) {
        setBooks(res.data);
      } else {
        console.error('Invalid response format:', res.data);
        setBooks([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books. Please try again later.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category || 'Uncategorized');

      setLoading(true);
      await axios.post(
        'https://ebookstore-hqlf.onrender.com/api/books/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setTitle('');
      setCategory('');
      setFile(null);
      setError(null);
      await fetchBooks();
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        setLoading(true);
        await axios.delete(`https://ebookstore-hqlf.onrender.com/api/books/delete/${publicId}`);
        await fetchBooks();
      } catch (error) {
        console.error('Delete failed:', error);
        setError('Delete failed: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
  };

  const handleCloseViewer = () => {
    setSelectedBook(null);
  };

  // Safe booksByCategory calculation
  const booksByCategory = (books || []).reduce((group, book) => {
    const categoryName = book?.category || 'Uncategorized';
    group[categoryName] = group[categoryName] || [];
    group[categoryName].push(book);
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
            accept=".pdf,.epub,.doc,.docx"
          />
          <input
            type="text"
            placeholder="Title *"
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
        <div className="text-center py-8">Loading books...</div>
      ) : Object.keys(booksByCategory).length > 0 ? (
        Object.entries(booksByCategory).map(([category, booksInCategory]) => (
          <div key={category} className="mb-6">
            <h3 className="text-xl font-bold mb-2">{category}</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Title</th>
                  <th className="border px-4 py-2">View</th>
                  <th className="border px-4 py-2">Download</th>
                  <th className="border px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {booksInCategory.map(book => (
                  <tr key={book.publicId} className="text-center">
                    <td className="border px-4 py-2 text-left">{book.title}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleViewBook(book)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        View
                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <a
                        href={`https://ebookstore-hqlf.onrender.com/api/books/download/${book.publicId}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        download
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
      ) : (
        <div className="text-center py-8">
          No books available. Upload one to get started!
        </div>
      )}

      {/* PDF Viewer Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">{selectedBook.title}</h2>
              <button
                onClick={handleCloseViewer}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={`https://ebookstore-hqlf.onrender.com/api/books/view/${selectedBook.publicId}`}
                title={selectedBook.title}
                width="100%"
                height="600px"
                className="border shadow"
              ></iframe>
            </div>
            <div className="border-t p-4 flex justify-end">
              <a
                href={`https://ebookstore-hqlf.onrender.com/api/books/download/${selectedBook.publicId}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                download
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;