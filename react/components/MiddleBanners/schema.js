export const schema = {
    title: "Banners",
    description: "Componente que renderiza os banners no meio da página",
    type: "object",
    properties: {
        banners: {
            type: "array",
            title: "Banners",
            description: "Lista de banners",
            items: {
                type: "object",
                title: "Banner",
                properties: {
                    image: {
                        type: "string",
                        title: "Imagem Mobile",
                        description: "URL da imagem mobile",
                        widget: {
                            "ui:widget": "image-uploader"
                        },
                        default: ""
                    },
                    alt: {
                        type: "string",
                        title: "Texto alternativo da coleção",
                        description: "Texto alternativo da coleção",
                        default: ""
                    },
                    link: {
                        type: "string",
                        title: "Link da coleção",
                        description: "Link para redirecionar para a coleção",
                        default: ""
                    }
                }
            }
        }
    }
}
