import React, { useState } from "react";
import { OrderCoupon } from "vtex.order-coupon";
import { classGenerator } from "../../../utils/classGenerator";

function Form() {
    const { useOrderCoupon } = OrderCoupon;
    const { insertCoupon } = useOrderCoupon();
    const [currentCoupon, setCurrentCoupon] = useState("");

    const sendCoupon = () => {
        insertCoupon(currentCoupon).then(result => {
            if (!result.success) {
                setCurrentCoupon("");
            }
        });
    }

    const resetCouponInput = () => {
        insertCoupon("").then(() => { });
        setCurrentCoupon("");
    }

    return (
        <div className={classGenerator("vtex-coupon-minicart-form", "wrapper")}>
            <div className={classGenerator("vtex-coupon-minicart-form", "text-content")}>
                <p className={classGenerator("vtex-coupon-minicart-form", "text-p")}>cupom</p>
            </div>
            
            <div className={classGenerator("vtex-coupon-minicart-form", "input-content")}>
                <input
                    className={classGenerator("vtex-coupon-minicart-form", "input")}
                    placeholder="cupom de desconto"
                    onChange={e => setCurrentCoupon(e.target.value.trim())}
                    value={currentCoupon}
                />
            </div>

            {!currentCoupon && (
                <button
                    className={classGenerator("vtex-coupon-minicart-form", "send-btn")}
                    onClick={sendCoupon}
                >
                    Adicionar
                </button>
            )}

            {currentCoupon && (
                <button
                    className={classGenerator("vtex-coupon-minicart-form", "clean-btn")}
                    onClick={resetCouponInput}
                >
                    Remover
                </button>
            )}
        </div>
    );
}

export default Form;