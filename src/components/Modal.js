import React from 'react';
import './Modal.css'; // Import the CSS file for styling

const Modal = ({ isOpen, onClose, src, alt }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <span className="close" onClick={onClose}>&times;</span>
      <img src={src} alt={alt} />
    </div>
  );
};

export default Modal;
