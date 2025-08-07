$(document).ready(function() {
  $('#book_form').on('submit', function(e) {
    e.preventDefault();
    const book_data = {
      name: $('#book_name').val(),
      price: $('#book_price').val(),
      author: $('#book_author').val()
    };
    
    $.ajax({
      url: 'http://localhost:3000/api/books',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(book_data),
      success: function() {
        alert('Book added successfully!');
        $('#book_form')[0].reset();
      },
      error: function() {
        alert('Error adding book');
      }
    });
  });
});