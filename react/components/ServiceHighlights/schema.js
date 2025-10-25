export const schema = {
    title: "Principais Serviços",
    description: "Componente dos principais serviços",
    type: "object",
    properties: {
        highlights: {
            type: "array",
            title: "serviços",
            description: "Lista de serviços ou beneficios",
            items: {
                type: "object",
                title: "Serviço",
                properties: {
                    icon: {
                        type: "string",
                        title: "Imagem Desktop",
                        description: "URL da imagem desktop do serviço",
                        widget: {
                            "ui:widget": "image-uploader"
                        },
                        default: ""
                    },
                    name: {
                        type: "string",
                        title: "Nome do serviço",
                        description: "Nome do serviço que corresponde a imagem",
                        default: ""
                    }
                }
            }
        }
    }
}
