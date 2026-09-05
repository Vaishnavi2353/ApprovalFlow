import { useState } from 'react';
import { Download, X, Maximize2 } from 'lucide-react';

// Simple, dependency-free PDF preview using the browser's native PDF viewer
// inside an <iframe>. Works for any file served from /uploads. For non-PDF
// files (doc/docx/images) it falls back to a friendly "no inline preview" card.
const PdfPreview = ({ fileUrl, fileName, fileType, onDownload }) => {
  const [expanded, setExpanded] = useState(false);
  const isPdf = fileType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');
  const isImage = fileType?.startsWith('image/');

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{fileName}</span>
        <div className="flex items-center gap-2">
          {isPdf && (
            <button onClick={() => setExpanded(true)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Maximize2 size={16} className="text-gray-500" />
            </button>
          )}
          <button onClick={onDownload} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Download size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-950">
        {isPdf && <iframe title="pdf-preview" src={fileUrl} className="w-full h-[420px]" />}
        {isImage && <img src={fileUrl} alt={fileName} className="w-full max-h-[420px] object-contain" />}
        {!isPdf && !isImage && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
            No inline preview available for this file type.
            <button onClick={onDownload} className="text-primary-600 hover:underline">
              Download to view
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <span className="font-medium text-gray-800 dark:text-gray-100">{fileName}</span>
              <button onClick={() => setExpanded(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} />
              </button>
            </div>
            <iframe title="pdf-preview-full" src={fileUrl} className="flex-1 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfPreview;
