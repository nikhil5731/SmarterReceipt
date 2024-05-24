import Nav from "../components/Nav";

function Account({isLightMode}, {toggleMode}) {
    return (
        <div>
            <Nav isLightMode={isLightMode} toggleMode={toggleMode} />
        </div>
    );
}

export default Account;