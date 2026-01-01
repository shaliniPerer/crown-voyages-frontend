import React from 'react';
import Badge from '../common/Badge';
import { FiDollarSign, FiCreditCard, FiCalendar, FiFileText } from 'react-icons/fi';

const PaymentHistory = ({ payments = [], invoiceId = null }) => {
  // Filter payments by invoice if invoiceId is provided
  const filteredPayments = invoiceId 
    ? payments.filter(p => p.invoice?._id === invoiceId || p.invoice === invoiceId)
    : payments;

  // Sort by date (newest first)
  const sortedPayments = [...filteredPayments].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const getPaymentMethodIcon = (method) => {
    const iconMap = {
      'Card': FiCreditCard,
      'Cash': FiDollarSign,
      'Bank Transfer': FiFileText,
      'Cheque': FiFileText,
      'Online Payment': FiCreditCard,
      'Mobile Payment': FiCreditCard,
    };
    return iconMap[method] || FiDollarSign;
  };

  const getPaymentMethodColor = (method) => {
    const colorMap = {
      'Card': 'text-blue-400',
      'Cash': 'text-green-400',
      'Bank Transfer': 'text-purple-400',
      'Cheque': 'text-orange-400',
      'Online Payment': 'text-indigo-400',
      'Mobile Payment': 'text-pink-400',
    };
    return colorMap[method] || 'text-gray-400';
  };

  if (sortedPayments.length === 0) {
    return (
      <div className="text-center py-12">
        <FiDollarSign className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg">No payment history available</p>
        <p className="text-gray-500 text-sm mt-2">
          {invoiceId ? 'No payments have been recorded for this invoice yet' : 'No payments have been recorded yet'}
        </p>
      </div>
    );
  }

  // Calculate total
  const totalPaid = sortedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="card-luxury">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Payments</p>
            <p className="text-xl font-semibold text-gray-100">{sortedPayments.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Total Amount Paid</p>
            <p className="text-2xl font-bold text-gold-500">${totalPaid.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment Timeline */}
      <div className="space-y-3">
        {sortedPayments.map((payment, index) => {
          const PaymentIcon = getPaymentMethodIcon(payment.method);
          const iconColor = getPaymentMethodColor(payment.method);

          return (
            <div 
              key={payment._id || index}
              className="card-luxury hover:shadow-gold transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`mt-1 ${iconColor}`}>
                  <PaymentIcon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-100 mb-1">
                        {payment.method}
                      </h4>
                      {payment.invoice?.invoiceNumber && (
                        <p className="text-sm text-gray-400">
                          Invoice: <span className="text-gold-500 font-mono">{payment.invoice.invoiceNumber}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        ${payment.amount?.toLocaleString()}
                      </p>
                      <Badge variant="green" size="small" className="mt-1">
                        Completed
                      </Badge>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gold-800/20">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        Date
                      </p>
                      <p className="text-sm text-gray-300">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>

                    {payment.transactionId && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                        <p className="text-sm text-gray-300 font-mono truncate" title={payment.transactionId}>
                          {payment.transactionId}
                        </p>
                      </div>
                    )}

                    {payment.customerName && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Customer</p>
                        <p className="text-sm text-gray-300 truncate" title={payment.customerName}>
                          {payment.customerName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {payment.notes && (
                    <div className="mt-3 p-3 bg-luxury-lighter rounded-lg border border-gold-800/10">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-300">{payment.notes}</p>
                    </div>
                  )}

                  {/* Processed By */}
                  {payment.processedBy && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Processed by: <span className="text-gray-400">{payment.processedBy.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistory;