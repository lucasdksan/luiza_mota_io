import React, { useEffect, useState } from "react";
import { useProduct } from "vtex.product-context";
import { classGenerator } from "../../utils/classGenerator";

function ProductDefinitions({ VtexFlexLayout }) {
  const [productDefinitions, setProductDefinitions] = useState([]);
  const [activeTab, setActiveTab] = useState("Descrição");
  const { product } = useProduct();
  const { description, specificationGroups } = product ?? {};

  useEffect(() => {
    const definitions = [];

    if (description) {
      definitions.push({
        title: "Descrição",
        description: description,
      });
    }

    if (specificationGroups && specificationGroups.length > 0) {
      const allSpecifications = specificationGroups.find(
        (group) => group.name === "allSpecifications"
      );

      if (allSpecifications && allSpecifications.specifications?.length > 0) {
        const html = allSpecifications.specifications
          .map((spec) => {
            const value = spec.values?.join("<br>") ?? "";
            return `
              <h3 style="margin: 0px;">${spec.name}</h3>
              <p style="margin: 0px;">${value}</p>
            `;
          })
          .join("");

        definitions.push({
          title: "Tamanhos e especificações",
          description: html,
        });
      }
    }

    setProductDefinitions(definitions);
  }, [description, specificationGroups]);

  const activeContent = productDefinitions.find(
    (item) => item.title === activeTab
  );

  return (
    <VtexFlexLayout>
      <div className={classGenerator("vtex-product-definitions", "container")}>
        <div className={classGenerator("vtex-product-definitions", "tabs")}>
          {productDefinitions.map((item) => (
            <button
              key={item.title}
              onClick={() => setActiveTab(item.title)}
              className={`${classGenerator("vtex-product-definitions", "tab")}  ${
                activeTab === item.title
                  ? classGenerator("vtex-product-definitions", "tab--active")
                  : classGenerator("vtex-product-definitions", "tab--inactive")
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div
          className={classGenerator("vtex-product-definitions", "content-description")}
          dangerouslySetInnerHTML={{ __html: activeContent?.description || "" }}
        />
      </div>
    </VtexFlexLayout>
  );
}

export default ProductDefinitions;
