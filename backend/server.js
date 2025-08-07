const express = require('express');
const cors = require('cors');
const memberRoutes = require('./routes/memberRoutes');
const bookRoutes = require('./routes/bookRoutes');
const issueRoutes = require('./routes/issueRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/members', memberRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});