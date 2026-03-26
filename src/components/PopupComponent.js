import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

const PopupComponent = ({ data, error }) => {

    const [FilterShow, setFilterShow] = useState(false); 
   
    useEffect(() => {
        if (data && data.length > 0) {
            setFilterShow(true);
        } else if (error) {
            setFilterShow(true);
        } else {
            setFilterShow(false);
        }
    }, [data, error]);

    const FilterhandleClose = () => setFilterShow(false);

    return (
        <Modal show={FilterShow} onHide={FilterhandleClose} className='filter-data'>

              <Modal.Header>
                <Modal.Title>Available Units</Modal.Title>                
            </Modal.Header>
            <Modal.Body>

            {error ? (                 
                    <p>{error}</p>  
                ) : (         
           
                <table className='filter-data-table'>
                    <thead>
                        <tr>
                            <th>Project</th>
                            {/* <th>Block</th>
                            <th>Section</th> */}
                            <th>Plot Number</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>

                        {data.map((item, index) => (
                            <tr key={index}>
                                <td> {item.project_name} </td>
                                {/* <td> {item.block} </td>
                                <td> {item.section} </td> */}
                                <td> {item.plot_number} </td>
                                <td> {item.status} </td>
                            </tr>
                        ))}
                    </tbody>
                </table> 
                  )}                
                   
                <div className='filter-data-footer'>
                    <Button className='proceed-button' onClick={FilterhandleClose}>Okay</Button>
                </div>

            </Modal.Body>
              
        </Modal>
    );
};

export default PopupComponent;

