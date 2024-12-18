import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './modal.css';

function App() {
  const [value, setValue] = useState(''); 
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suggestionData, setSuggestionData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFirstClick, setIsFirstClick] = useState(false);

  const inputRef = useRef(null);
  const suggestionsListRef = useRef(null);

  useEffect(() => {
    async function fetchSuggestions() {
      const url = 'https://countriesnow.space/api/v0.1/countries/population/cities';
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error fetching suggestions: ${response.status}`);
        }
        const data = await response.json();
        setSuggestionData(data.data);
      } catch (error) {
        console.error('Error fetching suggestion data:', error);
      }
    }

    fetchSuggestions();
  }, []);

  const handleChange = (event) => {
    const query = event.target.value;
    setValue(query);

    if (query.length === 0) {
      const filtered = suggestionData;
      setFilteredSuggestions(filtered);
    } else {
      const filtered = suggestionData.filter((item) =>
        item.city.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsListVisible(filtered.length > 0);
      setErrorMessage(filtered.length === 0 ? 'No matches found.' : '');
    }
  };

  const handleFocus = () => {
    if (!isFirstClick) {
      setFilteredSuggestions(suggestionData);
      setIsListVisible(true);
      setIsFirstClick(true); 
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} style={{ fontWeight: 'bold', color: 'black' }}>{part}</span>
      ) : (
        part
      )
    );
  };

  const handleSuggestionClick = async (suggestion) => {
    const city = suggestion.city; 
    setValue(city); 
    const data = await getData(suggestion);
    if (data) {
      setModalData(data);
      setIsModalVisible(true);
      setIsListVisible(false);
    } else {
      setErrorMessage('No matches found.');
    }
  };

  async function getData(suggestion) {
    const url = `https://countriesnow.space/api/v0.1/countries/population/cities`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }

      const json = await response.json();
      const cityDetails = json.data.find(item => item.city === suggestion.city);

      if (cityDetails) {
        return {
          city: cityDetails.city,
          country: cityDetails.country,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      return null;
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalData(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target) && 
        suggestionsListRef.current && !suggestionsListRef.current.contains(event.target)
      ) {
        setIsListVisible(false); 
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="App">
      <form>
        <label>
          Multiple Selections
          <div>
            <input
              type="text"
              id="inputField"
              placeholder="Choose several states..."
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              style={{ width: '500px', borderRadius: "5px" }}
              ref={inputRef} 
            />
          </div>
        </label>
      </form>

      {isListVisible && (
        <div
          id="suggestionsList"
          className="suggestions-list"
          ref={suggestionsListRef} 
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {highlightText(suggestion.city, value)}
            </div>
          ))}
        </div>
      )}

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {isModalVisible && modalData && (
        <div id="modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>City Details</h2>
            <p><strong>City:</strong> {modalData.city}</p>
            <p><strong>Country:</strong> {modalData.country}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
