export const schema = {
    title: "Página 404 Customizada",
    type: "object",
    properties: {
      checkList: {
        title: "Lista de textos",
        type: "array",
        default: [],
        items: {
          title: "Texto",
          type: "object",
          properties: {
            title: {
              title: "Título",
              type: "string",
              default: ""
            }
          }
        }
      },
      titleRedCard: {
          title: "Título do Zona Vermelha",
          type: "string",
          default: "",
      }
    }
  }
  