export const schema = {
    title: "Institutional Navigation",
    description: "Componente de navegação institucional",
    type: "object",
    properties: {
        items: {
            type: "array",
            title: "Itens da navegação",
            description: "Lista de itens da navegação",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        title: "ID do item",
                        description: "ID do item da navegação",
                    },
                    text: {
                        type: "string",
                        title: "Texto do item",
                        description: "Texto do item da navegação",
                    },
                    link: {
                        type: "string",
                        title: "Link do item",
                        description: "Link do item da navegação",
                    }
                }
            }
        }
    }
}