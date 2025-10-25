import React from 'react';

const CaretDownIcon = ({ isExpanded, className }) => {
    return !isExpanded ? (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 12H18M12 6V18" stroke="#FF78B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    ) : (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 12L18 12" stroke="#FF78B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
};

export default CaretDownIcon;
