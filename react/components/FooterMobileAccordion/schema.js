export const schema = {
  title: "Acordeão do Footer Mobile",
  description: "Componente de acordeão para o footer mobile com seções expansíveis",
  type: "object",
  properties: {
    accordionItems: {
      title: "Itens do Acordeão",
      description: "Lista de itens que serão exibidos no acordeão",
      type: "array",
      items: {
        type: "object",
        properties: {
          key: {
            title: "Chave do Item",
            description: "Identificador único do item do acordeão",
            type: "string"
          },
          title: {
            title: "Título",
            description: "Título que será exibido no cabeçalho do acordeão",
            type: "string"
          },
          content: {
            title: "Conteúdo",
            description: "Lista de links que serão exibidos quando o acordeão for expandido",
            type: "array",
            items: {
              type: "object",
              properties: {
                titulo: {
                  title: "Título do Link",
                  description: "Texto que será exibido para o link",
                  type: "string"
                },
                link: {
                  title: "URL do Link",
                  description: "URL para onde o link irá redirecionar",
                  type: "string"
                }
              },
            }
          }
        },
      },
    }
  }
};
