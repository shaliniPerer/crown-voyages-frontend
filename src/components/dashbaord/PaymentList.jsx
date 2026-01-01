import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Payments List Component
export const PaymentsList = ({ payments = [] }) => {
  return (
    <div className="space-y-3">
      {payments.length > 0 ? (
        payments.map((payment) => (
          <div key={payment._id} className="flex items-center justify-between p-4 bg-luxury-lighter rounded-lg border border-red-800/20 hover:border-red-600/30 transition-colors duration-200">
            <div>
              <h4 className="font-medium text-gray-100">{payment.customerName}</h4>
              <p className="text-sm text-gray-400">Invoice #{payment.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-red-400">${payment.amount?.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 py-8">No outstanding payments</p>
      )}
    </div>
  );
};