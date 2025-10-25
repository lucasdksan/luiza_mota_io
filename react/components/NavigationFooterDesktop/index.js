import React from "react";
import { classGenerator } from "../../utils/classGenerator";
import FooterColumn from "./components/FooterColumn";
import { schema } from "./schema";

function NavigationFooterDesktop({ VtexFlexLayout, VtexFlexLayoutInformation, columns = [] }) {
  const containerClass = classGenerator("vtex-navigation-footer-desktop", "container");

  if(!columns.length || columns.length === 0) return null;

  return (
    <VtexFlexLayout>
      <div className={containerClass}>
        {columns.map((column) => {
          if (column.links === undefined || !column.links.length || column.links.length === 0) return null;
          
          return(
            <FooterColumn
              key={column.key}
              title={column.title}
              links={column.links}
            />
          )
        })}
        <VtexFlexLayoutInformation />
      </div>
    </VtexFlexLayout>
  );
}

NavigationFooterDesktop.schema = schema;

export default NavigationFooterDesktop;
