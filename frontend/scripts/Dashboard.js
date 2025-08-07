$(document).ready(function() {
  loadStats();
});

function loadStats() {
  // All Books
  $.ajax({
    url: 'http://localhost:3000/api/books/count',
    method: 'GET',
    success: function(data) {
      $('#all_books').text(data.count);
    }
  });
  
  // Issued Books
  $.ajax({
    url: 'http://localhost:3000/api/issues/count/issued',
    method: 'GET',
    success: function(data) {
      $('#issued_books').text(data.count);
    }
  });
  
  // Received Books
  $.ajax({
    url: 'http://localhost:3000/api/issues/count/returned',
    method: 'GET',
    success: function(data) {
      $('#received_books').text(data.count);
    }
  });
  
  // OverDue Books
  $.ajax({
    url: 'http://localhost:3000/api/issues/count/overdue',
    method: 'GET',
    success: function(data) {
      $('#overdue_books').text(data.count);
    }
  });
  
  // Lost Books
  $.ajax({
    url: 'http://localhost:3000/api/issues/count/lost',
    method: 'GET',
    success: function(data) {
      $('#lost_books').text(data.count);
    }
  });
  
  // Lost(Cleared Payment)
  $.ajax({
    url: 'http://localhost:3000/api/issues/count/lost-cleared',
    method: 'GET',
    success: function(data) {
      $('#lost_cleared').text(data.count);
    }
  });
  
  // Members
  $.ajax({
    url: 'http://localhost:3000/api/members/count',
    method: 'GET',
    success: function(data) {
      $('#total_members').text(data.count);
    }
  });
  
  // Pending Payment
  $.ajax({
    url: 'http://localhost:3000/api/members/count/pending-payment',
    method: 'GET',
    success: function(data) {
      $('#pending_payment').text(data.count);
    }
  });
  
  // Cleared Payments
  $.ajax({
    url: 'http://localhost:3000/api/members/count/cleared-payment',
    method: 'GET',
    success: function(data) {
      $('#cleared_payments').text(data.count);
    }
  });
}

function showMemberModal() {
  $('#memberModal').modal('show');
}

function showBookModal() {
  $('#bookModal').modal('show');
}

function showIssueModal() {
  loadBooksForIssue();
  loadMembersForIssue();
  const today = new Date().toISOString().split('T')[0];
  $('#return_date').attr('min', today);
  $('#issueModal').modal('show');
}

function addMember() {
  const memberData = {
    name: $('#member_name').val(),
    email: $('#member_email').val(),
    phone: $('#member_phone').val(),
    address: $('#member_address').val(),
    membership_fee: $('#membership_fee').val()
  };
  
  $.ajax({
    url: 'http://localhost:3000/api/members',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(memberData),
    success: function() {
      Swal.fire('Success!', 'Member added successfully!', 'success');
      $('#memberModal').modal('hide');
      $('#member_form')[0].reset();
      loadStats();
    },
    error: function() {
      Swal.fire('Error!', 'Error adding member', 'error');
    }
  });
}

function addBook() {
  const bookData = {
    name: $('#book_name').val(),
    price: $('#book_price').val(),
    author: $('#book_author').val()
  };
  
  $.ajax({
    url: 'http://localhost:3000/api/books',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(bookData),
    success: function() {
      alert('Book added successfully!');
      $('#bookModal').modal('hide');
      $('#book_form')[0].reset();
      loadStats();
    },
    error: function() {
      alert('Error adding book');
    }
  });
}

function loadBooksForIssue() {
  $.ajax({
    url: 'http://localhost:3000/api/books',
    method: 'GET',
    success: function(data) {
      const books = Array.isArray(data) ? data : [];
      $('#book_select').empty().append('<option value="">Choose a book...</option>');
      
      books.filter(book => !book.issued_status).forEach(book => {
        $('#book_select').append(`<option value="${book.book_id}">${book.name} - ${book.author}</option>`);
      });
    }
  });
}

function loadMembersForIssue() {
  $.ajax({
    url: 'http://localhost:3000/api/members',
    method: 'GET',
    success: function(members) {
      $('#member_select').empty().append('<option value="">Choose a member...</option>');
      
      members.forEach(member => {
        $('#member_select').append(`<option value="${member.member_id}">${member.name} - ${member.email}</option>`);
      });
    }
  });
}

function issueBook() {
  const issueData = {
    book_id: $('#book_select').val(),
    member_id: $('#member_select').val(),
    return_date: $('#return_date').val(),
    lost_reason: $('#lost_reason').val()
  };
  
  if (!issueData.book_id || !issueData.member_id || !issueData.return_date) {
    alert('Please fill all required fields');
    return;
  }
  
  $.ajax({
    url: 'http://localhost:3000/api/issues/issue',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(issueData),
    success: function() {
      alert('Book issued successfully!');
      $('#issueModal').modal('hide');
      $('#issue_form')[0].reset();
      loadStats();
    },
    error: function() {
      alert('Error issuing book');
    }
  });
}