"use client";

import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  assetId: string;
}

export function AddToCartButton({ assetId }: AddToCartButtonProps) {
  const { addItem, assets } = useCart();
  const inCart = assets.some((asset) => asset.id === assetId);

  const handleClick = () => {
    if (!inCart) addItem(assetId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-bold shadow-md transition hover:shadow-lg disabled:opacity-60 disabled:cursor-default"
      style={{
        fontFamily: "Montserrat, sans-serif",
        backgroundColor: "#F8CF41",
        color: "#24282B"
      }}
      disabled={inCart}
    >
      {inCart ? "Added to My Resources" : "Add to My Resources"}
    </button>
  );
}

