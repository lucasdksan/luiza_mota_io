import { useState } from "react";
import { classGenerator } from "../../utils/classGenerator";
import { useSession } from "../../utils/useSession";
import LoginModal from "./components/LoginModal";

function LoginDesktop({
    VtexFlexLayoutContentBTN,
}) {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { isAuthenticated, nameExibition } = useSession();
    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 20C20.4183 20 24 16.4183 24 12C24 7.58172 20.4183 4 16 4C11.5817 4 8 7.58172 8 12C8 16.4183 11.5817 20 16 20Z" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 27C6.42125 22.8162 10.8187 20 16 20C21.1813 20 25.5787 22.8162 28 27" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );

    return (
        <>
            <VtexFlexLayoutContentBTN>
                {/* {!isAuthenticated ? ( */}
                    <button onClick={() => setIsOpenModal(true)} className={classGenerator("vtex-login-desktop", "login-button")}>
                        <UserIcon />
                        <span className={classGenerator("vtex-login-desktop", "login-button-text")}>
                            <strong>Entre</strong> ou <br />
                            <strong>Cadastra-se</strong>
                        </span>
                    </button>
                {/* ) : (
                    <a className={classGenerator("vtex-login-desktop", "login-link")} href="/myaccount">
                        <UserIcon />
                        <span className={classGenerator("vtex-login-desktop", "login-button-text")}>
                            Bem vindo!
                            <br />
                            <strong>{nameExibition}</strong>
                        </span>
                    </a>
                )} */}
            </VtexFlexLayoutContentBTN>
            {(isOpenModal) && (
                <LoginModal
                    handleChangeStateModal={() => setIsOpenModal(false)}
                />
            )}
        </>
    );
}

export default LoginDesktop;