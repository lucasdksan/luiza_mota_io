export const schema = {
    title: "Share Social Media",
    description: "Componente de compartilhamento de redes sociais",
    type: "object",
    properties: {
        socialMediaList: {
            type: "array",
            title: "Lista de redes sociais",
            description: "Lista de redes sociais",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        title: "Nome da rede social",
                        description: "Nome da rede social",
                    },
                    icon: {
                        type: "string",
                        title: "Icone da rede social",
                        description: "Icone da rede social",
                        widget: {
                            "ui:widget": "image-uploader"
                        },
                    },
                    link: {
                        type: "string",
                        title: "Link da rede social",
                        description: "Link da rede social",
                        default: ""
                    }
                }
            }
        }
    }
};