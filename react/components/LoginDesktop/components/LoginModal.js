import React from "react";
import { createPortal } from "react-dom";
import { LoginContent } from "vtex.login";
import { classGenerator } from "../../../utils/classGenerator";

function LoginModal({
    handleChangeStateModal
}) {
    return (
        <>
            {
                createPortal(
                    <>
                        <div
                            className={classGenerator("vtex-login-desktop", "login-modal-overlay")}
                            onClick={handleChangeStateModal}
                        />
                        <div className={classGenerator("vtex-login-desktop", "login-modal")}>
                            <button onClick={handleChangeStateModal} className={classGenerator("vtex-login-desktop", "login-modal-button")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M6 6L18 18" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                            <div className={classGenerator("vtex-login-desktop", "login-modal-title-area")}>
                                <span className={classGenerator("vtex-login-desktop", "login-modal-title")}>Login</span>
                            </div>
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%"
                                }}
                                className={classGenerator("vtex-login-desktop", "login-modal-content-login-vtex")}
                            >
                                <LoginContent
                                    isInitialScreenOptionOnly
                                    optionsTitle="Use uma das opções para confirmar sua identidade"
                                    emailPlaceholder="Digite seu melhor e-mail aqui"
                                    passwordPlaceholder="Digite sua senha aqui"
                                    showPasswordVerificationIntoTooltip
                                    defaultOption={1}
                                />
                            </div>
                        </div>
                    </>
                    , document.body)
            }
        </>
    );
}

export default LoginModal;