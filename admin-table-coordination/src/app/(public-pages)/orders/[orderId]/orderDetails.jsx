"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiOrderRentalDetails } from "@/services/OrderRentals";

import B2BOrderDetails from "./B2BOrderDetails";
import B2COrderDetails from "./B2COrderDetails";

export default function OrderDetails({ orderId }) {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (accessToken) {
      fetchOrder();
    }
  }, [accessToken]);

  const fetchOrder = async () => {
    const res = await apiOrderRentalDetails(accessToken, orderId);

    if (res?.status) {
      setOrder(res.data);
    }
  };

  if (!order) return null;

  return order.customer?.role === "b2b" ? (
    <B2BOrderDetails orderId={orderId} order={order} />
  ) : (
    <B2COrderDetails orderId={orderId} order={order} />
  );
}
