import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300,
  className = "",
  size = "md"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`search-bar ${className}`}>
      <InputGroup size={size}>
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <Button
            variant="outline-secondary"
            onClick={handleClear}
            className="clear-button"
          >
            <FaTimes />
          </Button>
        )}
      </InputGroup>
    </div>
  );
};

export default SearchBar;