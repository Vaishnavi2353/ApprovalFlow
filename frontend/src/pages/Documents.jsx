import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import SearchFilters from '../components/SearchFilters';
import StatusBadge from '../components/StatusBadge';
import FileUpload from '../components/FileUpload';

const priorityStyles = {
  low: 'text-gray-400',
  normal: 'text-blue-500',
  high: 'text-amber-500',
  urgent: 'text-rose-500'
};

const NewDocumentModal = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('normal');
  const [file, setFile] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [availableApprovers, setAvailableApprovers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // useEffect(() => {
  //   api.get('/users').then((res) => setAvailableApprovers(res.data.filter((u) => u.role !== 'employee')));
  // }, []);
  useEffect(() => {
  api.get('/users')
    .then((res) => {
      console.log("Users API Response:", res.data);
      setAvailableApprovers(
        res.data.filter((u) => u.role !== 'employee')
      );
    })
    .catch((err) => {
      console.error("Users API Error:", err);
    });
}, []);

  const addApprover = (id) => {
    if (!id || approvers.includes(id)) return;
    setApprovers((prev) => [...prev, id]);
  };
  const removeApprover = (id) => setApprovers((prev) => prev.filter((a) => a !== id));
  const moveApprover = (index, dir) => {
    setApprovers((prev) => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach a file');
    if (approvers.length === 0) return toast.error('Add at least one approver');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('file', file);
    formData.append('approvers', JSON.stringify(approvers));

    setSubmitting(true);
    try {
      const { data } = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document submitted for approval');
      onCreated(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Submit a Document</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input required className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea className="input mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <input className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select className="input mt-1" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Document file</label>
            <FileUpload file={file} setFile={setFile} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Approval chain (in order)
            </label>
            <select className="input" onChange={(e) => addApprover(e.target.value)} value="">
              <option value="">+ Add approver</option>
              {availableApprovers
                .filter((u) => !approvers.includes(u._id))
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>

            <div className="mt-2 flex flex-col gap-2">
              {approvers.map((id, idx) => {
                const u = availableApprovers.find((a) => a._id === id);
                return (
                  <div key={id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Level {idx + 1}: {u?.name} ({u?.role})
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveApprover(idx, -1)} className="p-1 hover:text-primary-600">
                        <ChevronUp size={14} />
                      </button>
                      <button type="button" onClick={() => moveApprover(idx, 1)} className="p-1 hover:text-primary-600">
                        <ChevronDown size={14} />
                      </button>
                      <button type="button" onClick={() => removeApprover(id)} className="p-1 hover:text-rose-500">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(searchParams.get('new') === '1');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    pendingMyApproval: searchParams.get('pendingMyApproval') === 'true'
  });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const { data } = await api.get('/documents', { params });
      setDocs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.priority, filters.pendingMyApproval]);

  useEffect(() => {
    const t = setTimeout(load, 350); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  return (
    <Layout title={filters.pendingMyApproval ? 'Pending My Approval' : 'Documents'}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <SearchFilters filters={filters} setFilters={setFilters} />
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 shrink-0 h-fit"
        >
          <Plus size={16} /> New
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="text-left font-medium px-4 py-3">Title</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Submitted By</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left font-medium px-4 py-3">Priority</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody>
            {!loading && docs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">
                  No documents found.
                </td>
              </tr>
            )}
            {docs.map((d) => (
              <tr
                key={d._id}
                onClick={() => navigate(`/documents/${d._id}`)}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{d.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{d.submittedBy?.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{d.category}</td>
                <td className={`px-4 py-3 font-medium capitalize ${priorityStyles[d.priority]}`}>{d.priority}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{new Date(d.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <NewDocumentModal
          onClose={() => {
            setShowModal(false);
            setSearchParams({});
          }}
          onCreated={(doc) => {
            setShowModal(false);
            setSearchParams({});
            navigate(`/documents/${doc._id}`);
          }}
        />
      )}
    </Layout>
  );
};

export default Documents;
