import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PdfPreview from '../components/PdfPreview';
import ApprovalTimeline from '../components/ApprovalTimeline';

const DocumentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/documents/${id}`);
    setDoc(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!doc) {
    return (
      <Layout title="Document">
        <p className="text-sm text-gray-400">Loading...</p>
      </Layout>
    );
  }

  const myStep = doc.approvalChain.find(
    (s) => s.level === doc.currentLevel && s.approver?._id === user._id && s.status === 'pending'
  );
  const canAct = !!myStep && (doc.status === 'in_review' || doc.status === 'pending');

  const act = async (decision) => {
    setActing(true);
    try {
      await api.put(`/documents/${id}/action`, { decision, comment });
      toast.success(decision === 'approved' ? 'Document approved' : 'Document rejected');
      setComment('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const download = () => {
    window.open(`/api/documents/${id}/download`, '_blank');
  };

  return (
    <Layout title="Document Detail">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{doc.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{doc.description || 'No description provided.'}</p>
              </div>
              <StatusBadge status={doc.status} />
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span>Submitted by <b className="text-gray-700 dark:text-gray-200">{doc.submittedBy?.name}</b></span>
              <span>Category: <b className="text-gray-700 dark:text-gray-200">{doc.category}</b></span>
              <span>Priority: <b className="text-gray-700 dark:text-gray-200 capitalize">{doc.priority}</b></span>
              <span>Submitted: <b className="text-gray-700 dark:text-gray-200">{new Date(doc.createdAt).toLocaleDateString()}</b></span>
            </div>
          </div>

          <PdfPreview
            fileUrl={doc.filePath}
            fileName={doc.fileName}
            fileType={doc.fileType}
            onDownload={download}
          />

          {canAct && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Decision</h3>
              <textarea
                className="input"
                rows={3}
                placeholder="Add an optional comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex gap-3 mt-3">
                <button disabled={acting} onClick={() => act('approved')} className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button disabled={acting} onClick={() => act('rejected')} className="btn-primary flex items-center gap-2 bg-rose-600 hover:bg-rose-700">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">History</h3>
            <div className="flex flex-col gap-3">
              {doc.history.map((h, i) => (
                <div key={i} className="text-sm flex items-start gap-2">
                  <span className="text-gray-400 shrink-0 w-36">{new Date(h.at).toLocaleString()}</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    <b>{h.by?.name || 'System'}</b> {h.action} {h.note ? `— "${h.note}"` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Approval Chain</h3>
            <ApprovalTimeline chain={doc.approvalChain} currentLevel={doc.currentLevel} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentDetail;
