import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tiff', '.tif'],
  'image/gif': ['.gif'],
};

export const Dropzone = ({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled?: boolean }) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="dropzone__inner">
        <div className="dropzone__icon">
          <UploadCloud size={28} strokeWidth={1.6} />
        </div>
        <p className="dropzone__title">
          {isDragActive ? 'Drop to load the chamber' : 'Drag images here, or click to browse'}
        </p>
        <p className="dropzone__hint">JPEG · PNG · WebP · TIFF · GIF — up to 50MB each</p>
      </div>
      <div className="dropzone__corner dropzone__corner--tl" />
      <div className="dropzone__corner dropzone__corner--tr" />
      <div className="dropzone__corner dropzone__corner--bl" />
      <div className="dropzone__corner dropzone__corner--br" />
    </div>
  );
};
