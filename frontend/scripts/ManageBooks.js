$(document).ready(function() {
    loadBooks();

    $('#book_form').on('submit', function(e) {
        e.preventDefault();
        saveBook();
    });

    $('#search_books').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterBooks(searchTerm);
    });
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function loadBooks() {
    $.ajax({
        url: 'http://localhost:3000/api/books',
        method: 'GET',
        success: function(books) {
            window.booksData = books;
            renderBooksTable(books);
            updateBookCount(books.length);
        },
        error: function() {
            Swal.fire('Error!', 'Failed to load books', 'error');
        }
    });
}

function updateBookCount(count) {
    $('#total_books').text(`${count} ${count === 1 ? 'book' : 'books'}`);
}

function filterBooks(searchTerm) {
    if (!window.booksData) return;

    const filteredBooks = window.booksData.filter(book =>
        book.name.toLowerCase().includes(searchTerm) ||
        (book.author && book.author.toLowerCase().includes(searchTerm))
    );

    renderBooksTable(filteredBooks);
}

function renderBooksTable(books) {
    const $tbody = $('#books_table');
    $tbody.empty();

    if (books.length === 0) {
        const $noDataRow = $($('#no_books_template').html());
        $tbody.append($noDataRow);
        return;
    }

    books.forEach(book => {
        const $row = $($('#book_row_template').html());
        let status, statusClass;

        if (book.lost_status) {
            status = 'Lost';
            statusClass = 'status-lost';
        } else if (book.issued_status) {
            status = 'Issued';
            statusClass = 'status-issued';
        } else {
            status = 'Available';
            statusClass = 'status-available';
        }

        const paymentStatus = book.payment_status || 'Not Lost';
        const paymentClass = paymentStatus === 'Pending' ? 'status-pending' : 'status-available';

        $row.find('.book-id').text(book.book_id);
        $row.find('.book-name').text(book.name);
        $row.find('.book-author').text(book.author || 'N/A');
        $row.find('.book-price').text(`Rs.${book.price || 0}`);
        $row.find('.book-status').html(`<span class="${statusClass}">${status}</span>`);
        $row.find('.book-payment-status').html(`<span class="${paymentClass}">${paymentStatus}</span>`);

        const actionsHtml = `
            <button class="btn btn-sm btn-outline-info" onclick="viewBookDetails(${book.book_id})" title="View Details">
                View
            </button>
            <button class="btn btn-sm btn-outline-warning" onclick="editBook(${book.book_id})" title="Edit Book">
                Edit
            </button>
        `;

        $row.find('.book-actions .btn-group').html(actionsHtml);
        $tbody.append($row);
    });
}

function showAddForm() {
    $('#form_title').text('Add New Book');
    $('#add_form').show();
    $('#book_form')[0].reset();
    $('#book_id').val('');
    $('#book_name').focus();
}

function hideAddForm() {
    $('#add_form').hide();
}

function saveBook() {
    const bookId = $('#book_id').val();
    const name = $('#book_name').val().trim();
    const author = $('#book_author').val().trim();
    const price = $('#book_price').val();

    if (!name) {
        Swal.fire('Error!', 'Book name is required', 'error');
        return;
    }

    if (price && (isNaN(price) || price < 0)) {
        Swal.fire('Error!', 'Price must be a valid positive number', 'error');
        return;
    }

    const bookData = {
        name: name,
        author: author,
        price: price
    };

    const url = bookId ? `http://localhost:3000/api/books/${bookId}` : 'http://localhost:3000/api/books';
    const method = bookId ? 'PUT' : 'POST';

    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(bookData),
        success: function() {
            Swal.fire({
                title: 'Success!',
                text: bookId ? 'Book updated successfully!' : 'Book added successfully!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            hideAddForm();
            loadBooks();
        },
        error: function() {
            Swal.fire('Error!', 'Error saving book', 'error');
        }
    });
}

function editBook(id) {
    console.log('Editing book with ID:', id);
    $.ajax({
        url: `http://localhost:3000/api/books/${id}`,
        method: 'GET',
        success: function(book) {
            console.log('Book data received:', book);
            $('#form_title').text('Edit Book');
            $('#add_form').show();
            $('#book_id').val(book.book_id);
            $('#book_name').val(book.name);
            $('#book_author').val(book.author || '');
            $('#book_price').val(book.price || '');
            $('#book_name').focus();
        },
        error: function(xhr, status, error) {
            console.error('Error loading book:', error);
            Swal.fire('Error!', 'Error loading book data', 'error');
        }
    });
}

function viewBookDetails(id) {
    console.log('Viewing book details for ID:', id);
    $.ajax({
        url: `http://localhost:3000/api/books/${id}`,
        method: 'GET',
        success: function(book) {
            const registerDate = formatDate(book.register_date);
            let status, statusClass, statusIcon;

            if (book.lost_status) {
                status = 'Lost';
                statusClass = 'text-danger';
                statusIcon = 'exclamation-triangle-fill';
            } else if (book.issued_status) {
                status = 'Issued';
                statusClass = 'text-warning';
                statusIcon = 'arrow-right-circle-fill';
            } else {
                status = 'Available';
                statusClass = 'text-success';
                statusIcon = 'check-circle-fill';
            }

            const paymentStatus = book.payment_status || 'Not Lost';
            const paymentClass = paymentStatus === 'Pending' ? 'text-warning' : 'text-success';
            const paymentIcon = paymentStatus === 'Pending' ? 'clock-fill' : 'check-circle-fill';

            const detailsHtml = `
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-hash text-muted me-2"></i>
                            <div>
                                <small class="text-muted d-block">Book ID</small>
                                <strong>${book.book_id}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-bookmark-fill text-muted me-2"></i>
                            <div>
                                <small class="text-muted d-block">Name</small>
                                <strong>${book.name}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-person-fill text-muted me-2"></i>
                            <div>
                                <small class="text-muted d-block">Author</small>
                                <strong>${book.author || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-currency-dollar text-muted me-2"></i>
                            <div>
                                <small class="text-muted d-block">Price</small>
                                <strong>Rs.${book.price || 0}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-calendar-fill text-muted me-2"></i>
                            <div>
                                <small class="text-muted d-block">Register Date</small>
                                <strong>${registerDate}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-${statusIcon} ${statusClass} me-2"></i>
                            <div>
                                <small class="text-muted d-block">Status</small>
                                <span class="${statusClass}"><strong>${status}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-${paymentIcon} ${paymentClass} me-2"></i>
                            <div>
                                <small class="text-muted d-block">Payment Status</small>
                                <span class="${paymentClass}"><strong>${paymentStatus}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-info-circle text-muted me-2"></i>
                            <div>
                                <small class="text-muted d-block">Details</small>
                                <strong>Issued: ${book.issued_status ? 'Yes' : 'No'} | Lost: ${book.lost_status ? 'Yes' : 'No'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            Swal.fire({
                title: '<i class="bi bi-book-fill me-2"></i>Book Details',
                html: detailsHtml,
                width: '700px',
                confirmButtonText: '<i class="bi bi-x-circle me-1"></i>Close',
                confirmButtonColor: '#6c757d',
                customClass: {
                    popup: 'text-start'
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error loading book details:', error);
            Swal.fire('Error!', 'Error loading book details', 'error');
        }
    });
}

function loadBooks() {
    $.ajax({
        url: 'http://localhost:3000/api/books',
        method: 'GET',
        success: function(books) {
            renderBooksTable(books);
        }
    });
}

function renderBooksTable(books) {
    const $tbody = $('#books_table');
    $tbody.empty();

    if (books.length === 0) {
        const $noDataRow = $($('#no_books_template').html());
        $tbody.append($noDataRow);
        return;
    }

    books.forEach(book => {
        const $row = $($('#book_row_template').html());
        let status, statusClass;
        if (book.lost_status) {
            status = 'Lost';
            statusClass = 'text-danger';
        } else if (book.issued_status) {
            status = 'Issued';
            statusClass = 'text-warning';
        } else {
            status = 'Available';
            statusClass = 'text-success';
        }
        const paymentStatus = book.payment_status || 'Not Lost';
        const paymentClass = paymentStatus === 'Pending' ? 'text-warning' : 'text-success';

        $row.find('.book-id').text(book.book_id);
        $row.find('.book-name').text(book.name);
        $row.find('.book-author').text(book.author || 'N/A');
        $row.find('.book-price').text(`Rs.${book.price || 0}`);
        $row.find('.book-status').html(`<span class="${statusClass}">${status}</span>`);
        $row.find('.book-payment-status').html(`<span class="${paymentClass}">${paymentStatus}</span>`);
        $row.find('.book-actions').html(`
      <button class="btn btn-sm btn-info" onclick="viewBookDetails(${book.book_id})">View</button>
      <button class="btn btn-sm btn-warning" onclick="editBook(${book.book_id})">Edit</button>
    `);

        $tbody.append($row);
    });
}

function showAddForm() {
    $('#add_form').show();
    $('#book_form')[0].reset();
    $('#book_id').val('');
}

function hideAddForm() {
    $('#add_form').hide();
}

function saveBook() {
    const bookId = $('#book_id').val();
    const bookData = {
        name: $('#book_name').val(),
        author: $('#book_author').val(),
        price: $('#book_price').val()
    };

    const url = bookId ? `http://localhost:3000/api/books/${bookId}` : 'http://localhost:3000/api/books';
    const method = bookId ? 'PUT' : 'POST';

    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(bookData),
        success: function() {
            Swal.fire('Success!', bookId ? 'Book updated successfully!' : 'Book added successfully!', 'success');
            hideAddForm();
            loadBooks();
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        error: function() {
            Swal.fire('Error!', 'Error saving book', 'error');
        }
    });
}

function editBook(id) {
    console.log('Editing book with ID:', id);
    $.ajax({
        url: `http://localhost:3000/api/books/${id}`,
        method: 'GET',
        success: function(book) {
            console.log('Book data received:', book);
            // Show form first, then populate with data
            $('#add_form').show();
            $('#book_id').val(book.book_id);
            $('#book_name').val(book.name);
            $('#book_author').val(book.author || '');
            $('#book_price').val(book.price || '');
        },
        error: function(xhr, status, error) {
            console.error('Error loading book:', error);
            Swal.fire('Error!', 'Error loading book data', 'error');
        }
    });
}

function viewBookDetails(id) {
    console.log('Viewing book details for ID:', id);
    $.ajax({
        url: `http://localhost:3000/api/books/${id}`,
        method: 'GET',
        success: function(book) {
            const registerDate = formatDate(book.register_date);
            let status, statusClass;
            if (book.lost_status) {
                status = 'Lost';
                statusClass = 'text-danger';
            } else if (book.issued_status) {
                status = 'Issued';
                statusClass = 'text-warning';
            } else {
                status = 'Available';
                statusClass = 'text-success';
            }

            const paymentStatus = book.payment_status || 'Not Lost';
            const paymentClass = paymentStatus === 'Pending' ? 'text-warning' : 'text-success';

            const detailsHtml = `
        <div class="row">
          <div class="col-md-6"><strong>Book ID:</strong></div>
          <div class="col-md-6">${book.book_id}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Name:</strong></div>
          <div class="col-md-6">${book.name}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Author:</strong></div>
          <div class="col-md-6">${book.author || 'N/A'}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Price:</strong></div>
          <div class="col-md-6">Rs.${book.price || 0}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Register Date:</strong></div>
          <div class="col-md-6">${registerDate}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Status:</strong></div>
          <div class="col-md-6"><span class="${statusClass}">${status}</span></div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Payment Status:</strong></div>
          <div class="col-md-6"><span class="${paymentClass}">${paymentStatus}</span></div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Issued Status:</strong></div>
          <div class="col-md-6">${book.issued_status ? 'Yes' : 'No'}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Lost Status:</strong></div>
          <div class="col-md-6">${book.lost_status ? 'Yes' : 'No'}</div>
        </div>
      `;

            Swal.fire({
                title: 'Book Details',
                html: detailsHtml,
                width: '600px',
                confirmButtonText: 'Close',
                confirmButtonColor: '#6c757d'
            });
        },
        error: function(xhr, status, error) {
            console.error('Error loading book details:', error);
            Swal.fire('Error!', 'Error loading book details', 'error');
        }
    });
}