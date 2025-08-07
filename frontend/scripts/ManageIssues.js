$(document).ready(function() {
    loadIssues();
    setMinDate();

    $('#edit_issue_form').on('submit', function(e) {
        e.preventDefault();
        updateIssue();
    });
});

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    $('#return_date').attr('min', today);
    $('#edit_return_date').attr('min', today);
}

function updateIssue() {
    const issueId = $('#edit_issue_id').val();
    const returnDate = $('#edit_return_date').val();

    if (!returnDate) {
        Swal.fire('Error!', 'Return date is required', 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (returnDate < today) {
        Swal.fire('Error!', 'Return date cannot be in the past', 'error');
        return;
    }

    const bookId = $('#edit_book_select').val();
    const memberId = $('#edit_member_select').val();
    
    if (!bookId || !memberId) {
        Swal.fire('Error!', 'Please select both book and member', 'error');
        return;
    }
    
    const issueData = {
        book_id: bookId,
        member_id: memberId,
        return_date: returnDate,
        lost_reason: $('#edit_lost_reason').val()
    };

    $.ajax({
        url: `http://localhost:3000/api/issues/${issueId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(issueData),
        success: function() {
            Swal.fire('Success!', 'Issue updated successfully!', 'success');
            hideEditForm();
            loadIssues();
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        error: function() {
            Swal.fire('Error!', 'Error updating issue', 'error');
        }
    });
}

function showIssueModal() {
    loadBooksForIssue();
    loadMembersForIssue();
    setMinDate();
    $('#issueModal').modal('show');
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

function loadBooksForEdit() {
    $.ajax({
        url: 'http://localhost:3000/api/books',
        method: 'GET',
        success: function(data) {
            const books = Array.isArray(data) ? data : [];
            $('#edit_book_select').empty().append('<option value="">Choose a book...</option>');

            books.forEach(book => {
                $('#edit_book_select').append(`<option value="${book.book_id}">${book.name} - ${book.author}</option>`);
            });
        }
    });
}

function loadMembersForEdit() {
    $.ajax({
        url: 'http://localhost:3000/api/members',
        method: 'GET',
        success: function(members) {
            $('#edit_member_select').empty().append('<option value="">Choose a member...</option>');

            members.forEach(member => {
                $('#edit_member_select').append(`<option value="${member.member_id}">${member.name} - ${member.email}</option>`);
            });
        }
    });
}

function issueBook() {
    const issueData = {
        book_id: $('#book_select').val(),
        member_id: $('#member_select').val(),
        return_date: $('#return_date').val()
    };

    if (!issueData.book_id || !issueData.member_id || !issueData.return_date) {
        Swal.fire('Error!', 'Please fill all required fields', 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (issueData.return_date < today) {
        Swal.fire('Error!', 'Return date cannot be in the past', 'error');
        return;
    }

    $.ajax({
        url: 'http://localhost:3000/api/issues/issue',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(issueData),
        success: function() {
            Swal.fire('Success!', 'Book issued successfully!', 'success');
            $('#issueModal').modal('hide');
            $('#issue_form')[0].reset();
            loadIssues();
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        error: function() {
            Swal.fire('Error!', 'Error issuing book', 'error');
        }
    });
}

function loadIssues() {
    $.ajax({
        url: 'http://localhost:3000/api/issues',
        method: 'GET',
        success: function(issues) {
            console.log('Issues loaded:', issues);
            let html = '';
            const $tbody = $('#issues_table');
            $tbody.empty();

            if (issues.length === 0) {
                const $noDataRow = $($('#no_issues_template').html());
                $tbody.append($noDataRow);
                return;
            }

            issues.forEach(issue => {
                const $row = $($('#issue_row_template').html());
                let status, statusClass;
                if (issue.return_status) {
                    status = 'Returned';
                    statusClass = 'text-success';
                } else if (issue.lost_status) {
                    status = 'Lost';
                    statusClass = 'text-danger';
                } else {
                    status = 'Issued';
                    statusClass = 'text-warning';
                }

                const returnDate = issue.return_date ? new Date(issue.return_date).toLocaleDateString() : 'N/A';
                const issueDate = new Date(issue.issue_date).toLocaleDateString();

                $row.find('.issue-id').text(issue.issue_id);
                $row.find('.issue-book').text(issue.book_name);
                $row.find('.issue-member').text(issue.member_name);
                $row.find('.issue-date').text(issueDate);
                $row.find('.issue-return-date').text(returnDate);
                $row.find('.issue-status').html(`<span class="${statusClass}">${status}</span>`);

                if (!issue.return_status && !issue.lost_status) {
                    $row.find('.issue-actions').html(`
            <button class="btn btn-sm btn-info me-1" onclick="viewIssueDetails(${issue.issue_id})">View</button>
            <button class="btn btn-sm btn-warning me-1" onclick="editIssue(${issue.issue_id})">Edit</button>
            <button class="btn btn-sm btn-success me-1" onclick="returnBook(${issue.issue_id})">Return</button>
            <button class="btn btn-sm btn-danger" onclick="markLost(${issue.issue_id})">Mark Lost</button>
          `);
                } else if (issue.lost_status) {
                    $row.find('.issue-actions').html(`
            <button class="btn btn-sm btn-info me-1" onclick="viewIssueDetails(${issue.issue_id})">View</button>
            <button class="btn btn-sm btn-warning me-1" onclick="editLostIssue(${issue.issue_id})">Edit</button>
            <button class="btn btn-sm btn-success" onclick="markPaymentDone(${issue.issue_id})">Payment Done</button>
          `);
                } else {
                    $row.find('.issue-actions').html(`
            <button class="btn btn-sm btn-info me-1" onclick="viewIssueDetails(${issue.issue_id})">View</button>
            <span class="text-muted">Completed</span>
          `);
                }

                $tbody.append($row);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error loading issues:', error);
            Swal.fire('Error!', 'Error loading issues', 'error');
        }
    });
}

function returnBook(issueId) {
    Swal.fire({
        title: 'Confirm Return',
        text: 'Mark this book as returned?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:3000/api/issues/return/${issueId}`,
                method: 'PUT',
                success: function() {
                    Swal.fire('Success!', 'Book returned successfully!', 'success');
                    loadIssues();
                },
                error: function() {
                    Swal.fire('Error!', 'Error returning book', 'error');
                }
            });
        }
    });
}

function editIssue(issueId) {
    console.log('Editing issue with ID:', issueId);
    loadBooksForEdit();
    loadMembersForEdit();
    $.ajax({
        url: `http://localhost:3000/api/issues/${issueId}`,
        method: 'GET',
        success: function(issue) {
            console.log('Issue data received:', issue);
            $('#edit_issue_id').val(issue.issue_id);
            $('#edit_book_select').val(issue.book_id);
            $('#edit_member_select').val(issue.member_id);
            $('#edit_return_date').val(issue.return_date ? issue.return_date.split('T')[0] : '');
            $('#edit_lost_reason').val(issue.lost_reason || '');
            setMinDate();
            $('#edit_form').show();
        },
        error: function(xhr, status, error) {
            console.error('Error loading issue:', error);
            Swal.fire('Error!', 'Error loading issue data', 'error');
        }
    });
}

function hideEditForm() {
    $('#edit_return_date').closest('.mb-3').show();
    $('#edit_form').hide();
}

function markLost(issueId) {
    Swal.fire({
        title: 'Mark Book as Lost',
        input: 'textarea',
        inputLabel: 'Enter reason for marking book as lost:',
        inputPlaceholder: 'Type your reason here...',
        showCancelButton: true,
        confirmButtonText: 'Mark Lost',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed && result.value && result.value.trim()) {
            const lostReason = result.value.trim();
            $.ajax({
                url: `http://localhost:3000/api/issues/lost/${issueId}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    lost_status: true,
                    lost_reason: lostReason.trim()
                }),
                success: function() {
                    Swal.fire('Success!', 'Book marked as lost successfully!', 'success');
                    loadIssues();
                },
                error: function() {
                    Swal.fire('Error!', 'Error marking book as lost', 'error');
                }
            });
        }
    });
}

function editLostIssue(issueId) {
    $.ajax({
        url: `http://localhost:3000/api/issues/${issueId}`,
        method: 'GET',
        success: function(issue) {
            $('#edit_issue_id').val(issue.issue_id);
            $('#edit_return_date').closest('.mb-3').hide();
            $('#edit_lost_reason').val(issue.lost_reason || '');
            setMinDate();
            $('#edit_form').show();
        },
        error: function() {
            Swal.fire('Error!', 'Error loading issue data', 'error');
        }
    });
}

function markPaymentDone(issueId) {
    Swal.fire({
        title: 'Confirm Payment',
        text: 'Mark payment as done for this lost book?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:3000/api/issues/payment/${issueId}`,
                method: 'PUT',
                success: function() {
                    Swal.fire('Success!', 'Payment marked as done successfully!', 'success');
                    loadIssues();
                },
                error: function() {
                    Swal.fire('Error!', 'Error marking payment as done', 'error');
                }
            });
        }
    });
}

function viewIssueDetails(issueId) {
    console.log('Viewing issue details for ID:', issueId);
    $.ajax({
                url: `http://localhost:3000/api/issues/${issueId}`,
                method: 'GET',
                success: function(issue) {
                        const issueDate = new Date(issue.issue_date).toLocaleDateString();
                        const returnDate = issue.return_date ? new Date(issue.return_date).toLocaleDateString() : 'N/A';
                        const actualReturnDate = issue.actual_return_date ? new Date(issue.actual_return_date).toLocaleDateString() : 'N/A';

                        let status, statusClass;
                        if (issue.return_status) {
                            status = 'Returned';
                            statusClass = 'text-success';
                        } else if (issue.lost_status) {
                            status = 'Lost';
                            statusClass = 'text-danger';
                        } else {
                            status = 'Issued';
                            statusClass = 'text-warning';
                        }

                        const detailsHtml = `
        <div class="row">
          <div class="col-md-6"><strong>Issue ID:</strong></div>
          <div class="col-md-6">${issue.issue_id}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Book:</strong></div>
          <div class="col-md-6">${issue.book_name}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Member:</strong></div>
          <div class="col-md-6">${issue.member_name}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Issue Date:</strong></div>
          <div class="col-md-6">${issueDate}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Expected Return Date:</strong></div>
          <div class="col-md-6">${returnDate}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Actual Return Date:</strong></div>
          <div class="col-md-6">${actualReturnDate}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Status:</strong></div>
          <div class="col-md-6"><span class="${statusClass}">${status}</span></div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Return Status:</strong></div>
          <div class="col-md-6">${issue.return_status ? 'Yes' : 'No'}</div>
        </div>
        <div class="row mt-2">
          <div class="col-md-6"><strong>Lost Status:</strong></div>
          <div class="col-md-6">${issue.lost_status ? 'Yes' : 'No'}</div>
        </div>
        ${issue.lost_reason ? `
        <div class="row mt-2">
          <div class="col-md-6"><strong>Lost Reason:</strong></div>
          <div class="col-md-6">${issue.lost_reason}</div>
        </div>
        ` : ''}
      `;
      
      Swal.fire({
        title: 'Issue Details',
        html: detailsHtml,
        width: '600px',
        confirmButtonText: 'Close',
        confirmButtonColor: '#6c757d'
      });
    },
    error: function(xhr, status, error) {
      console.error('Error loading issue details:', error);
      Swal.fire('Error!', 'Error loading issue details', 'error');
    }
  });
}