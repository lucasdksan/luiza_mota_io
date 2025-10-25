import React from "react";
import { classGenerator } from "../../utils/classGenerator";
import { schema } from "./schema";

function DepartmentNavigation({
    VtexFlexLayout,
    departments,
    title
}){
    if (!Array.isArray(departments) || departments.length === 0) return null;

    return(
        <VtexFlexLayout>
            <h2 className={classGenerator("vtex-department-navigation", "title")}>{ title ? title : "Departamentos" }</h2>
            <div className={classGenerator("vtex-department-navigation", "options-container")}>
                { departments.map((department, index) => (
                    <a className={classGenerator("vtex-department-navigation", "element-link")} key={index} href={department.link}>
                        <div className={classGenerator("vtex-department-navigation", "element-image-container")}>
                            <img className={classGenerator("vtex-department-navigation", "element-image")} src={department.image} alt={`Imagem do departamento - ${department.name}`} />
                        </div>
                        <span className={classGenerator("vtex-department-navigation", "element-name")}>{department.name}</span>
                    </a>
                )) }
            </div>
        </VtexFlexLayout>
    );
}

DepartmentNavigation.schema = schema;

export default DepartmentNavigation;