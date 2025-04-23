import React from 'react';

const BookCard = ({ book }) => {
  return (
    <div className="book-card">
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <p>{book.description}</p>
      <p>{book.price}</p>
      <button onClick={() => alert('Download functionality coming soon!')}>
        Download
      </button>
    </div>
  );
};

export default BookCard;