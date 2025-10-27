
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { pickMaxInstallmentsOptionOrderForm } from "./pickMaxInstallmentsOptionOrderForm";
import { formatCurrency } from "../../utils/formatCurrency";
import { classGenerator } from "../../utils/classGenerator";

function InstallmentsCustom({
    VtexFlexLayout
}) {
    const { orderForm } = useOrderForm();
    const maxInstallmentsOption = pickMaxInstallmentsOptionOrderForm(orderForm);
    console.log("maxInstallmentsOption: ", maxInstallmentsOption);

    return (
        <VtexFlexLayout>
            <p className={classGenerator("vtex-installments-custom", "text")}>
                ou <strong className={classGenerator("vtex-installments-custom", "text-strong")}>{maxInstallmentsOption.count}x</strong> de <strong className={classGenerator("vtex-installments-custom", "text-strong")}>{formatCurrency((maxInstallmentsOption.value / 100).toFixed(2))}</strong>
            </p>
        </VtexFlexLayout>
    );
}

export default InstallmentsCustom;