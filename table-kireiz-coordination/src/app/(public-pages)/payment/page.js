"use client";

import React from "react";
import PaymentHome from "./components/PaymentHome";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const Page = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentHome />
    </Elements>
  );
};

export default Page;

