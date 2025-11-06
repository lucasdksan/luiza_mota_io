import React, { useState } from "react";
import { classGenerator } from "../../utils/classGenerator";

function SearchMobileCustom({
    VtexFlexLayout,
    VtexSearchBar
}) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    return (
        <>
            <VtexFlexLayout>
                <button
                    className={classGenerator("vtex-search-custom-mobile", "button")}
                    onClick={toggleMenu}
                    aria-label="Abrir menu"
                >
                    {!isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <path d="M21.0607 21.0814L28 28M24 14C24 19.5228 19.5228 24 14 24C8.47715 24 4 19.5228 4 14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14Z" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.9563 15.2938C16.0023 15.3367 16.0393 15.3884 16.0649 15.4459C16.0905 15.5034 16.1043 15.5655 16.1054 15.6285C16.1065 15.6914 16.0949 15.7539 16.0714 15.8123C16.0478 15.8706 16.0127 15.9237 15.9682 15.9682C15.9237 16.0127 15.8706 16.0478 15.8123 16.0714C15.7539 16.0949 15.6914 16.1065 15.6285 16.1054C15.5655 16.1043 15.5034 16.0905 15.4459 16.0649C15.3884 16.0393 15.3367 16.0023 15.2938 15.9563L10 10.6633L4.70628 15.9563C4.61742 16.0391 4.49989 16.0842 4.37845 16.082C4.25701 16.0799 4.14115 16.0307 4.05526 15.9448C3.96938 15.8589 3.92018 15.743 3.91804 15.6216C3.9159 15.5002 3.96098 15.3826 4.04378 15.2938L9.33675 10L4.04378 4.70628C3.96098 4.61742 3.9159 4.49989 3.91804 4.37845C3.92018 4.25701 3.96938 4.14115 4.05526 4.05526C4.14115 3.96938 4.25701 3.92018 4.37845 3.91804C4.49989 3.9159 4.61742 3.96098 4.70628 4.04378L10 9.33675L15.2938 4.04378C15.3826 3.96098 15.5002 3.9159 15.6216 3.91804C15.743 3.92018 15.8589 3.96938 15.9448 4.05526C16.0307 4.14115 16.0799 4.25701 16.082 4.37845C16.0842 4.49989 16.0391 4.61742 15.9563 4.70628L10.6633 10L15.9563 15.2938Z" fill="#27241D" />
                        </svg>
                    )}
                </button>
            </VtexFlexLayout>
            {isOpen && (
                <div className={classGenerator("vtex-search-custom-mobile", "container")}>
                    <VtexSearchBar />
                </div>
            )}
        </>
    );
}

export default SearchMobileCustom;