import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

// Quotation Versions Component
export const QuotationVersions = ({ versions = [], onSelectVersion }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gold-500 mb-4">Quotation Versions</h3>
      {versions.length > 0 ? (
        versions.map((version, index) => (
          <div 
            key={index}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gold-600 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
            onClick={() => onSelectVersion(version)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-100">Version {version.version}</span>
              <span className="text-sm text-gray-400">
                {new Date(version.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-2xl font-bold text-gold-500">${version.amount.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-2">{version.notes}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 py-4">No versions available</p>
      )}
    </div>
  );
};