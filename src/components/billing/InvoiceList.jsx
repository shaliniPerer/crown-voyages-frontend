import React, { useState } from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { FiFileText, FiMail, FiDownload, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const InvoiceList = ({ 
  invoices = [], 
  onView, 
  onEdit,
  onDelete,
  onSendEmail, 
  onExportPDF,
  loading = false 
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const getStatusBadge = (status) => {
    const statusMap = {
      'Paid': 'green',
      'Pending': 'gold',
      'Overdue': 'red',
      'Partial': 'blue',
      'Draft': 'gray',
      'Cancelled': 'red'
    };
    return statusMap[status] || 'gray';
  };

  const columns = [
    {
      header: 'Invoice ID',
      accessor: 'invoiceNumber',
      render: (invoice) => (
        <span className="font-mono text-gold-500 font-semibold">
          {invoice.invoiceNumber}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (invoice) => (
        <div>
          <p className="font-medium text-gray-100">{invoice.customerName}</p>
          <p className="text-xs text-gray-500">{invoice.email}</p>
        </div>
      )
    },
    {
      header: 'Booking',
      accessor: 'booking',
      render: (invoice) => (
        <span className="text-sm text-gray-300">
          {invoice.booking?.bookingNumber || '-'}
        </span>
      )
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (invoice) => (
        <span className="font-semibold text-gray-100">
          ${invoice.totalAmount?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      header: 'Paid',
      accessor: 'paidAmount',
      render: (invoice) => (
        <span className="text-green-400 font-medium">
          ${invoice.paidAmount?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (invoice) => {
        const balance = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);
        return (
          <span className={`font-medium ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
            ${balance.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (invoice) => {
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today && invoice.status !== 'Paid';
        
        return (
          <div>
            <p className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
              {dueDate.toLocaleDateString()}
            </p>
            {isOverdue && (
              <span className="text-xs text-red-500">Overdue</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (invoice) => (
        <Badge variant={getStatusBadge(invoice.status)}>
          {invoice.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (invoice) => (
        <div className="flex gap-2 flex-wrap">
          {onView && (
            <Button
              variant="ghost"
              size="small"
              icon={FiEye}
              onClick={(e) => {
                e.stopPropagation();
                onView(invoice);
              }}
              title="View Details"
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="small"
              icon={FiEdit}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(invoice);
              }}
              title="Edit Invoice"
            >
              Edit
            </Button>
          )}
          {onSendEmail && (
            <Button
              variant="ghost"
              size="small"
              icon={FiMail}
              onClick={(e) => {
                e.stopPropagation();
                onSendEmail(invoice._id);
              }}
              title="Send Email"
            >
              Send
            </Button>
          )}
          {onExportPDF && (
            <Button
              variant="ghost"
              size="small"
              icon={FiDownload}
              onClick={(e) => {
                e.stopPropagation();
                onExportPDF(invoice._id);
              }}
              title="Download PDF"
            >
              PDF
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="small"
              icon={FiTrash2}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this invoice?')) {
                  onDelete(invoice._id);
                }
              }}
              className="text-red-400 hover:text-red-300"
              title="Delete Invoice"
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-luxury">
          <p className="text-sm text-gray-400 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-100">{invoices.length}</p>
        </div>
        <div className="card-luxury">
          <p className="text-sm text-gray-400 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gold-500">
            ${invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="card-luxury">
          <p className="text-sm text-gray-400 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-400">
            ${invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="card-luxury">
          <p className="text-sm text-gray-400 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-400">
            ${invoices.reduce((sum, inv) => sum + ((inv.totalAmount || 0) - (inv.paidAmount || 0)), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <Table
        columns={columns}
        data={invoices}
        loading={loading}
        emptyMessage="No invoices found"
        hoverable={true}
        onRowClick={onView}
      />
    </div>
  );
};

export default InvoiceList;