import { useState } from 'react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const onAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('department', department);
      formData.append('designation', designation);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ ...user, ...data });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Profile">
      <div className="max-w-lg card p-6">
        <form onSubmit={save} className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              {preview ? (
                <img src={preview} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 mt-1 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
            <input className="input mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
            <input className="input mt-1" value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary mt-2">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
