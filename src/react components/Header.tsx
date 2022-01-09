import React from 'react';

/** The props (arguments) to create a header element */
interface headerProps {

}

/** The header of the application. */
const Header: React.FC<headerProps> = (p: headerProps) => {

    return (
        <header id="header">
            {"Offshore Wind Recruitment".toUpperCase()}
            <button className='green'>Home</button>
            <button className='green'>Survey</button>
        </header>
    );
}

export default Header;