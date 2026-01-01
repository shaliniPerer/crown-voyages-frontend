import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import { uploadApi } from '../../api/services';
import { toast } from 'react-toastify';
import { FiStar } from 'react-icons/fi';

const ResortForm = ({ resort = null, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: resort?.name || '',
    location: resort?.location || '',
    description: resort?.description || '',
    starRating: resort?.starRating || 5,
    amenities: resort?.amenities || [],
    mealPlans: resort?.mealPlans || [],
    contactEmail: resort?.contactEmail || '',
    contactPhone: resort?.contactPhone || '',
    website: resort?.website || '',
    images: resort?.images || []
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  const handleAmenitiesChange = (e) => {
    const amenities = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleMealPlansChange = (e) => {
    const mealPlans = e.target.value.split(',').map(m => m.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, mealPlans }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls = formData.images;

      // Upload new images if selected
      if (selectedImages.length > 0) {
        const uploadFormData = new FormData();
        selectedImages.forEach(image => {
          uploadFormData.append('images', image);
        });

        const uploadResponse = await uploadApi.uploadMultipleImages(uploadFormData);
        imageUrls = [...imageUrls, ...uploadResponse.data.urls];
      }

      const resortData = {
        ...formData,
        images: imageUrls,
        starRating: parseInt(formData.starRating)
      };

      if (resort) {
        // Update existing resort
        await fetch(`${import.meta.env.VITE_API_URL}/resorts/${resort._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(resortData)
        });
        toast.success('Resort updated successfully');
      } else {
        // Create new resort
        await fetch(`${import.meta.env.VITE_API_URL}/resorts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(resortData)
        });
        toast.success('Resort created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving resort:', error);
      toast.error('Failed to save resort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gold-500 flex items-center gap-2">
          <FiStar className="w-5 h-5" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Resort Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Paradise Beach Resort"
            required
          />
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country"
            required
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe your resort, its unique features, and what makes it special..."
          required
        />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Star Rating <span className="text-gold-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, starRating: star }))}
              className="transition-all duration-200"
            >
              <FiStar
                className={`w-8 h-8 ${
                  star <= formData.starRating
                    ? 'text-gold-500 fill-gold-500'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-gray-300">{formData.starRating} Star{formData.starRating > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gold-500">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="contact@resort.com"
          />
          <Input
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />
        </div>

        <Input
          label="Website (Optional)"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.resort.com"
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amenities <span className="text-xs text-gray-500">(comma separated)</span>
        </label>
        <input
          type="text"
          name="amenities"
          value={formData.amenities.join(', ')}
          onChange={handleAmenitiesChange}
          placeholder="Pool, Spa, Restaurant, WiFi, Gym"
          className="input-luxury w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add amenities separated by commas (e.g., Pool, Spa, Restaurant)
        </p>
        {formData.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.amenities.map((amenity, index) => (
              <span key={index} className="badge-gold text-xs">
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Meal Plans */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Meal Plans <span className="text-xs text-gray-500">(comma separated)</span>
        </label>
        <input
          type="text"
          name="mealPlans"
          value={formData.mealPlans.join(', ')}
          onChange={handleMealPlansChange}
          placeholder="Breakfast, Half Board, Full Board, All Inclusive"
          className="input-luxury w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Available meal plans (e.g., Breakfast, Half Board, Full Board)
        </p>
      </div>

      {/* Image Upload */}
      <ImageUpload
        label="Resort Images"
        multiple={true}
        existingImages={formData.images.map(url => ({ preview: url }))}
        onImagesChange={handleImagesChange}
        maxSize={5}
        accept="image/*"
      />

      {/* Existing Images Display */}
      {formData.images.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Resort ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gold-800/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, images: newImages }));
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gold-800/30">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : resort ? 'Update Resort' : 'Create Resort'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ResortForm;