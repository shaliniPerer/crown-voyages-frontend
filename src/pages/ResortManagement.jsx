import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiStar, FiMapPin, FiUser } from 'react-icons/fi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { resortApi } from '../api/resortApi';
import { toast } from 'react-toastify';

const ResortManagement = () => {
  const [resorts, setResorts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResort, setEditingResort] = useState(null);
  const [profileResort, setProfileResort] = useState(null); // For profile modal
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    starRating: 5,
    amenities: [],
    mealPlan: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  /* ---------------- FETCH RESORTS ---------------- */
  useEffect(() => { fetchResorts(); }, []);

  const fetchResorts = async () => {
    try {
      const res = await resortApi.getResorts();
      setResorts(res.data?.data || []);
    } catch {
      setResorts([]);
    }
  };

  /* ---------------- OPEN MODAL ---------------- */
  const handleOpenModal = (resort = null) => {
    if (resort) {
      setEditingResort(resort);
      setFormData({
        name: resort.name,
        location: resort.location,
        description: resort.description,
        starRating: resort.starRating,
        amenities: resort.amenities || [],
        mealPlan: resort.mealPlan || '',
        images: resort.images || [],
      });
      setImagePreviews(resort.images || []);
    } else {
      setEditingResort(null);
      setFormData({
        name: '',
        location: '',
        description: '',
        starRating: 5,
        amenities: [],
        mealPlan: '',
        images: [],
      });
      setImageFiles([]);
      setImagePreviews([]);
    }
    setShowModal(true);
  };

  /* ---------------- PROFILE MODAL ---------------- */
  const handleOpenProfile = (resort) => {
    setProfileResort(resort);
  };

  const closeProfileModal = () => setProfileResort(null);

  /* ---------------- IMAGE HANDLER ---------------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews([...formData.images, ...newPreviews]);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = formData.images;

      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images', f));
        fd.append('folder', 'resorts');
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/upload/images', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        imageUrls = [...imageUrls, ...data.data.urls];
      }

      const payload = { ...formData, images: imageUrls };
      if (editingResort) await resortApi.updateResort(editingResort._id, payload);
      else await resortApi.createResort(payload);

      toast.success(editingResort ? 'Resort updated' : 'Resort created');
      setShowModal(false);
      setImageFiles([]);
      setImagePreviews([]);
      fetchResorts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ---------------- DELETE ---------------- */
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gold-500">Resort Management</h1>
        <Button icon={FiPlus} onClick={() => handleOpenModal()}>Add Resort</Button>
      </div>

      {/* Resort Table */}
      <Card>
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-400">#</th>
              <th className="px-4 py-2 text-left text-gray-400">Name</th>
              <th className="px-4 py-2 text-left text-gray-400">Location</th>
              <th className="px-4 py-2 text-left text-gray-400">Star</th>
              <th className="px-4 py-2 text-left text-gray-400">Meal Plan</th>
              <th className="px-4 py-2 text-left text-gray-400">Amenities</th>
              <th className="px-4 py-2 text-left text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resorts.map((r, idx) => (
              <tr key={r._id} className="border-b border-gray-700">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2 text-gold-500">{r.name}</td>
                <td className="px-4 py-2">{r.location}</td>
                <td className="px-4 py-2 flex items-center gap-1">
                  {[...Array(parseInt(r.starRating) || 0)].map((_, i) => (
                    <FiStar key={i} className="text-gold-500 fill-current" />
                  ))}
                </td>
                <td className="px-4 py-2">{r.mealPlan}</td>
                <td className="px-4 py-2">
                  {r.amenities?.slice(0, 3).join(', ')}
                  {r.amenities?.length > 3 ? ` +${r.amenities.length - 3} more` : ''}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="small" icon={FiUser} onClick={() => handleOpenProfile(r)}>Profile</Button>
                  <Button size="small" icon={FiEdit} onClick={() => handleOpenModal(r)}>Edit</Button>
                  <Button size="small" icon={FiTrash2} variant="outline" onClick={() => handleDelete(r._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Edit/Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingResort ? 'Edit Resort' : 'Add Resort'} size="large">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
          <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          
          <div>
            <label className="text-sm text-gray-300 block mb-1">Star Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, starRating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <FiStar
                    size={24}
                    className={`${
                      star <= formData.starRating ? 'text-gold-500 fill-current' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-300">Meal Plan</label>
            <select className="input-luxury w-full" value={formData.mealPlan} onChange={e => setFormData({ ...formData, mealPlan: e.target.value })}>
              <option value="">Select Meal Plan</option>
              <option value="All Inclusive">All Inclusive</option>
              <option value="Half Board">Half Board</option>
              <option value="Full Board">Full Board</option>
              <option value="Bed & Breakfast">Bed & Breakfast</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300">Amenities</label>
            <input className="input-luxury w-full" value={formData.amenities.join(', ')} onChange={e => setFormData({ ...formData, amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a) })} placeholder="Comma separated amenities" />
          </div>

          {/* Images */}
          <div>
            <label className="text-sm text-gray-300">Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="input-luxury w-full" />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((preview, i) => (
                  <img key={i} src={preview} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">{editingResort ? 'Update Resort' : 'Create Resort'}</Button>
        </form>
      </Modal>

      {/* Profile Modal */}
      {profileResort && (
        <Modal isOpen={!!profileResort} onClose={closeProfileModal} title="Resort Profile" size="large">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gold-500">{profileResort.name}</h2>
            <p><strong>Location:</strong> {profileResort.location}</p>
            <p><strong>Description:</strong> {profileResort.description}</p>
            <p><strong>Star Rating:</strong> {profileResort.starRating}</p>
            <p><strong>Meal Plan:</strong> {profileResort.mealPlan}</p>
            <p><strong>Amenities:</strong> {profileResort.amenities?.join(', ')}</p>

            {/* Images */}
            {profileResort.images?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profileResort.images.map((img, i) => (
                  <img key={i} src={img} alt="resort" className="w-32 h-32 object-cover rounded" />
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
