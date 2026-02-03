"use client";

import { IProduct } from "@/model/product.model";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: IProduct[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (!products || products.length === 0) {
    return <p className="text-center text-white/60">No products available</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="
  grid
  grid-cols-2
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4 sm:gap-6
  mb-5
"
    >
      {products.map((product, i) => (
        <ProductCard key={i} product={product} />
      ))}
    </motion.div>
  );
};

export default ProductGrid;
