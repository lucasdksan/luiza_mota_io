export const schema = {
    title: "Menu Dropdown",
    description: "Menu dropdown com categorias e imagens promocionais",
    type: "object",
    properties: {
        menuItems: {
            title: "Itens do Menu",
            description: "Lista de itens do menu principal",
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        title: "ID do Item",
                        description: "Identificador único do item",
                        type: "string"
                    },
                    label: {
                        title: "Rótulo",
                        description: "Texto exibido no menu principal",
                        type: "string"
                    },
                    emphasis: {
                        title: "Texto em destaque",
                        description: "Texto em destaque do item",
                        type: "boolean",
                        default: false
                    },
                    categories: {
                        title: "Categorias",
                        description: "Lista de categorias do submenu",
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: {
                                    title: "Título da Categoria",
                                    description: "Título da seção de categoria",
                                    type: "string"
                                },
                                title_link: {
                                    title: "Link do Título",
                                    description: "Link de destino do título",
                                    type: "string"
                                },
                                items: {
                                    title: "Itens da Categoria",
                                    description: "Lista de itens da categoria",
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                title: "Nome do Item",
                                                description: "Nome exibido do item",
                                                type: "string"
                                            },
                                            link: {
                                                title: "Link do Item",
                                                description: "URL de destino do item",
                                                type: "string"
                                            }
                                        },
                                        required: ["name", "link"]
                                    }
                                },
                                actionButton: {
                                    title: "Botão de Ação",
                                    description: "Configuração do botão VER TUDO",
                                    type: "object",
                                    properties: {
                                        text: {
                                            title: "Texto do Botão",
                                            description: "Texto exibido no botão",
                                            type: "string",
                                            default: "VER TUDO"
                                        },
                                        url: {
                                            title: "URL do Botão",
                                            description: "Link de destino do botão",
                                            type: "string"
                                        }
                                    },
                                    required: ["text", "url"]
                                }
                            },
                            required: ["title", "items", "actionButton"]
                        }
                    },
                    bannerImages: {
                        title: "Imagens Promocionais",
                        description: "Lista de imagens promocionais",
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                src: {
                                    title: "URL da Imagem",
                                    description: "Caminho da imagem",
                                    type: "string"
                                },
                                alt: {
                                    title: "Texto Alternativo",
                                    description: "Texto alternativo da imagem",
                                    type: "string"
                                }
                            },
                            required: ["src", "alt"]
                        }
                    }
                },
                required: ["id", "label", "categories", "bannerImages"]
            }
        }
    },
    required: ["menuItems"]
};