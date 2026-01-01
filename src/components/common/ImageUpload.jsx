import React, { useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const ImageUpload = ({ 
  label, 
  multiple = false, 
  existingImages = [], 
  onImagesChange,
  maxSize = 5, // MB
  accept = 'image/*',
  maxFiles = 10,
  disabled = false
}) => {
  const [previews, setPreviews] = useState(existingImages);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} exceeds ${maxSize}MB limit`;
    }

    // Check file type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File ${file.name} is not an accepted type`;
      }
    }

    return null;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    setError('');

    // Validate file count
    if (previews.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Create previews
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    const updatedPreviews = multiple ? [...previews, ...newPreviews] : newPreviews;
    setPreviews(updatedPreviews);
    
    if (onImagesChange) {
      onImagesChange(updatedPreviews.map(p => p.file).filter(Boolean));
    }
  };

  const handleRemove = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    
    if (onImagesChange) {
      onImagesChange(updated.map(p => p.file).filter(Boolean));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-gold-500 bg-gold-500/10' 
            : 'border-gold-800/30 hover:border-gold-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <FiUpload className="w-12 h-12 mx-auto text-gold-600 mb-3" />
          <p className="text-gray-300 mb-1">
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">
            {accept.split(',').join(', ')} (Max {maxSize}MB each)
          </p>
          {multiple && (
            <p className="text-xs text-gray-500 mt-1">
              You can upload up to {maxFiles} files
            </p>
          )}
        </label>
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-900/20 border border-red-600 rounded-lg">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <span>⚠</span>
            {error}
          </p>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gold-800/30 bg-luxury-lighter">
                {preview.preview ? (
                  <img
                    src={preview.preview}
                    alt={preview.name || `Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="w-8 h-8 text-gray-600" />
                  </div>
                )}
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-700"
                  aria-label="Remove image"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
              {preview.name && (
                <p className="mt-1 text-xs text-gray-400 truncate" title={preview.name}>
                  {preview.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;