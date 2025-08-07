$(document).ready(function() {
  $('#member_form').on('submit', function(e) {
    e.preventDefault();
    const member_data = {
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
      data: JSON.stringify(member_data),
      success: function() {
        alert('Member added successfully!');
        $('#member_form')[0].reset();
      },
      error: function() {
        alert('Error adding member');
      }
    });
  });
});

