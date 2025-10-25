import { OrderCoupon } from "vtex.order-coupon";
import Form from "./components/Form";

function CouponMinicart() {
    return (
        <OrderCoupon.OrderCouponProvider>
            <Form />
        </OrderCoupon.OrderCouponProvider>
    )
}

export default CouponMinicart;