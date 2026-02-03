import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiStar,
  FiUser,
  FiX
} from 'react-icons/fi';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { resortApi } from '../api/resortApi';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';

const ResortManagement = () => {
  const [resorts, setResorts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResort, setEditingResort] = useState(null);
  const [profileResort, setProfileResort] = useState(null);

  /* ---------- FORM DATA ---------- */
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    starRating: 5,
    amenities: [],
    amenityInput: '',
    mealPlan: '',
  });

  /* ---------- IMAGE STATES ---------- */
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    fetchResorts();
  }, []);

  const fetchResorts = async () => {
    try {
      const res = await resortApi.getResorts();
      setResorts(res.data?.data || []);
    } catch {
      setResorts([]);
    }
  };

  /* ---------- OPEN ADD / EDIT MODAL ---------- */
  const handleOpenModal = (resort = null) => {
    if (resort) {
      setEditingResort(resort);
      setFormData({
        name: resort.name,
        location: resort.location,
        description: resort.description,
        starRating: resort.starRating,
        amenities: resort.amenities || [],
        amenityInput: '',
        mealPlan: resort.mealPlan || '',
      });
      setExistingImages(resort.images || []);
    } else {
      setEditingResort(null);
      setFormData({
        name: '',
        location: '',
        description: '',
        starRating: 5,
        amenities: [],
        amenityInput: '',
        mealPlan: '',
      });
      setExistingImages([]);
    }

    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowModal(true);
  };

  /* ---------- AMENITIES ---------- */
  const addAmenity = () => {
    if (!formData.amenityInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, prev.amenityInput.trim()],
      amenityInput: '',
    }));
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  /* ---------- IMAGE HANDLERS ---------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file))
    ]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedUrls = [];

      if (newImageFiles.length > 0) {
        const fd = new FormData();
        newImageFiles.forEach(file => fd.append('images', file));
        fd.append('folder', 'resorts');

        const res = await axiosInstance.post(
          '/upload/images',
          fd
        );

        uploadedUrls = res.data.data.urls;
      }

      const payload = {
        ...formData,
        images: [...existingImages, ...uploadedUrls],
      };

      delete payload.amenityInput;

      if (editingResort) {
        await resortApi.updateResort(editingResort._id, payload);
        toast.success('Resort updated');
      } else {
        await resortApi.createResort(payload);
        toast.success('Resort created');
      }

      setShowModal(false);
      fetchResorts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resort?')) return;
    try {
      await resortApi.deleteResort(id);
      toast.success('Resort deleted');
      fetchResorts();
    } catch {
      toast.error('Delete failed');
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Resort Management</h1>
          <p className="text-gray-900 mt-1">Manage Resorts</p>
        </div>
        <Button icon={FiPlus} onClick={() => handleOpenModal()}>
          Add Resort
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resorts.map((r, i) => (
              <tr key={r._id} className="border-b border-gray-700">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">{r.location}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="small" icon={FiUser} onClick={() => setProfileResort(r)}>
                    Profile
                  </Button>
                  <Button size="small" icon={FiEdit} onClick={() => handleOpenModal(r)}>
                    Edit
                  </Button>
                  <Button size="small" icon={FiTrash2} variant="outline" onClick={() => handleDelete(r._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingResort ? 'Edit Resort' : 'Add Resort'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
          <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

          {/* STAR RATING */}
          <div>
            <label className="font-medium">Star Rating</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setFormData({ ...formData, starRating: star })}>
                  <FiStar size={22} className={star <= formData.starRating ? 'text-gold-500 fill-current' : 'text-gray-400'} />
                </button>
              ))}
            </div>
          </div>

          {/* AMENITIES */}
          <div>
            <label className="font-medium">Amenities</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.amenities.map((a, i) => (
                <span key={i} className="bg-gold-500 px-2 py-1 rounded flex items-center gap-1">
                  {a}
                  <FiX className="cursor-pointer" onClick={() => removeAmenity(i)} />
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                className="input-luxury flex-1"
                value={formData.amenityInput}
                onChange={e => setFormData({ ...formData, amenityInput: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity}>Add</Button>
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <label className="font-medium">Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />

            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} className="w-20 h-20 rounded object-cover" />
                  <FiX className="absolute top-1 right-1 bg-black text-white rounded-full cursor-pointer" onClick={() => removeExistingImage(i)} />
                </div>
              ))}

              {newImagePreviews.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} className="w-20 h-20 rounded object-cover" />
                  <FiX className="absolute top-1 right-1 bg-black text-white rounded-full cursor-pointer" onClick={() => removeNewImage(i)} />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {editingResort ? 'Update Resort' : 'Create Resort'}
          </Button>
        </form>
      </Modal>

      {/* PROFILE MODAL */}
      {profileResort && (
        <Modal
          isOpen={!!profileResort}
          onClose={() => setProfileResort(null)}
          title="Resort Profile"
          size="large"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold-500">
              {profileResort.name}
            </h2>
            <p><strong>Location:</strong> {profileResort.location}</p>
            <p><strong>Description:</strong> {profileResort.description}</p>
            <p><strong>Star Rating:</strong> {profileResort.starRating}</p>
            <p><strong>Amenities:</strong> {profileResort.amenities?.join(', ')}</p>

            {profileResort.images?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {profileResort.images.map((img, i) => (
                  <img key={i} src={img} className="w-32 h-32 rounded object-cover" />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ResortManagement;
