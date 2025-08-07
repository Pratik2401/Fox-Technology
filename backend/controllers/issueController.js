const db = require('../config/db');

const issueController = {
  /**
   * @desc Retrieve all book issues with book and member details
   */
  async getAll(req, res) {
    try {
      const [rows] = await db.execute(`
        SELECT bi.*, b.name as book_name, m.name as member_name 
        FROM book_issues bi 
        JOIN books b ON bi.book_id = b.book_id 
        JOIN members m ON bi.member_id = m.member_id 
        ORDER BY bi.issue_id DESC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * @desc Get total count of active book issues
   */
  async getCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM book_issues WHERE return_status = 0');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of currently issued books
   */
  async getIssuedCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM book_issues WHERE return_status = 0');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of returned books
   */
  async getReturnedCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM book_issues WHERE return_status = 1');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of overdue books
   */
  async getOverdueCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM book_issues WHERE return_status = 0 AND return_date < CURDATE()');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of lost books
   */
  async getLostCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM book_issues WHERE lost_status = 1');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of lost books with cleared payments
   */
  async getLostClearedCount(req, res) {
    try {
      const [data] = await db.execute(`
        SELECT COUNT(*) as total FROM books 
        WHERE lost_status = 1 AND payment_status = 'Not Lost'
      `);
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Issue a book to a member
   */
  async issueBook(req, res) {
    try {
      const { book_id, member_id, return_date, lost_reason } = req.body;
      
      if (!book_id || !member_id || !return_date) {
        return res.status(400).json({ error: 'Book, member, and return date are required' });
      }
      
      const returnDateObj = new Date(return_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (returnDateObj < today) {
        return res.status(400).json({ error: 'Return date cannot be in the past' });
      }
      

      const [book] = await db.execute('SELECT issued_status FROM books WHERE book_id = ?', [book_id]);
      if (book.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      if (book[0].issued_status) {
        return res.status(400).json({ error: 'Book is already issued' });
      }
      

      const [member] = await db.execute('SELECT member_id FROM members WHERE member_id = ?', [member_id]);
      if (member.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      
      const [result] = await db.execute(
        'INSERT INTO book_issues (book_id, member_id, issue_date, return_date, return_status, lost_status, lost_reason) VALUES (?, ?, NOW(), ?, 0, 0, ?)',
        [book_id, member_id, return_date, lost_reason || '']
      );
      await db.execute('UPDATE books SET issued_status = 1 WHERE book_id = ?', [book_id]);
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * @desc Process book return by member
   */
  async returnBook(req, res) {
    try {
      const { issue_id } = req.params;
      
      const [issueRecord] = await db.execute('SELECT book_id, return_status FROM book_issues WHERE issue_id = ?', [issue_id]);
      if (issueRecord.length === 0) {
        return res.status(404).json({ error: 'Issue record not found' });
      }
      if (issueRecord[0].return_status) {
        return res.status(400).json({ error: 'Book already returned' });
      }
      
      await db.execute('UPDATE book_issues SET return_status = 1, actual_return_date = CURRENT_TIMESTAMP WHERE issue_id = ?', [issue_id]);
      await db.execute('UPDATE books SET issued_status = 0 WHERE book_id = ?', [issueRecord[0].book_id]);
      res.json({ message: 'Book return processed successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get specific issue details by ID
   */
  async getById(req, res) {
    try {
      const { issue_id } = req.params;
      const [data] = await db.execute(`
        SELECT bi.*, b.name as book_name, m.name as member_name 
        FROM book_issues bi 
        JOIN books b ON bi.book_id = b.book_id 
        JOIN members m ON bi.member_id = m.member_id 
        WHERE bi.issue_id = ?
      `, [issue_id]);
      
      if (data.length === 0) {
        return res.status(404).json({ error: 'Issue record not found' });
      }
      
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Update issue details
   */
  async update(req, res) {
    try {
      const { issue_id } = req.params;
      const { book_id, member_id, return_date, lost_reason } = req.body;
      
      if (book_id && member_id) {
        const [updateResult] = await db.execute(
          'UPDATE book_issues SET book_id = ?, member_id = ?, return_date = ?, lost_reason = ? WHERE issue_id = ?',
          [book_id, member_id, return_date, lost_reason || '', issue_id]
        );
        
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: 'Issue record not found' });
        }
      } else {
        const [updateResult] = await db.execute(
          'UPDATE book_issues SET return_date = ?, lost_reason = ? WHERE issue_id = ?',
          [return_date, lost_reason || '', issue_id]
        );
        
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: 'Issue record not found' });
        }
      }
      
      res.json({ message: 'Issue details updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Mark book as lost and update related records
   */
  async toggleLostStatus(req, res) {
    try {
      const { issue_id } = req.params;
      const { lost_status, lost_reason } = req.body;
      
      const [issueRecord] = await db.execute(`
        SELECT bi.issue_id, bi.member_id, b.price 
        FROM book_issues bi 
        JOIN books b ON bi.book_id = b.book_id 
        WHERE bi.issue_id = ?
      `, [issue_id]);
      
      if (issueRecord.length === 0) {
        return res.status(404).json({ error: 'Issue record not found' });
      }
      
      await db.execute(
        'UPDATE book_issues SET lost_status = ?, lost_reason = ? WHERE issue_id = ?', 
        [lost_status, lost_reason || '', issue_id]
      );
      
      if (lost_status) {
        const bookCost = issueRecord[0].price || 0;
        await db.execute(
          'UPDATE members SET lost_book_fee_amount = lost_book_fee_amount + ? WHERE member_id = ?',
          [bookCost, issueRecord[0].member_id]
        );
        
        const [bookData] = await db.execute('SELECT book_id FROM book_issues WHERE issue_id = ?', [issue_id]);
        
        await db.execute(
          'UPDATE books SET lost_status = TRUE, payment_status = "Pending" WHERE book_id = ?',
          [bookData[0].book_id]
        );
      }
      
      res.json({ message: 'Lost status updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Mark lost book payment as completed
   */
  async markPaymentDone(req, res) {
    try {
      const { issue_id } = req.params;
      
      const [bookData] = await db.execute('SELECT book_id FROM book_issues WHERE issue_id = ?', [issue_id]);
      
      if (bookData.length === 0) {
        return res.status(404).json({ error: 'Issue record not found' });
      }
      
      await db.execute(
        'UPDATE books SET payment_status = "Not Lost" WHERE book_id = ?',
        [bookData[0].book_id]
      );
      
      res.json({ message: 'Payment status updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = issueController;