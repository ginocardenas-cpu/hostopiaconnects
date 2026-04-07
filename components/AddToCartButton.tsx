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
      className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2 text-sm font-bold text-charcoal shadow-md transition hover:bg-gold-dark hover:shadow-lg disabled:cursor-default disabled:opacity-60 font-heading"
      disabled={inCart}
    >
      {inCart ? "Added to My Resources" : "Add to My Resources"}
    </button>
  );
}

