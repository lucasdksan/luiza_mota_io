export const schema = {
  title: "Menu Mobile",
  description: "Componente de menu mobile com slide da esquerda, baseado no design do Figma. Inclui seções expansíveis e botões de ação.",
  type: "object",
  properties: {
    menuItems: {
      type: "array",
      title: "Itens do Menu",
      description: "Lista de categorias principais que aparecerão no menu. Se vazio, usa os itens padrão do Figma.",
      items: {
        type: "object",
        properties: {
          category_name: { 
            type: "string", 
            title: "Nome da Categoria",
            description: "Nome da categoria principal (ex: Novidades, Roupas)"
          },
          see_all: {
            type: "string", 
            title: "Link para ver todos",
            description: "Link para onde o usuário será direcionado para ver todos os itens da categoria"
          },
          sub_category: {
            type: "array",
            title: "Subcategorias",
            description: "Lista de subcategorias que aparecerão quando expandir",
            default: [],
            items: {
              type: "object",
              properties: {
                name: { 
                  type: "string", 
                  title: "Nome da Subcategoria",
                  description: "Nome do item (ex: Vestidos, Blusas)"
                },
                link: { 
                  type: "string", 
                  title: "Link/URL",
                  description: "URL para onde o usuário será direcionado"
                }
              }
            }
          }
        }
      }
    },
    myWishListLink: {
      type: "string",
      title: "Link para wishlist",
      description: "Link da loja para redirecionar a wishlist"
    }
  }
};
