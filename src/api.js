import axios from 'axios';

const API_URL = 'https://ebookstore-hqlf.onrender.com/api';

export const getBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};