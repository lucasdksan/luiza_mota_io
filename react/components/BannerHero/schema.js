export const schema = {
    title: "Banner Hero",
    description: "Componente banner hero custom",
    type: "object",
    properties: {
        banners: {
            type: "array",
            title: "Banners",
            description: "Lista de banners para o banner hero custom",
            items: {
                type: "object",
                title: "Banner",
                properties: {
                    imageDesktop: {
                        type: "string",
                        title: "Imagem Desktop",
                        description: "URL da imagem desktop do banner",
                        widget: {
                            "ui:widget": "image-uploader"
                        },
                        default: ""
                    },
                    imageMobile: {
                        type: "string",
                        title: "Imagem Mobile",
                        description: "URL da imagem mobile do banner",
                        widget: {
                            "ui:widget": "image-uploader"
                        },
                        default: ""
                    },
                    alt: {
                        type: "string",
                        title: "Texto Alternativo",
                        description: "Texto alternativo do banner",
                        default: ""
                    },
                    link: {
                        type: "string",
                        title: "Link do Banner",
                        description: "URL de destino ao clicar no banner",
                        default: ""
                    },
                    videoDesktop: {
                        type: "string",
                        title: "Vídeo Desktop",
                        description: "URL do vídeo desktop do banner",
                        default: ""
                    },
                    videoMobile: {
                        type: "string",
                        title: "Vídeo Mobile",
                        description: "URL do vídeo mobile do banner",
                        default: ""
                    },
                    activeVideo: {
                        type: "boolean",
                        title: "Ativo o Vídeo",
                        description: "Se o vídeo deve ser ativado",
                        default: false
                    }
                }
            }
        }
    }
}
