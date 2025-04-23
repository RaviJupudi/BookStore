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
      
      if (Array.isArray(res.data)) {
        const validBooks = res.data.filter(book => 
          book.publicId && book.url && book.title
        );
        setBooks(validBooks);
      } else {
        throw new Error('Invalid response format from server');
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
      const response = await axios.post(
        'https://ebookstore-hqlf.onrender.com/api/books/upload',
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.publicId) {
        setTitle('');
        setCategory('');
        setFile(null);
        setError(null);
        await fetchBooks();
      } else {
        throw new Error('Invalid response from server after upload');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId) => {
    if (!publicId) {
      setError('Invalid book reference');
      return;
    }

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

  const handleViewBook = async (publicId) => {
    if (!publicId) {
      setError('Cannot view book - missing reference');
      return;
    }
    
    try {
      // First verify the book exists
      const bookExists = books.some(book => book.publicId === publicId);
      if (!bookExists) {
        throw new Error('Book not found in database');
      }
      
      // Generate the direct Cloudinary URL with proper resource type
      const viewUrl = `https://res.cloudinary.com/dafyhvdns/image/upload/${publicId}`;
      
      // Test if the URL is accessible
      const testResponse = await fetch(viewUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error('File not found in Cloudinary');
      }
      
      // Open in new window
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('View failed:', error);
      setError('View failed: ' + error.message);
    }
  };

  const handleDownload = async (publicId) => {
    if (!publicId) {
      setError('Cannot download book - missing reference');
      return;
    }
    
    try {
      // First verify the book exists
      const bookExists = books.some(book => book.publicId === publicId);
      if (!bookExists) {
        throw new Error('Book not found in database');
      }
      
      // Create a temporary anchor tag for download
      const downloadUrl = `https://res.cloudinary.com/dafyhvdns/raw/upload/fl_attachment/${publicId}`;
      
      // Test if the URL is accessible
      const testResponse = await fetch(downloadUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error('File not found in Cloudinary');
      }
      
      // Trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'download'; // You can extract filename from book data if available
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed: ' + error.message);
    }
  };

  // Group books by category safely
  const booksByCategory = books.reduce((group, book) => {
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
          <button 
            onClick={() => setError(null)} 
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-gray-50 p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload a New Book</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <input 
            type="file" 
            onChange={e => setFile(e.target.files?.[0] || null)} 
            className="border p-2 rounded"
            accept=".pdf,.epub,.doc,.docx"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-2 rounded w-full md:w-40"
            disabled={loading}
          />
          <button
            onClick={handleUpload}
            disabled={loading || !file || !title.trim()}
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
            <div className="overflow-x-auto">
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
                    <tr key={book.publicId} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-left">{book.title}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleViewBook(book.publicId)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-300"
                          disabled={loading}
                        >
                          View
                        </button>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleDownload(book.publicId)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300"
                          disabled={loading}
                        >
                          Download
                        </button>
                      </td>
                      <td className="border px-4 py-2 text-center">
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
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No books available. Upload one to get started!
        </div>
      )}
    </div>
  );
}

export default App;