import Book from '../models/Book.js';

const BOOK_FIELDS = [
  'title', 'author', 'description', 'genre', 'isbn', 'price', 'originalPrice',
  'coverUrl', 'stock', 'isFeatured', 'isNewArrival', 'isBestSeller',
];

const pickBookFields = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return Object.fromEntries(BOOK_FIELDS.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]]));
};

const validateBook = ({ title, author, price, stock, originalPrice }) => {
  if (typeof title !== 'string' || !title.trim()) return 'Title is required';
  if (typeof author !== 'string' || !author.trim()) return 'Author is required';
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    return 'Price must be a number greater than or equal to 0';
  }
  if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a non-negative integer';
  if (originalPrice !== '' && (typeof originalPrice !== 'number' || !Number.isFinite(originalPrice) || originalPrice < price)) {
    return 'Original price must be empty or a number greater than or equal to price';
  }
  return null;
};

const calculatePricing = (price, originalPrice) => {
  const adjustedOriginalPrice = originalPrice > price ? originalPrice : 0;
  return {
    originalPrice: adjustedOriginalPrice,
    discount: adjustedOriginalPrice > price ? Math.round((1 - price / adjustedOriginalPrice) * 100) : 0,
  };
};

export const getBooks = async (req, res, next) => {
  try {
    const { search, genre, sort, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) query.genre = genre;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const getFeatured = async (req, res, next) => {
  try {
    const books = await Book.find({ isFeatured: true }).limit(10).sort({ createdAt: -1 });
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const books = await Book.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const getBestSellers = async (req, res, next) => {
  try {
    const books = await Book.find({ isBestSeller: true }).limit(10);
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const values = pickBookFields(req.body);
    const originalPrice = values.originalPrice === undefined || values.originalPrice === '' ? 0 : values.originalPrice;
    const validationError = validateBook({ ...values, originalPrice });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    Object.assign(values, {
      title: values.title.trim(),
      author: values.author.trim(),
      ...calculatePricing(values.price, originalPrice),
    });
    const book = await Book.create(values);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const values = pickBookFields(req.body);
    const price = Object.hasOwn(values, 'price') ? values.price : book.price;
    const stock = Object.hasOwn(values, 'stock') ? values.stock : book.stock;
    const title = Object.hasOwn(values, 'title') ? values.title : book.title;
    const author = Object.hasOwn(values, 'author') ? values.author : book.author;
    const originalPrice = Object.hasOwn(values, 'originalPrice')
      ? values.originalPrice
      : (book.originalPrice > price ? book.originalPrice : 0);
    const pricingOriginalPrice = originalPrice === '' ? 0 : originalPrice;
    const validationError = validateBook({ title, author, price, stock, originalPrice });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (Object.hasOwn(values, 'title')) values.title = title.trim();
    if (Object.hasOwn(values, 'author')) values.author = author.trim();
    Object.assign(values, calculatePricing(price, pricingOriginalPrice));
    book.set(values);
    await book.save();
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const uploadBookCover = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Cover image is required' });
  const baseUrl = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  res.json({ success: true, data: { url: `${baseUrl}/uploads/covers/${req.file.filename}` } });
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
};

export const getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre');
    res.json({ success: true, data: genres });
  } catch (err) {
    next(err);
  }
};
