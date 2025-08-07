$(document).ready(function() {
    loadReports();
});

function loadReports() {
    $.ajax({
        url: 'http://localhost:3000/api/issues/count/returned',
        method: 'GET',
        success: function(data) {
            $('#received_count').text(data.count);
        }
    });
    
    $.ajax({
        url: 'http://localhost:3000/api/issues/count/overdue',
        method: 'GET',
        success: function(data) {
            $('#overdue_count').text(data.count);
        }
    });
    
    $.ajax({
        url: 'http://localhost:3000/api/issues/count/lost',
        method: 'GET',
        success: function(data) {
            $('#lost_count').text(data.count);
        }
    });
    
    $.ajax({
        url: 'http://localhost:3000/api/issues/count/lost-cleared',
        method: 'GET',
        success: function(data) {
            $('#lost_cleared_count').text(data.count);
        }
    });
    
    $.ajax({
        url: 'http://localhost:3000/api/members/count/pending-payment',
        method: 'GET',
        success: function(data) {
            $('#pending_count').text(data.count);
        }
    });
    
    $.ajax({
        url: 'http://localhost:3000/api/members/count/cleared-payment',
        method: 'GET',
        success: function(data) {
            $('#cleared_count').text(data.count);
        }
    });
    
    loadDetailedTable();
}

function loadDetailedTable() {
    const $tbody = $('#reports_table');
    $tbody.empty();
    
    const reports = [
        { type: 'Received Books', description: 'Books that have been returned by members', api: '/api/issues/count/returned' },
        { type: 'Overdue', description: 'Books that are past their return date', api: '/api/issues/count/overdue' },
        { type: 'Lost', description: 'Books that have been marked as lost', api: '/api/issues/count/lost' },
        { type: 'Lost(Cleared)', description: 'Lost books with payment cleared', api: '/api/issues/count/lost-cleared' },
        { type: 'Pending Payments', description: 'Members with unpaid membership fees', api: '/api/members/count/pending-payment' },
        { type: 'Cleared Payments', description: 'Members with paid membership fees', api: '/api/members/count/cleared-payment' }
    ];
    
    reports.forEach(report => {
        $.ajax({
            url: `http://localhost:3000${report.api}`,
            method: 'GET',
            success: function(data) {
                const row = `
                    <tr>
                        <td><strong>${report.type}</strong></td>
                        <td>${report.description}</td>
                        <td><span class="badge bg-primary">${data.count}</span></td>
                        <td>Total count of ${report.type.toLowerCase()}</td>
                    </tr>
                `;
                $tbody.append(row);
            }
        });
    });
}