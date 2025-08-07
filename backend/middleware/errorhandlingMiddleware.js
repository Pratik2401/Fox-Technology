const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.includes('members.email')) {
            return res.status(400).json({ error: 'Email address already exists' });
        }
        if (err.sqlMessage.includes('members.phone')) {
            return res.status(400).json({ error: 'Phone number already exists' });
        }
        if (err.sqlMessage.includes('books.name')) {
            return res.status(400).json({ error: 'Book name already exists' });
        }
        return res.status(400).json({ error: 'Duplicate entry found' });
    }

    res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;