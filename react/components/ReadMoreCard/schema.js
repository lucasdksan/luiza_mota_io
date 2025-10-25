export const schema = {
  title: "SEO Mobile",
  description: "Componente que renderiza o SEO no footer",
  type: "object",
  properties: {
    seoText: {
      title: "Texto SEO",
      description: "Texto em HTML",
      type: "string",
      widget: {
        "ui:widget": "textarea",
      },
      default: "",
    }
  }
};
