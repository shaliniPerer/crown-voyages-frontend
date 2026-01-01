import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import { resortApi, uploadApi } from '../../api/services';
import { toast } from 'react-toastify';

const RoomForm = ({ room = null, onSuccess, onCancel }) => {
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    resort: room?.resort?._id || '',
    roomType: room?.roomType || '',
    description: room?.description || '',
    occupancy: room?.occupancy || 2,
    price: room?.price || '',
    amenities: room?.amenities || [],
    images: room?.images || []
  });
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchResorts();
  }, []);

  const fetchResorts = async () => {
    try {
      const response = await resortApi.getResorts();
      setResorts(response.data);
    } catch (error) {
      console.error('Error fetching resorts:', error);
      toast.error('Failed to load resorts');
    }
  };

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

      const roomData = {
        ...formData,
        images: imageUrls,
        price: parseFloat(formData.price),
        occupancy: parseInt(formData.occupancy)
      };

      if (room) {
        // Update existing room
        await fetch(`${import.meta.env.VITE_API_URL}/rooms/${room._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(roomData)
        });
        toast.success('Room updated successfully');
      } else {
        // Create new room
        await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(roomData)
        });
        toast.success('Room created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resort Selection */}
      <Select
        label="Select Resort"
        name="resort"
        value={formData.resort}
        onChange={handleChange}
        options={resorts.map(r => ({ value: r._id, label: r.name }))}
        placeholder="Choose a resort"
        required
      />

      {/* Room Type and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Room Type"
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          placeholder="e.g., Deluxe Suite, Ocean View"
          required
        />
        <Input
          label="Price per Night ($)"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      {/* Occupancy */}
      <Input
        label="Maximum Occupancy (Persons)"
        name="occupancy"
        type="number"
        min="1"
        max="20"
        value={formData.occupancy}
        onChange={handleChange}
        required
      />

      {/* Description */}
      <Textarea
        label="Room Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        placeholder="Describe the room features, size, view, etc."
        required
      />

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
          placeholder="WiFi, TV, Mini Bar, Balcony"
          className="input-luxury w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate amenities with commas
        </p>
      </div>

      {/* Image Upload */}
      <ImageUpload
        label="Room Images"
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
                  alt={`Room ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gold-800/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, images: newImages }));
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-gold-800/30">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
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

export default RoomForm;