$(document).ready(function() {
  loadBooks();
  loadMembers();
  
  $('#issue_form').on('submit', function(e) {
    e.preventDefault();
    const issue_data = {
      book_id: $('#book_select').val(),
      member_id: $('#member_select').val(),
      return_date: $('#return_date').val(),
      lost_reason: $('#lost_reason').val()
    };
    
    $.ajax({
      url: 'http://localhost:3000/api/issues/issue',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(issue_data),
      success: function() {
        alert('Book issued successfully!');
        $('#issue_form')[0].reset();
        loadBooks();
      },
      error: function() {
        alert('Error issuing book');
      }
    });
  });
});

function loadBooks() {
  $.ajax({
    url: 'http://localhost:3000/api/books',
    method: 'GET',
    success: function(data) {
      const books = Array.isArray(data) ? data : [];
      $('#book_select').empty().append('<option value="">Choose a book...</option>');
      
      books.filter(book => !book.issued_status).forEach(book => {
        $('#book_select').append(`<option value="${book.book_id}">${book.name} - ${book.author}</option>`);
      });
    },
    error: function() {
      console.error('Error loading books');
    }
  });
}

function loadMembers() {
  $.ajax({
    url: 'http://localhost:3000/api/members',
    method: 'GET',
    success: function(members) {
      $('#member_select').empty().append('<option value="">Choose a member...</option>');
      
      members.forEach(member => {
        $('#member_select').append(`<option value="${member.member_id}">${member.name} - ${member.email}</option>`);
      });
    },
    error: function() {
      console.error('Error loading members');
    }
  });
}