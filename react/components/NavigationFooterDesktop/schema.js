export const schema = {
  title: "Footer de Navegação Desktop",
  description: "Footer com colunas de navegação para desktop",
  type: "object",
  properties: {
    columns: {
      title: "Colunas do Footer",
      description: "Lista de colunas que serão exibidas no footer",
      type: "array",
      items: {
        type: "object",
        properties: {
          key: {
            title: "Chave da Coluna",
            description: "Identificador único da coluna",
            type: "string"
          },
          title: {
            title: "Título da Coluna",
            description: "Título que será exibido no cabeçalho da coluna",
            type: "string"
          },
          links: {
            title: "Links da Coluna",
            description: "Lista de links que serão exibidos na coluna",
            type: "array",
            items: {
              type: "object",
              properties: {
                text: {
                  title: "Texto do Link",
                  description: "Texto que será exibido para o link",
                  type: "string"
                },
                href: {
                  title: "URL do Link",
                  description: "URL para onde o link irá redirecionar",
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  }
};
