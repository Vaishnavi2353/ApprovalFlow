import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

const FileUpload = ({ file, setFile, accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg' }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = useCallback(
    (files) => {
      if (files && files[0]) setFile(files[0]);
    },
    [setFile]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition text-center
          ${dragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'}`}
      >
        <UploadCloud size={32} className="text-primary-500" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Drag & drop your file here, or click to browse
        </p>
        <p className="text-xs text-gray-400">PDF, DOC, DOCX, PNG, JPG — up to 15MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {file && (
        <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} className="text-primary-600 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
            <span className="text-xs text-gray-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-rose-500">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
