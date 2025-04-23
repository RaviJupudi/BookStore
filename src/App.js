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
    try {
      const res = await axios.get('https://ebookstore-hqlf.onrender.com/books');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const groupByCategory = (books) => {
    return books.reduce((acc, book) => {
      if (!acc[book.category]) {
        acc[book.category] = [];
      }
      acc[book.category].push(book);
      return acc;
    }, {});
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
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert(response.data);
      setFile(null);
      setTitle('');
      setCategory('');
      fetchBooks();
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      alert('Upload failed: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await axios.delete(`https://ebookstore-hqlf.onrender.com/books/${id}`);
      fetchBooks();
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      alert('Delete failed: ' + (err.response?.data || err.message));
    }
  };

  const categorizedBooks = groupByCategory(books);

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">📚 Bookstore</h1>

      {Object.keys(categorizedBooks).map((cat) => (
        <div key={cat} className="mb-10">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">{cat}</h2>
          <table className="w-full table-auto border border-gray-400 shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-400 px-4 py-2 text-left">Title</th>
                <th className="border border-gray-400 px-4 py-2 text-center">View/Open</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {categorizedBooks[cat].map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{book.title}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedBookId(book.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      View Book
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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

      <hr className="my-8" />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">📤 Upload a New Book</h2>
        <input type="file" onChange={e => setFile(e.target.files[0])} className="mb-2 block" />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2 mr-2 mb-2 w-full md:w-auto"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border p-2 mr-2 mb-2 w-full md:w-auto"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>

      {selectedBookId && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-2">📖 Reading Book</h2>
          <iframe
            src={`https://ebookstore-hqlf.onrender.com/books/${selectedBookId}/stream`}
            title="PDF Viewer"
            width="100%"
            height="600px"
            className="border border-gray-300"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default App;
