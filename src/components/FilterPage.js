import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';

const FilterPage = ({ onApplyFilters }) => {



  const [key, setKey] = useState('plot');

  const priceRanges = [
    { id: 'price1', label: '2500000 - 4999999', value: '2500000-4999999' },
    { id: 'price2', label: '5000000 - 7499999', value: '5000000-7499999' },
    { id: 'price3', label: '7500000 - 9999999', value: '7500000-9999999' },
    { id: 'price4', label: '10000000 - 12499999', value: '10000000-12499999' },
    { id: 'price5', label: '12500000 - 14999999', value: '12500000-14999999' },
    { id: 'price6', label: '> 15000000', value: '15000000+' }
  ];

  const plotTypes = [
    { id: 'plot_type1', label: 'Residential Plot', value: 'Residential Plot' },
    { id: 'plot_type2', label: 'Commercial Plot', value: 'Commercial Plot' }
    // Add more plot types as needed
  ];

  const areaRanges = [
    { id: 'area1', label: '0 - 500', value: '0-500' },
    { id: 'area2', label: '501 - 1000', value: '501-1000' },
    { id: 'area3', label: '1001 - 1500', value: '1001-1500' },
    { id: 'area4', label: '1501 - 2000', value: '1501-2000' },
    { id: 'area5', label: '2001 - 2500', value: '2001-2500' },
    { id: 'area6', label: '2501 - 3000', value: '2501-3000' },
    { id: 'area7', label: '3000 - 3500', value: '3000-3500' },
    { id: 'area8', label: '3501 - 4000', value: '3501-4000' },
    { id: 'area9', label: '> 4500', value: '4500+' },
    // Add more plot types as needed
  ];

  const directionRanges = [
    { id: 'direction1', label: 'East', value: 'East' },
    { id: 'direction2', label: 'West', value: 'West' },
    { id: 'direction3', label: 'North', value: 'North' },
    { id: 'direction4', label: 'South', value: 'South' },
    { id: 'direction5', label: 'North/East', value: 'North/East' },
    { id: 'direction6', label: 'North/West', value: 'North/West' },
    { id: 'direction7', label: 'South/East', value: 'South/East' },
    { id: 'direction8', label: 'South/West', value: 'South/West' },
  ]




  const initialCheckboxes = [...priceRanges, ...plotTypes, ...areaRanges, ...directionRanges].reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});


  const [filterCriteria, setFilterCriteria] = useState({});


  const [checkboxes, setCheckboxes] = useState(initialCheckboxes);

  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes(prevState => ({
      ...prevState,
      [name]: checked,
    }));

    if (checked) {
      const filter = [...priceRanges, ...plotTypes, ...areaRanges, ...directionRanges].find(item => item.id === name);
      setSelectedFilters(prevState => [...prevState, filter]);
    } else {
      setSelectedFilters(prevState => prevState.filter(item => item.id !== name));
    }
  };

  const handleRemoveFilter = (filterId) => {
    setCheckboxes(prevState => ({
      ...prevState,
      [filterId]: false,
    }));
    setSelectedFilters(prevState => prevState.filter(item => item.id !== filterId));
  };





  const handleApplyFilters = () => {
    const newFilterCriteria = {};

    // Extract plot type filters
    const selectedPlotTypes = plotTypes
      .filter(type => checkboxes[type.id])
      .map(type => type.value);

    if (selectedPlotTypes.length > 0) {
      newFilterCriteria['plot_type'] = selectedPlotTypes;
    }

    // Extract price range filters
    const selectedPrices = priceRanges
      .filter(range => checkboxes[range.id])
      .map(range => range.value);

    if (selectedPrices.length > 0) {
      newFilterCriteria['actual_price'] = selectedPrices;
    }

    // Extract area range filters
    const selectedAreas = areaRanges
      .filter(range => checkboxes[range.id])
      .map(range => range.value);

    if (selectedAreas.length > 0) {
      newFilterCriteria['plot_size'] = selectedAreas;
    }

    //Extract Direction Range Filters
    const selectedDirections = directionRanges
      .filter(range => checkboxes[range.id])
      .map(range => range.value);

    if (selectedDirections.length > 0) {
      newFilterCriteria['direction'] = selectedDirections;
    }


    // Pass filter criteria to parent component
    onApplyFilters(newFilterCriteria);

    // console.log(newFilterCriteria);
  };

  const handleReset = () => {
    const resetCheckboxes = { ...initialCheckboxes };
    setCheckboxes(resetCheckboxes);
    setSelectedFilters([]);
  };





  return (

    <div className='instant-booking-bg'>
      <div className='container-fluid'>
        <div className='row instant-booking-row'>
          <div className='col-md-12'>
            <div className='instant-booking-card'>
              <div className='instant-booking-row row'>
                <div className='col-md-12'>
                  <div className='filter-form-div'>
                    <div className='filter-form-head'>
                      <h4>Filter</h4>
                    </div>

                    <div className='filter-content-div'>
                      <Tabs
                        id="controlled-tab-example"
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className="mb-3"
                      >

                        <Tab eventKey="plot" title="Plot">
                          <div className='row filter-content'>
                            {plotTypes.map((type) => (
                              <div className='col-md-6' key={type.id}>
                                <div className="form-group form-check">
                                  <label className="form-check-label">
                                    <input
                                      className="form-check-input"
                                      name={type.id}
                                      checked={checkboxes[type.id]}
                                      onChange={handleCheckboxChange}
                                      type="checkbox"
                                    />
                                    {type.label}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Tab>

                        <Tab eventKey="price" title="Price">
                          <div className='row filter-content'>
                            {priceRanges.map((range, index) => (
                              <div className='col-md-3' key={range.id}>
                                <div className="form-group form-check">
                                  <label className="form-check-label">
                                    <input
                                      className="form-check-input"
                                      name={range.id}
                                      checked={checkboxes[range.id]}
                                      onChange={handleCheckboxChange}
                                      type="checkbox"
                                    />
                                    {range.label}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Tab>

                        <Tab eventKey="area" title="Area">
                          <div className='row filter-content'>
                            {areaRanges.map((range, index) => (
                              <div className='col-md-3' key={range.id}>
                                <div className="form-group form-check">
                                  <label className="form-check-label">
                                    <input
                                      className="form-check-input"
                                      name={range.id}
                                      checked={checkboxes[range.id]}
                                      onChange={handleCheckboxChange}
                                      type="checkbox"
                                    />
                                    {range.label}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Tab>
                        <Tab eventKey="direction" title="Direction">
                          <div className='row filter-content'>
                            {directionRanges.map((range, index) => (
                              <div className='col-md-3' key={range.id}>
                                <div className="form-group form-check">
                                  <label className="form-check-label">
                                    <input
                                      className="form-check-input"
                                      name={range.id}
                                      checked={checkboxes[range.id]}
                                      onChange={handleCheckboxChange}
                                      type="checkbox"
                                    />
                                    {range.label}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Tab>
                      </Tabs>
                    </div>
                    <div className='filter-form-footer'>

                      <div className='selected-filters'>
                        {selectedFilters.map(filter => (
                          <div key={filter.id} className='selected-filter-item'>
                            {filter.label}
                            <Button onClick={() => handleRemoveFilter(filter.id)}>x</Button>
                          </div>
                        ))}
                      </div>

                      <Button className='proceed-button' onClick={handleApplyFilters}>Apply</Button>
                      <Button className='reset-button' onClick={handleReset}>Reset</Button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default FilterPage;
