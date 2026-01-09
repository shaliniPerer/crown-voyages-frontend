import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { roomApi } from '../api/roomApi';
import { resortApi } from '../api/resortApi';
import { uploadApi } from '../api/uploadApi';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const TRANSPORT_METHODS = ['Car', 'Van', 'Bus', 'Boat', 'Train', 'Flight'];

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [resorts, setResorts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    resort: '',
    roomName: '',
    roomType: '',
    description: '',
    size: '',
    bedType: '',
    maxAdults: 2,
    maxChildren: 0,
    price: '',
    amenities: [],
    amenityInput: '',
    transportations: [],
    newTransportType: '',
    newTransportMethod: '',
    availabilityCalendar: [],
    newAvailability: { startDate: '', endDate: '' },
    images: [],
  });

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchRooms();
    fetchResorts();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getRooms();
      setRooms(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      setRooms([]);
    }
  };

  const fetchResorts = async () => {
    try {
      const res = await resortApi.getResorts();
      setResorts(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      setResorts([]);
    }
  };

  /* ---------------- MODAL ---------------- */
  const openModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        resort: room.resort?._id || '',
        roomName: room.roomName || '',
        roomType: room.roomType || '',
        description: room.description || '',
        size: room.size || '',
        bedType: room.bedType || '',
        maxAdults: room.maxAdults || 2,
        maxChildren: room.maxChildren || 0,
        price: room.price || '',
        amenities: room.amenities || [],
        amenityInput: '',
        transportations: room.transportations || [],
        newTransportType: '',
        newTransportMethod: '',
        availabilityCalendar: room.availabilityCalendar || [],
        newAvailability: { startDate: '', endDate: '' },
        images: room.images || [],
      });

      setImageFiles([]);                 // ✅ ADDED (important)
      setImagePreviews(room.images || []);
    } else {
      setEditingRoom(null);
      setFormData({
        resort: '',
        roomName: '',
        roomType: '',
        description: '',
        size: '',
        bedType: '',
        maxAdults: 2,
        maxChildren: 0,
        price: '',
        amenities: [],
        amenityInput: '',
        transportations: [],
        newTransportType: '',
        newTransportMethod: '',
        availabilityCalendar: [],
        newAvailability: { startDate: '', endDate: '' },
        images: [],
      });
      setImageFiles([]);
      setImagePreviews([]);
    }
    setShowModal(true);
  };

  const openProfile = (room) => {
    setSelectedRoom(room);
    setShowProfile(true);
  };

  /* ---------------- AMENITIES ---------------- */
  const addAmenity = () => {
    if (!formData.amenityInput.trim()) return;
    setFormData(f => ({
      ...f,
      amenities: [...f.amenities, f.amenityInput.trim()],
      amenityInput: '',
    }));
  };

  const removeAmenity = i =>
    setFormData(f => ({
      ...f,
      amenities: f.amenities.filter((_, idx) => idx !== i),
    }));

  /* ---------------- TRANSPORTATION ---------------- */
  const addTransportation = () => {
    if (!formData.newTransportType || !formData.newTransportMethod) return;
    setFormData(f => ({
      ...f,
      transportations: [...f.transportations, { type: f.newTransportType, method: f.newTransportMethod }],
      newTransportType: '',
      newTransportMethod: '',
    }));
  };

  const removeTransportation = i =>
    setFormData(f => ({
      ...f,
      transportations: f.transportations.filter((_, idx) => idx !== i),
    }));

  /* ---------------- AVAILABILITY ---------------- */
  const addAvailability = () => {
    const { startDate, endDate } = formData.newAvailability;
    if (!startDate || !endDate) return;
    setFormData(f => ({
      ...f,
      availabilityCalendar: [...f.availabilityCalendar, { startDate, endDate }],
      newAvailability: { startDate: '', endDate: '' },
    }));
  };

  const removeAvailability = i =>
    setFormData(f => ({
      ...f,
      availabilityCalendar: f.availabilityCalendar.filter((_, idx) => idx !== i),
    }));

  /* ---------------- IMAGES (FIXED ONLY HERE) ---------------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // ✅ FIX: append instead of replace
    setImageFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      let imageUrls = [...formData.images];   // ✅ FIX (clone)

      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images', f));
        fd.append('folder', 'rooms');

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/upload/images', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');

        imageUrls = [...imageUrls, ...data.data.urls];
      }

      const payload = { ...formData, images: imageUrls };
      delete payload.amenityInput;
      delete payload.newTransportType;
      delete payload.newTransportMethod;
      delete payload.newAvailability;

      if (editingRoom) {
        await roomApi.updateRoom(editingRoom._id, payload);
        toast.success('Room updated');
      } else {
        await roomApi.createRoom(payload);
        toast.success('Room created');
      }

      setShowModal(false);
      setImageFiles([]);
      setImagePreviews([]);
      fetchRooms();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async id => {
    if (!window.confirm('Delete this room?')) return;
    await roomApi.deleteRoom(id);
    fetchRooms();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gold-500">Room Management</h1>
          <p className="text-gray-900 mt-1"> Manage rooms</p>
        </div>
        <Button icon={FiPlus} onClick={() => openModal()}>Add Room</Button>
      </div>

      {/* Rooms Table */}
      <Card>
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-900">#</th>
              <th className="px-4 py-2 text-left text-gray-900">Resort Name</th>
              <th className="px-4 py-2 text-left text-gray-900">Room Name</th>
              <th className="px-4 py-2 text-left text-gray-900">Type</th>
              <th className="px-4 py-2 text-left text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">No rooms found</td>
              </tr>
            )}
            {rooms.map((room, idx) => (
              <tr key={room._id} className="border-b border-gray-700">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{room.resort?.name || 'Unknown'}</td>
                <td className="px-4 py-2 ">{room.roomName}</td>
                <td className="px-4 py-2">{room.roomType}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="small" icon={FiUsers} onClick={() => openProfile(room)}>Profile</Button>
                  <Button size="small" icon={FiEdit} onClick={() => openModal(room)}>Edit</Button>
                  <Button size="small" icon={FiTrash2} variant="outline" onClick={() => handleDelete(room._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Room Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRoom ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="input-luxury w-full" value={formData.resort} onChange={e => setFormData({ ...formData, resort: e.target.value })} required>
            <option value="">Select Resort</option>
            {resorts.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          <Input label="Room Name" value={formData.roomName} onChange={e => setFormData({ ...formData, roomName: e.target.value })} />
          <Input label="Room Type" value={formData.roomType} onChange={e => setFormData({ ...formData, roomType: e.target.value })} />
          <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          <Input label="Size (sqm)" type="number" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} />
          <Input label="Bed Type" value={formData.bedType} onChange={e => setFormData({ ...formData, bedType: e.target.value })} />

          <div className="flex gap-2">
            <Input label="Adults" type="number" value={formData.maxAdults} onChange={e => setFormData({ ...formData, maxAdults: e.target.value })} />
            <Input label="Children" type="number" value={formData.maxChildren} onChange={e => setFormData({ ...formData, maxChildren: e.target.value })} />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm text-gray-900">Amenities</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.amenities.map((a, i) => (
                <span key={i} className="bg-gold-500 text-black px-2 py-1 rounded flex items-center gap-1">{a}<FiX onClick={() => removeAmenity(i)} className="cursor-pointer" /></span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input className="input-luxury flex-1" value={formData.amenityInput} onChange={e => setFormData({ ...formData, amenityInput: e.target.value })} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} />
              <Button type="button" onClick={addAmenity}>Add</Button>
            </div>
          </div>

          {/* Transportation */}
          <div>
            <label className="text-sm text-gray-900">Transportation</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.transportations.map((t, i) => (
                <span key={i} className="bg-gray-800 text-gray-200 px-2 py-1 rounded flex items-center gap-1">{t.type.toUpperCase()} – {t.method}<FiX onClick={() => removeTransportation(i)} className="cursor-pointer text-red-500" /></span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <select className="input-luxury" value={formData.newTransportType} onChange={e => setFormData({ ...formData, newTransportType: e.target.value })}><option value="">Type</option><option value="arrival">Arrival</option><option value="departure">Departure</option></select>
              <select className="input-luxury" value={formData.newTransportMethod} onChange={e => setFormData({ ...formData, newTransportMethod: e.target.value })}>
                <option value="">Method</option>{TRANSPORT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <Button type="button" onClick={addTransportation}>Add</Button>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm text-gray-900">Availability</label>
            <div className="flex gap-2 mt-2">
              <input type="date" className="input-luxury" value={formData.newAvailability.startDate} onChange={e => setFormData({ ...formData, newAvailability: { ...formData.newAvailability, startDate: e.target.value } })} />
              <input type="date" className="input-luxury" value={formData.newAvailability.endDate} onChange={e => setFormData({ ...formData, newAvailability: { ...formData.newAvailability, endDate: e.target.value } })} />
              <Button type="button" onClick={addAvailability}>Add</Button>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              {formData.availabilityCalendar.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span>{new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}</span>
                  <FiX onClick={() => removeAvailability(i)} className="cursor-pointer text-red-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-sm text-gray-900">Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="input-luxury w-full" />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((preview, i) => (
                  <img key={i} src={preview} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full">{editingRoom ? 'Update Room' : 'Create Room'}</Button>
        </form>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="Room Profile">
        {selectedRoom && (
          <div className="space-y-3">
            <p><strong>Name:</strong> {selectedRoom.roomName}</p>
            <p><strong>Type:</strong> {selectedRoom.roomType}</p>
            <p><strong>Size:</strong> {selectedRoom.size} sqm</p>
            <p><strong>Bed:</strong> {selectedRoom.bedType}</p>
            <p><strong>Max Occupancy:</strong> {selectedRoom.maxAdults} adults, {selectedRoom.maxChildren} children</p>

            {selectedRoom.amenities?.length > 0 && (
              <p><strong>Amenities:</strong> {selectedRoom.amenities.join(', ')}</p>
            )}

            {selectedRoom.transportations?.length > 0 && (
              <p><strong>Transportation:</strong> {selectedRoom.transportations.map(t => `${t.type} – ${t.method}`).join(', ')}</p>
            )}

            {selectedRoom.availabilityCalendar?.length > 0 && (
              <div>
                <strong>Availability:</strong>
                <ul className="list-disc ml-5">
                  {selectedRoom.availabilityCalendar.map((a, i) => (
                    <li key={i}>{new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Images */}
            {selectedRoom.images?.length > 0 && (
              <div>
                <strong>Images:</strong>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {selectedRoom.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`room-${i}`}
                      className="w-full h-32 object-cover rounded shadow"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default RoomManagement;
