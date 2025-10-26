import React, { useState } from "react";
import { classGenerator } from "../../utils/classGenerator";

function ContactUsForm({
    VtexFlexLayout,
}) {
    const [messageSent, setMessageSent] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            message: formData.message,
        };

        fetch("/api/dataentities/FC/documents", {
            method: "POST",
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setMessageSent(true);
            })
            .catch(error => {
                setMessageSent(false);
                console.error("Erro ao enviar mensagem:", error);
            });
    }

    return (
        <VtexFlexLayout>
            <div className={classGenerator("vtex-contact-us-form", "contact-us-form-description")}>
                <span className={classGenerator("vtex-contact-us-form", "text")}>Queremos facilitar o seu contato conosco! Escolha a forma que preferir:</span>
                <ul className={classGenerator("vtex-contact-us-form", "list")}>
                    <li className={classGenerator("vtex-contact-us-form", "list-item")}>
                        <strong className={classGenerator("vtex-contact-us-form", "list-item-title")}>Whatsapp:</strong>
                        <span className={classGenerator("vtex-contact-us-form", "list-item-text")}>(62) 736554-8376</span>
                    </li>
                    <li className={classGenerator("vtex-contact-us-form", "list-item")}>
                        <strong className={classGenerator("vtex-contact-us-form", "list-item-title")}>Envie um e-mail: </strong>
                        <span className={classGenerator("vtex-contact-us-form", "list-item-text")}>lojavirtual@luizamota.com.br</span>
                    </li>
                    <li className={classGenerator("vtex-contact-us-form", "list-item")}>
                        <strong className={classGenerator("vtex-contact-us-form", "list-item-title")}>Ou você pode preencher o formulário abaixo.</strong>
                        <span className={classGenerator("vtex-contact-us-form", "list-item-text--strong")}>Ficamos felizes em responder às suas perguntas e atender às suas necessidades.</span>
                    </li>
                </ul>
            </div>
            {!messageSent ? (
                <form className={classGenerator("vtex-contact-us-form", "form")} onSubmit={handleSubmit}>
                    <div className={classGenerator("vtex-contact-us-form", "form-row")}>
                        <label htmlFor="name" className={classGenerator("vtex-contact-us-form", "form-label")}>
                            <span className={classGenerator("vtex-contact-us-form", "form-label-text")}>Seu nome</span>
                            <input id="name" className={classGenerator("vtex-contact-us-form", "form-input")} type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </label>
                        <label htmlFor="email" className={classGenerator("vtex-contact-us-form", "form-label")}>
                            <span className={classGenerator("vtex-contact-us-form", "form-label-text")}>E-mail</span>
                            <input id="email" className={classGenerator("vtex-contact-us-form", "form-input")} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </label>
                    </div>
                    <div className={classGenerator("vtex-contact-us-form", "form-row")}>
                        <label htmlFor="phone" className={classGenerator("vtex-contact-us-form", "form-label")}>
                            <span className={classGenerator("vtex-contact-us-form", "form-label-text")}>Telefone</span>
                            <input id="phone" className={classGenerator("vtex-contact-us-form", "form-input")} type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </label>
                        <label htmlFor="address" className={classGenerator("vtex-contact-us-form", "form-label")}>
                            <span className={classGenerator("vtex-contact-us-form", "form-label-text")}>Endereço</span>
                            <input id="address" className={classGenerator("vtex-contact-us-form", "form-input")} type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </label>
                    </div>
                    <label htmlFor="message" className={classGenerator("vtex-contact-us-form", "form-label")}>
                        <span className={classGenerator("vtex-contact-us-form", "form-label-text")}>Sua mensagem</span>
                        <textarea id="message" className={classGenerator("vtex-contact-us-form", "form-textarea")} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                    </label>
                    <button type="submit" className={classGenerator("vtex-contact-us-form", "form-button")}>Enviar mensagem</button>
                </form>
            ) : (
                <div className={classGenerator("vtex-contact-us-form", "success-message")}>
                    <span className={classGenerator("vtex-contact-us-form", "success-message-title")}>Sua mensagem chegou até nós!</span>
                    <p className={classGenerator("vtex-contact-us-form", "success-message-description")}>Obrigado por escrever. Vamos ler com carinho e responder o quanto antes.</p>
                </div>
            )}
        </VtexFlexLayout>
    );
}

export default ContactUsForm;