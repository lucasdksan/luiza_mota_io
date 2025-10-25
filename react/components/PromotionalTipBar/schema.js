export const schema = {
    title: "Tip Bar Promocional",
    description: "Exibe mensagens promocionais em carrossel no topo do site com navegação automática.",
    type: "object",
    properties: {
        texts: {
            type: "array",
            title: "Mensagens Promocionais",
            description: "Lista de textos que serão exibidos no carrossel",
            default: [],
            items: {
                type: "string",
                title: "Texto Promocional",
                description: "Mensagem que será exibida no banner",
                widget: {
                    "ui:widget": "textarea"
                }
            }
        }
    }
}