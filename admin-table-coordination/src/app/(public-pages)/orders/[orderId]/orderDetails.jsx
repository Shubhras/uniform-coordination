"use client";

import { useEffect, useState } from "react";
import useCurrentSession from "@/utils/hooks/useCurrentSession";
import { apiOrderRentalDetails } from "@/services/OrderRentals";
import Spinner from "@/components/ui/Spinner";
import B2BOrderDetails from "./B2BOrderDetails";
import B2COrderDetails from "./B2COrderDetails";

export default function OrderDetails({ orderId }) {
  const { session } = useCurrentSession();
  const accessToken = session?.user?.accessToken;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      fetchOrder();
    }
  }, [accessToken]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await apiOrderRentalDetails(accessToken, orderId);

      if (res?.status) {
        setOrder(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5]">
        <Spinner size={40} customColorClass="text-[#A0522D]" />
      </div>
    );
  }

  if (!order) return null;

  return order.customer?.role === "b2b" ? (
    <B2BOrderDetails orderId={orderId} order={order} fetchOrder={fetchOrder} />
  ) : (
    <B2COrderDetails orderId={orderId} order={order} fetchOrder={fetchOrder} />
  );
}
