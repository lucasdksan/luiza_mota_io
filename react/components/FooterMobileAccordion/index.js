import React, { useState } from "react";
import { classGenerator } from "../../utils/classGenerator";
import CaretDownIcon from "./components/CaretDownIcon";
import { schema } from "./schema";

function FooterMobileAccordion({ VtexFlexLayout, accordionItems = [] }){
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  if (!Array.isArray(accordionItems) || accordionItems.length === 0) {
    return null;
  }

  return (
    <VtexFlexLayout>
      <div className={classGenerator("vtex-footer-mobile-accordion", "container")}>
        {accordionItems.map((item) => (
          <div
            key={item.key}
            className={classGenerator("vtex-footer-mobile-accordion", "item")}
          >
            <button
              className={classGenerator("vtex-footer-mobile-accordion", "header")}
              onClick={() => toggleItem(item.key)}
              aria-expanded={expandedItems[item.key] || false}
            >
              <h3 className={classGenerator("vtex-footer-mobile-accordion", "title")}>
                {item.title}
              </h3>
              <CaretDownIcon
                isExpanded={expandedItems[item.key] ? true : false}
                className={`${classGenerator("vtex-footer-mobile-accordion", "icon")} ${
                  expandedItems[item.key] ? classGenerator("vtex-footer-mobile-accordion", "expanded") : ""
                }`}
              />
            </button>
            {expandedItems[item.key] && (
              <div className={classGenerator("vtex-footer-mobile-accordion", "content")}>
                {item.content && item.content.length > 0 ? (
                  <ul className={classGenerator("vtex-footer-mobile-accordion", "list")}>
                    {item.content.map((contentItem, index) => (
                      <li key={index} className={classGenerator("vtex-footer-mobile-accordion", "list-item")}>
                        <a 
                          href={contentItem.link}
                          className={classGenerator("vtex-footer-mobile-accordion", "link")}
                        >
                          {contentItem.titulo}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={classGenerator("vtex-footer-mobile-accordion", "empty-content")}>
                    Conteúdo será configurado via Site Editor
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </VtexFlexLayout>
  );
};

FooterMobileAccordion.schema = schema;

export default FooterMobileAccordion;