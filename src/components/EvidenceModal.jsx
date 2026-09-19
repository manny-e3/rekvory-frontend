import React, { useState } from 'react';
import { X, UploadCloud, File, CheckCircle } from 'lucide-react';
import { claimService } from '../services';

export default function EvidenceModal({ claim, onClose, onAddEvidence }) {
  const [fileType, setFileType] = useState('Bank Statement');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('320 KB');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setFileName(f.name);
      setFileSize(`${Math.round(f.size / 1024)} KB`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileName) return;

    setIsUploading(true);
    try {
      const res = await claimService.uploadEvidence(claim.id, selectedFile, fileType);
      if (res?.data && onAddEvidence) {
        onAddEvidence(claim.id, res.data);
      }
      onClose();
    } catch (err) {
      console.error('Failed to upload evidence:', err);
      alert(err.message || 'Failed to upload evidence file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div>
            <h3 className="title-lg" style={{ color: 'var(--primary-navy)' }}>
              Attach Supplementary Evidence
            </h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>
              Case {claim.id} • Secure Document Repository
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="form-group">
              <label className="form-label">Evidence Classification</label>
              <select
                className="form-select"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <option value="Bank Statement">Bank Statement</option>
                <option value="Debit Alert">Debit Alert</option>
                <option value="POS Decline Slip">POS Decline Slip</option>
                <option value="Voucher">Voucher</option>
              </select>
            </div>

            {/* Drop Zone */}
            <div
              style={{
                border: '2px dashed var(--neutral-border)',
                borderRadius: 'var(--rounded-md)',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--surface-container-low)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input
                type="file"
                onChange={handleSimulateSelect}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <UploadCloud size={36} color="var(--trust-blue)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px', color: 'var(--primary-navy)' }}>
                {fileName ? fileName : 'Drag & drop evidence file or browse'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px' }}>
                Supported: PDF, JPG, PNG, Excel up to 25MB (Encrypted storage)
              </p>
            </div>

            {fileName && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--rounded-md)',
                  fontSize: '13px',
                  color: '#065f46'
                }}
              >
                <CheckCircle size={18} />
                <span style={{ fontWeight: 600 }}>{fileName}</span>
                <span style={{ color: 'var(--outline)', fontSize: '12px' }}>({fileSize}) ready for lodgement</span>
              </div>
            )}

            <div style={{ fontSize: '12px', color: 'var(--outline)', lineHeight: '1.4' }}>
              All uploaded evidence undergoes cryptographic hash timestamping for admissibility before interbank arbiters and regulatory authorities.
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-gold"
              disabled={!fileName || isUploading}
            >
              {isUploading ? 'Uploading & Hashing Document...' : 'Upload & Lodge Document'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
