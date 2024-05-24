import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ModeToggler = ({ isLightMode, toggleMode }) => {
    return (
        <div className="mode-toggler" onClick={toggleMode}>
            <div className={`toggle-container ${isLightMode ? 'light' : 'dark'}`}>
                <FontAwesomeIcon icon={faSun} className={`icon sun-icon ${isLightMode ? 'light-icon' : 'dark-icon'}`} />
                <FontAwesomeIcon icon={faMoon} className="icon moon-icon" />
            </div>
        </div>
    );
};

export default ModeToggler;
