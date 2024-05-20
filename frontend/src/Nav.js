import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faBars } from '@fortawesome/free-solid-svg-icons';
import ModeToggler from './ModeToggler';
import { openMenu, closeMenu } from './helpers';

function Nav({ isLightMode, toggleMode }) {
    return (
        <div>
            <nav>
                <ModeToggler isLightMode={isLightMode} toggleMode={toggleMode} />
                <div className="burger" onClick={openMenu}>
                    <FontAwesomeIcon icon={faBars} size="3x" />
                </div>
            </nav>
            <div className="menu">
                <ul>
                    <li onClick={toggleMode}>Home</li>
                    <li>About</li>
                    <li>Services</li>
                    <li>Contact</li>
                </ul>
                <div className="close-button" onClick={closeMenu}>
                    <FontAwesomeIcon icon={faX} />
                </div>
            </div>
        </div>
    );
}

export default Nav;
