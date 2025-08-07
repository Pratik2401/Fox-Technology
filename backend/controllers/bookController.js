const db = require('../config/db');

const bookController = {
  /**
   * @desc Retrieve all books from database
   */
  async getAll(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM books ORDER BY book_id ASC');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * @desc Get total count of books in library
   */
  async getCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM books');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get specific book details by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const [data] = await db.execute('SELECT * FROM books WHERE book_id = ?', [id]);
      if (data.length === 0) {
        return res.status(404).json({ error: 'Book record not found' });
      }
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Add new book to library collection
   */
  async create(req, res, next) {
    try {
      const { name, price, author } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Book title is required' });
      }
      
      if (price && (isNaN(price) || price < 0)) {
        return res.status(400).json({ error: 'Price must be valid positive number' });
      }
      
      // Check for duplicate book name
      const [existing] = await db.execute('SELECT book_id FROM books WHERE name = ?', [name.trim()]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Book name already exists' });
      }
      
      const [insertResult] = await db.execute(
        'INSERT INTO books (name, price, author, register_date, issued_status, lost_status, payment_status) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0, 0, "Not Lost")',
        [name.trim(), price || 0, author || '']
      );
      res.status(201).json({ id: insertResult.insertId });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @desc Update existing book information
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, price, author } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Book title is required' });
      }
      
      // Check for duplicate book name (excluding current book)
      const [existing] = await db.execute('SELECT book_id FROM books WHERE name = ? AND book_id != ?', [name.trim(), id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Book name already exists' });
      }
      
      const [updateResult] = await db.execute(
        'UPDATE books SET name = ?, price = ?, author = ? WHERE book_id = ?',
        [name.trim(), price || 0, author || '', id]
      );
      
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Book record not found' });
      }
      
      res.json({ message: 'Book information updated successfully' });
    } catch (err) {
      next(err);
    }
  },


};

module.exports = bookController;