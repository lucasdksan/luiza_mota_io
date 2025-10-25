import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { schema } from "./schema";
import { classGenerator } from "../../utils/classGenerator";
import LoginButton from "./components/LoginButton";
import LoginModal from "./components/LoginModal";

function MenuMobile({
    VtexFlexLayoutContentBTN,
    menuItems = [],
    myWishListLink = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const sidebarRef = useRef(null);
    const overlayRef = useRef(null);
    const items = menuItems;

    if (!items.length || items.length === 0) {
        return null;
    }

    const toggleMenu = () => {
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    const toggleLogin = () => {
        setIsOpenModal(true);
        closeMenu();
    }

    const openMenu = () => {
        setIsOpen(true);
        setIsAnimating(true);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (sidebarRef.current) {
                    sidebarRef.current.style.transform = 'translateX(0)';
                }
                if (overlayRef.current) {
                    overlayRef.current.style.opacity = '1';
                }

                setTimeout(() => {
                    setIsAnimating(false);
                }, 300);
            });
        });
    };

    const closeMenu = () => {
        setIsAnimating(true);

        if (sidebarRef.current) {
            sidebarRef.current.style.transform = 'translateX(-100%)';
        }
        if (overlayRef.current) {
            overlayRef.current.style.opacity = '0';
        }

        setTimeout(() => {
            setIsOpen(false);
            setIsAnimating(false);
            setExpandedSections({});
        }, 300);
    };

    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    useEffect(() => {
        if (isOpen || isAnimating) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isAnimating]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const CloseIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none">
            <path d="M7.25 7.25L21.75 21.75M21.75 7.25L7.25 21.75" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );

    const PlusIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5.5 11H16.5M11 5.5V16.5" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
    
    const HeatIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
            <path d="M16.8001 4.66648C15.9167 3.78082 14.7457 3.24026 13.4987 3.14245C12.2516 3.04465 11.0107 3.39603 10.0001 4.13315C8.93978 3.34451 7.62006 2.98691 6.30667 3.13234C4.99327 3.27778 3.78377 3.91546 2.92171 4.91697C2.05966 5.91847 1.60909 7.20941 1.66073 8.52982C1.71238 9.85023 2.26242 11.102 3.20007 12.0331L8.37507 17.2165C8.80842 17.643 9.39206 17.882 10.0001 17.882C10.6081 17.882 11.1917 17.643 11.6251 17.2165L16.8001 12.0331C17.7731 11.0542 18.3192 9.73004 18.3192 8.34981C18.3192 6.96958 17.7731 5.64542 16.8001 4.66648ZM15.6251 10.8831L10.4501 16.0581C10.3912 16.1176 10.3211 16.1648 10.2439 16.197C10.1666 16.2292 10.0838 16.2458 10.0001 16.2458C9.91638 16.2458 9.83352 16.2292 9.75628 16.197C9.67904 16.1648 9.60896 16.1176 9.55007 16.0581L4.37507 10.8581C3.72153 10.1901 3.35558 9.2927 3.35558 8.35815C3.35558 7.42359 3.72153 6.52619 4.37507 5.85815C5.04103 5.20064 5.93921 4.83195 6.87507 4.83195C7.81092 4.83195 8.7091 5.20064 9.37507 5.85815C9.45254 5.93625 9.5447 5.99825 9.64625 6.04056C9.7478 6.08286 9.85672 6.10464 9.96673 6.10464C10.0767 6.10464 10.1857 6.08286 10.2872 6.04056C10.3888 5.99825 10.4809 5.93625 10.5584 5.85815C11.2244 5.20064 12.1225 4.83195 13.0584 4.83195C13.9943 4.83195 14.8924 5.20064 15.5584 5.85815C16.2209 6.51744 16.5989 7.40997 16.6114 8.34455C16.6238 9.27913 16.2698 10.1814 15.6251 10.8581V10.8831Z" fill="#FF78B0" />
        </svg>
    );

    return (
        <>
            <VtexFlexLayoutContentBTN>
                <button
                    className={classGenerator("vtex-menu-mobile", "btn")}
                    onClick={toggleMenu}
                    aria-label="Abrir menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
                        <path d="M5.33301 8.5H26.6663M5.33301 16.5H26.6663M5.33301 24.5H26.6663" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </VtexFlexLayoutContentBTN>

            {(isOpen || isAnimating) && createPortal(
                <>
                    <div
                        ref={overlayRef}
                        className={classGenerator("vtex-menu-mobile", "overlay")}
                        onClick={closeMenu}
                        style={{
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out'
                        }}
                    />

                    <div
                        ref={sidebarRef}
                        className={classGenerator("vtex-menu-mobile", "sidebar")}
                        style={{
                            transform: 'translateX(-100%)',
                            transition: 'transform 0.3s ease-in-out'
                        }}
                    >
                        <div className={classGenerator("vtex-menu-mobile", "header")}>
                            <LoginButton handleLoginBtn={toggleLogin} />
                            <button
                                className={classGenerator("vtex-menu-mobile", "close-btn")}
                                onClick={closeMenu}
                                aria-label="Fechar menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className={classGenerator("vtex-menu-mobile", "content")}>
                            <ul className={classGenerator("vtex-menu-mobile", "nav-section")}>
                                {items.map((item, index) => (
                                    <li key={index} className={classGenerator("vtex-menu-mobile", "nav-item")}>
                                        <button
                                            className={classGenerator("vtex-menu-mobile", "nav-button")}
                                            onClick={() => item.sub_category.length > 0 ? toggleSection(index) : null}
                                        >
                                            {item.sub_category.length === 0 ? (
                                                <a href={item.see_all} className={classGenerator("vtex-menu-mobile", "nav-label")}>
                                                    {item.category_name}
                                                </a>
                                            ) : (
                                                <span className={classGenerator("vtex-menu-mobile", "nav-label")}>
                                                    {item.category_name}
                                                </span>
                                            )}
                                            {item.sub_category.length > 0 && (
                                                <div className={`${classGenerator("vtex-menu-mobile", "nav-icon")} ${expandedSections[index] ? classGenerator("vtex-menu-mobile", "nav-icon-expanded") : ''}`}>
                                                    <PlusIcon />
                                                </div>
                                            )}
                                        </button>

                                        {expandedSections[index] && item.sub_category && item.sub_category.length > 0 && (
                                            <ul className={classGenerator("vtex-menu-mobile", "submenu")}>
                                                {item.sub_category.map((subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        <a
                                                            href={subItem.link || '#'}
                                                            className={classGenerator("vtex-menu-mobile", "submenu-link")}
                                                        >
                                                            {subItem.name}
                                                        </a>
                                                    </li>
                                                ))}
                                                {item.see_all && (
                                                    <li>
                                                        <a href={item.see_all} className={classGenerator("vtex-menu-mobile", "see-all")}>
                                                            Ver todos
                                                        </a>
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className={classGenerator("vtex-menu-mobile", "actions")}>
                                <a href={myWishListLink} className={classGenerator("vtex-menu-mobile", "action-btn")}>
                                    <HeatIcon />
                                    <span>Meus favoritos</span>
                                </a>
                            </div>
                        </nav>
                    </div>
                </>,
                document.body
            )}

            { (isOpenModal) && (
                <LoginModal 
                    handleChangeStateModal={() => setIsOpenModal(false)} 
                />
            ) }
        </>
    );
}

MenuMobile.schema = schema;

export default MenuMobile;