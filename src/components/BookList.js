import React, { useEffect, useState } from 'react';
import { getBooks } from '../api';
import BookCard from './BookCard';

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="book-list">
      {books.length > 0 ? (
        books.map((book) => <BookCard key={book.id} book={book} />)
      ) : (
        <p>No books available</p>
      )}
    </div>
  );
};

export default BookList;