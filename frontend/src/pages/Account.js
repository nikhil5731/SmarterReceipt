import Nav from "../components/Nav";
import { toggleMode as helperToggleMode } from '../helpers';
import { useState, useEffect } from "react";

function Account() {

    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('isLightMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        document.body.style.background = isLightMode ? "#fff" : "#000";
        document.body.style.color = isLightMode ? "#000" : "#fff";
    }, [isLightMode]);


    const toggleMode = () => {
        helperToggleMode(isLightMode, setIsLightMode);
    };

    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
        </div>
    );
}

export default Account;