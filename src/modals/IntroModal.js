import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';

const IntroModal = ({ isOpen, onRequestClose, content, onNext, onPrev, isFirstStep, isLastStep }) => (
  <Modal show={isOpen} onHide={onRequestClose} centered className='intro-modal'> 
    <Modal.Header>
      <div className='close-button' onClick={onRequestClose}>
        <div className='close-icon'></div>
      </div>
      <Modal.Title>{content.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className='intro-modal-content'>
        <p><FaInfoCircle />{content.description}</p>
      </div>      
    </Modal.Body>
    <Modal.Footer>
      <button className='intro-btn' onClick={onPrev} disabled={isFirstStep}> <FaArrowLeft /> {'Prev'}</button>
      <button className='intro-btn' onClick={onNext} disabled={isLastStep}> {'Next'} <FaArrowRight /></button>
      <button className='intro-btn' onClick={onRequestClose}><FaCheckCircle /> {'Close'}</button>
    </Modal.Footer>
  </Modal>
);

export default IntroModal;
