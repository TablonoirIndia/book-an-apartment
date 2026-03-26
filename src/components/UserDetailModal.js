import React, { useState, useContext } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaHeart, FaClipboardList, FaUser, FaSignOutAlt } from 'react-icons/fa';

import AuthContext from './AuthContext';
import UserTableComponent from './UserTable';

const UserDetailModal = ({ show, onClose }) => {

    const { signOut } = useContext(AuthContext);

    const [FilterShow, setFilterShow] = useState(false);
    const FilterhandleClose = () => setFilterShow(false);
    const FilterhandleShow = () => setFilterShow(true);
    const [filterResult, setFilterResult] = useState(null);

    const handleSignOut = async () => {       
        try {           
            await signOut();           
            onClose();
        } catch (error) {
            console.error('Error during sign out:', error);
        }
    };


    return (
        <div>
        <Modal show={show} onHide={onClose} backdropClassName="custom-backdrop" className="modal-right" aria-labelledby="contained-modal-title-vcenter">
            <Modal.Body>
                <div className="modal-button-group">
                    <Button variant="light" className="modal-button" onClick={FilterhandleShow}>
                        <FaHeart className="modal-button-icon" /> Wishlists
                    </Button>
                    <Button variant="light" className="modal-button" onClick={FilterhandleShow}>
                        <FaClipboardList className="modal-button-icon" /> Reserved
                    </Button>
                    <Button variant="light" className="modal-button" onClick={FilterhandleShow}>
                        <FaUser className="modal-button-icon" /> Profile
                    </Button>
                    <Button variant="light" className="modal-button" onClick={handleSignOut}>
                        <FaSignOutAlt className="modal-button-icon" /> Logout
                    </Button>
                </div>
            </Modal.Body>
        </Modal>

        {/* </div>

            <div> */}

            <Modal className="filter-popup" show={FilterShow} size='lg' onHide={FilterhandleClose} aria-labelledby="contained-modal-title-vcenter"
            centered>          
            <Modal.Body>
                <div className='close-button ' onClick={FilterhandleClose}>
                <div className='close-icon'></div>
                </div>
                <UserTableComponent />
            </Modal.Body>
            </Modal>
            </div>
    );
};

export default UserDetailModal;
