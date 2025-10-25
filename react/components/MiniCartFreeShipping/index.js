import React from "react";
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { schema } from "./schema";
import { classGenerator } from "../../utils/classGenerator";
import { formatCurrency } from "../../utils/formatCurrency";

function MiniCartFreeShipping({
    VtexFlexLayout,
    valueDefault
}) {
    const {
        orderForm: { value },
    } = useOrderForm();
    const minValue = valueDefault * 100;
    const progress = Math.min((value / minValue) * 100, 100);
    const isFree = value >= minValue;
    const wrapperClass = classGenerator("vtex-minicart-free-shipping", "wrapper");
    const textClass = classGenerator("vtex-minicart-free-shipping", "text");
    const barClass = classGenerator("vtex-minicart-free-shipping", "bar");
    const progressClass = classGenerator("vtex-minicart-free-shipping", "progress");

    return (
        <VtexFlexLayout>
            <div className={wrapperClass}>
                {isFree ? (
                    <p className={textClass}>
                        <span>Oba! <strong>Você ganhou frete grátis</strong></span>
                    </p>
                ) : (
                    <div className={textClass}>
                        <span>Faltam {formatCurrency((minValue - value) / 100)}</span>
                        <span>Frete Grátis</span>
                    </div>
                )}

                <div className={barClass}>
                    <div className={progressClass} style={{ width: `${progress}%` }} />
                </div>
            </div>
        </VtexFlexLayout>
    );
}

MiniCartFreeShipping.schema = schema;

export default MiniCartFreeShipping;