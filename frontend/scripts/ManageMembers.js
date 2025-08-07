$(document).ready(function() {
    loadMembers();

    $('#member_form').on('submit', function(e) {
        e.preventDefault();
        saveMember();
    });
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function loadMembers() {
    $.ajax({
        url: 'http://localhost:3000/api/members',
        method: 'GET',
        success: function(members) {
            window.membersData = members;
            renderMembersTable();
        }
    });
}

function renderMembersTable() {
    const members = window.membersData || [];
    const $tbody = $('#members_table');
    $tbody.empty();

    if (members.length === 0) {
        const $noDataRow = $($('#no_members_template').html());
        $tbody.append($noDataRow);
        return;
    }

    members.forEach(member => {
                const $row = $($('#member_row_template').html());
                const lostAmount = member.lost_book_fee_amount || 0;
                const feeStatus = member.fee_paid_status ? 'Paid' : 'Pending';
                const feeStatusClass = member.fee_paid_status ? 'status-available' : 'status-pending';

                $row.find('.member-id').text(member.member_id);
                $row.find('.member-name').text(member.name);
                $row.find('.member-email').text(member.email);
                $row.find('.member-phone').text(member.phone || 'N/A');
                $row.find('.member-fee').text(`Rs.${member.membership_fee || 0}`);
                $row.find('.member-lost-amount').html(`<span class="${lostAmount > 0 ? 'status-lost' : 'status-available'}">Rs.${lostAmount}</span>`);
                $row.find('.member-fee-status').html(`<span class="${feeStatusClass}">${feeStatus}</span>`);
                $row.find('.member-actions').html(`
      <button class="btn btn-sm btn-info" onclick="viewMemberDetails(${member.member_id})">View</button>
      <button class="btn btn-sm btn-warning" onclick="editMember(${member.member_id})">Edit</button>
      ${!member.fee_paid_status ? 
        `<button class="btn btn-sm btn-success" onclick="toggleFeeStatus(${member.member_id}, ${member.fee_paid_status})">Mark Paid</button>` : 
        ''
      }
    `);
    
    $tbody.append($row);
  });
}

function showAddForm() {
  $('#add_form').show();
  $('#member_form')[0].reset();
  $('#member_id').val('');
}

function hideAddForm() {
  $('#add_form').hide();
}

function saveMember() {
  const memberId = $('#member_id').val();
  const name = $('#member_name').val().trim();
  const email = $('#member_email').val().trim();
  const phone = $('#member_phone').val().trim();
  const fee = $('#membership_fee').val();
  
  if (!name) {
    Swal.fire('Error!', 'Name is required', 'error');
    return;
  }
  
  if (!email) {
    Swal.fire('Error!', 'Email is required', 'error');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Swal.fire('Error!', 'Please enter a valid email address', 'error');
    return;
  }
  
  if (fee && (isNaN(fee) || fee < 0)) {
    Swal.fire('Error!', 'Membership fee must be a valid positive number', 'error');
    return;
  }
  
  const memberData = {
    name: name,
    email: email,
    phone: phone,
    address: $('#member_address').val(),
    membership_fee: fee
  };
  
  const url = memberId ? `http://localhost:3000/api/members/${memberId}` : 'http://localhost:3000/api/members';
  const method = memberId ? 'PUT' : 'POST';
  
  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(memberData),
    success: function() {
      Swal.fire('Success!', memberId ? 'Member updated successfully!' : 'Member added successfully!', 'success');
      hideAddForm();
      loadMembers();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    error: function() {
      Swal.fire('Error!', 'Error saving member', 'error');
    }
  });
}

function editMember(id) {
  console.log('Editing member with ID:', id);
  $.ajax({
    url: `http://localhost:3000/api/members/${id}`,
    method: 'GET',
    success: function(member) {
      console.log('Member data received:', member);
      $('#member_id').val(member.member_id);
      $('#member_name').val(member.name);
      $('#member_email').val(member.email);
      $('#member_phone').val(member.phone || '');
      $('#member_address').val(member.address || '');
      $('#membership_fee').val(member.membership_fee || '');
      // Show form after populating data
      $('#add_form').show();
    },
    error: function(xhr, status, error) {
      console.error('Error loading member:', error);
      Swal.fire('Error!', 'Error loading member data', 'error');
    }
  });
}

function toggleFeeStatus(id, currentStatus) {
  const newStatus = !currentStatus;
  const action = newStatus ? 'paid' : 'unpaid';
  
  Swal.fire({
    title: 'Confirm Action',
    text: `Mark this member's fee as ${action}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `http://localhost:3000/api/members/${id}/fee-status`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ fee_paid_status: newStatus }),
        success: function() {
          Swal.fire('Success!', `Fee status updated to ${action} successfully!`, 'success');
          loadMembers();
        },
        error: function() {
          Swal.fire('Error!', 'Error updating fee status', 'error');
        }
      });
    }
  });
}

function viewMemberDetails(id) {
  console.log('Viewing member details for ID:', id);
  $.ajax({
    url: `http://localhost:3000/api/members/${id}`,
    method: 'GET',
    success: function(member) {
      const registerDate = formatDate(member.register_date);
      const lostAmount = member.lost_book_fee_amount || 0;
      const feeStatus = member.fee_paid_status ? 'Paid' : 'Pending';
      const feeStatusClass = member.fee_paid_status ? 'text-success' : 'text-warning';
      
      const detailsHtml = `
        <div class="row">
          <div class="col-md-6"><strong>Member ID:</strong></div>
          <div class="col-md-6">${member.member_id}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Name:</strong></div>
          <div class="col-md-6">${member.name}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Email:</strong></div>
          <div class="col-md-6">${member.email}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Phone:</strong></div>
          <div class="col-md-6">${member.phone || 'N/A'}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Address:</strong></div>
          <div class="col-md-6">${member.address || 'N/A'}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Register Date:</strong></div>
          <div class="col-md-6">${registerDate}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Membership Fee:</strong></div>
          <div class="col-md-6">Rs.${member.membership_fee || 0}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Lost Book Fee:</strong></div>
          <div class="col-md-6"><span class="${lostAmount > 0 ? 'text-danger' : 'text-success'}">Rs.${lostAmount}</span></div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Fee Payment Status:</strong></div>
          <div class="col-md-6"><span class="${feeStatusClass}">${feeStatus}</span></div>
        </div>
      `;
      
      Swal.fire({
        title: 'Member Details',
        html: detailsHtml,
        width: '600px',
        confirmButtonText: 'Close',
        confirmButtonColor: '#6c757d'
      });
    },
    error: function(xhr, status, error) {
      console.error('Error loading member details:', error);
      Swal.fire('Error!', 'Error loading member details', 'error');
    }
  });
}