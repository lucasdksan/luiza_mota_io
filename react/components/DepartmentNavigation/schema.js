export const schema = {
    title: "Departamentos",
    description: "Componente dos departamentos",
    type: "object",
    properties: {
        departments: {
            type: "array",
            title: "Departamentos",
            description: "Lista de departamentos (Imagem e o nome)",
            items: {
                type: "object",
                title: "Departamento",
                properties: {
                    image: {
                        type: "string",
                        title: "Imagem Desktop",
                        description: "URL da imagem desktop do departamento",
                        widget: {
                            "ui:widget": "image-uploader"
                        },
                        default: ""
                    },
                    name: {
                        type: "string",
                        title: "Nome do departamento",
                        description: "Nome do departamento que corresponde a imagem",
                        default: ""
                    },
                    link: {
                        type: "string",
                        title: "Link do departamento",
                        description: "Link do departamento que corresponde a imagem",
                        default: ""
                    }
                }
            }
        },
        title: {
            type: "string",
            title: "Título do Componente",
            default: ""
        }
    }
}
