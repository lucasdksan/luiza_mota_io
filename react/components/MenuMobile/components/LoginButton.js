import React from "react";
import { useSession } from "../../../utils/useSession";
import { classGenerator } from "../../../utils/classGenerator";

function LoginButton({
    handleLoginBtn
}) {
    const { isAuthenticated, nameExibition } = useSession();
    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3 20.25C4.81594 17.1122 8.11406 15 12 15C15.8859 15 19.1841 17.1122 21 20.25" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );

    return (
        <div className={classGenerator("vtex-menu-mobile", "login-button-content")}>
            <UserIcon />
            {!isAuthenticated ? (
                <button onClick={handleLoginBtn} className={classGenerator("vtex-menu-mobile", "login-button")}>
                    <span className={classGenerator("vtex-menu-mobile", "login-button-text")}>Entrar/Cadastrar</span>
                </button>
            ) : (
                <a className={classGenerator("vtex-menu-mobile", "login-link")} href="/myaccount">Olá, {nameExibition}</a>
            )}
        </div>
    );
}

export default LoginButton;