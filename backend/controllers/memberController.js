const db = require('../config/db');

const memberController = {
  /**
   * @desc Retrieve all library members
   */
  async getAll(req, res) {
    try {
      const [data] = await db.execute('SELECT * FROM members ORDER BY member_id DESC');
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get total count of library members
   */
  async getCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM members');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of members with unpaid fees
   */
  async getPendingPaymentCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM members WHERE fee_paid_status = 0');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get count of members with paid fees
   */
  async getClearedPaymentCount(req, res) {
    try {
      const [data] = await db.execute('SELECT COUNT(*) as total FROM members WHERE fee_paid_status = 1');
      res.json({ count: data[0].total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Get specific member details by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const [data] = await db.execute('SELECT * FROM members WHERE member_id = ?', [id]);
      if (data.length === 0) {
        return res.status(404).json({ error: 'Member record not found' });
      }
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * @desc Register new library member
   */
  async create(req, res, next) {
    try {
      const { name, email, phone, address, membership_fee } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Member name is required' });
      }
      
      if (!email || email.trim().length === 0) {
        return res.status(400).json({ error: 'Email address is required' });
      }
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).json({ error: 'Valid email address required' });
      }
      
      if (membership_fee && (isNaN(membership_fee) || membership_fee < 0)) {
        return res.status(400).json({ error: 'Membership fee must be valid positive number' });
      }

      const [insertResult] = await db.execute(
        'INSERT INTO members (name, email, phone, address, register_date, membership_fee, fee_paid_status) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 0)',
        [name, email, phone, address, membership_fee || 0]
      );
      res.status(201).json({ id: insertResult.insertId });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @desc Update existing member information
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, phone, address, membership_fee } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required fields' });
      }

      const [updateResult] = await db.execute(
        'UPDATE members SET name = ?, email = ?, phone = ?, address = ?, membership_fee = ? WHERE member_id = ?',
        [name, email, phone, address, membership_fee || 0, id]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Member record not found' });
      }

      res.json({ message: 'Member information updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @desc Toggle member fee payment status
   */
  async toggleFeeStatus(req, res) {
    try {
      const { id } = req.params;
      const { fee_paid_status } = req.body;
      
      const [updateResult] = await db.execute(
        'UPDATE members SET fee_paid_status = ? WHERE member_id = ?',
        [fee_paid_status, id]
      );
      
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Member record not found' });
      }
      
      res.json({ message: 'Payment status updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = memberController;
