import { useCallback, useRef, useEffect, useState } from "react";
import { classGenerator } from "../../utils/classGenerator";
import { getShippingData } from "./getShippingData";

function ShippingSimulatorCustom({
    VtexShippingSimulator,
    VtexFlexLayout,
}) {
    const [data, setData] = useState({ success: false });
    const containerRef = useRef(null);

    const fetchData = useCallback(() => {
        getShippingData({
            container: containerRef.current,
            callback: (result) => {
                setData(result);
            }
        });
    }, [containerRef]);

    useEffect(fetchData, [fetchData]);

    return (
        <VtexFlexLayout>
            <div ref={containerRef} className={classGenerator("vtex-shipping-simulator-custom", "container")}>
                <VtexShippingSimulator />

                {data.success && (
                    <div className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-area")}>
                        {(data.shippingOptions) && (
                            <div className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-element")}>
                                <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-label")}>Receber em casa</span>
                                {data.shippingOptions.map((shipping, index) => {
                                    return (
                                        <div className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-row")} key={index}>
                                            <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-title-row")}>{shipping.label}</span>
                                            <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-estimate")}>{shipping.estimate}</span>
                                            <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-price")}>{shipping.price}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {(data.pickUpOptions) && (data.pickUpOptions.length > 0) && (
                            <div className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-element")}>
                                <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-label")}>Retirar na loja</span>
                                {data.pickUpOptions.map((pickUp, index) => {
                                    return (
                                        <div className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-row")} key={index}>
                                            <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-title-row")}>{pickUp.label}</span>
                                            <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-estimate")}>{pickUp.estimate}</span>
                                            <span className={classGenerator("vtex-shipping-simulator-custom", "shipping-result-price")}>{pickUp.price}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </VtexFlexLayout>
    );
}

export default ShippingSimulatorCustom;