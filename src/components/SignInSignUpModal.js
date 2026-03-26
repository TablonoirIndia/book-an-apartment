import React, { useState, useContext } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import * as apiUrl from '../apiUrl';
import AuthContext from './AuthContext';


const SignInSignUpModal = ({ show, onSignIn, setSuccessMessage, successMessage, onSignInSuccess }) => {

    const { signIn } = useContext(AuthContext);

    const [isSignUp, setIsSignUp] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    // const [successMessage, setSuccessMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [showSignInModal, setShowSignInModal] = useState(false);

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setFormErrors({});
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleClose = () => {
        setShowSignInModal(false);
    };

    const handleSignIn = async () => {
        const errors = {};
        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Please enter a registered phone number';
        } else if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
            errors.phoneNumber = 'Phone number must be exactly 10 numeric digits';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
        } else {

            try {
                const response = await signIn(phoneNumber);                

                if (response && response.data && response.data.user && response.data.user.name) {
                    const { name } = response.data.user;

                    setSuccessMessage(`Sign in successful. Welcome, ${name}! Redirecting...`);
                    setErrorMessage('');
                    setFormErrors('');

                    setTimeout(() => {
                        // onSignIn();  
                        onSignInSuccess(response.data.user.id);                     
                        handleClose();
                    }, 2000);

                } else {

                    console.log('User data not found in response');
                    setErrorMessage('Sign in failed. Please check your phone number and try again.');
                    setSuccessMessage('');
                    setFormErrors({});
                }

            } catch (error) {
                console.error('handleSignIn error:', error);
                setErrorMessage('Sign in failed. Please check your phone number and try again.');
                setSuccessMessage('');
                setFormErrors('');
            }

        }
    };

    const handleSignUp = async () => {
        const errors = {};
        if (!name.trim()) {
            errors.name = 'Please enter your name';
        }
        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Please enter your phone number';
        } else if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
            errors.phoneNumber = 'Phone number must be exactly 10 numeric digits';
        }
        if (!email.trim()) {
            errors.email = 'Please enter your email';
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            errors.email = 'Invalid email format';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);

        } else {
            try {
                const response = await axios.post(apiUrl.apiUrl + `/api/users/store`, { Name: name, Phone: phoneNumber, emailID: email });
                setSuccessMessage(`Signup successful. Welcome, ${response.data.user.name}!`);
                setErrorMessage('');
                setFormErrors({});
                setTimeout(() => {
                    setIsSignUp(false); // Switch to sign-in mode after successful sign-up
                    setSuccessMessage('');
                }, 2000); // Delay to allow users to see the success message
            } catch (error) {
                setErrorMessage('Sign-up failed. Email or phone number might already be in use.');
                setSuccessMessage('');
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header>
                <Modal.Title>{isSignUp ? 'Sign Up' : 'Sign In'}</Modal.Title>
                <div className='close-button ' onClick={handleClose}>
                    <div className='close-icon'></div>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {isSignUp && (
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Control
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Control
                            type="text"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
                    </Form.Group>
                    {isSignUp && (
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                        </Form.Group>
                    )}
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    <Button className="sing-in-button" onClick={(e) => { e.preventDefault(); isSignUp ? handleSignUp() : handleSignIn(); }}>
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <div className='sign-up-colse'>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <p><a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </a></p>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SignInSignUpModal;
