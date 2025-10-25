export const schema = {
    title: "Frete Grátis",
    description: "Configuração do Frete Grátis",
    type: "object",
    properties: {
        valueDefault: {
            title: "Valor máximo",
            type: "number",
            default: 300
        }
    }
}
