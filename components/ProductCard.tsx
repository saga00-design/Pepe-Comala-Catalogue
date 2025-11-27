import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  isEditable: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isEditable }) => {
  return (
    <div 
      onClick={() => onClick(product)}
      className={`
        group relative break-inside-avoid mb-6 rounded-2xl overflow-hidden
        bg-white shadow-sm hover:shadow-2xl transition-all duration-500 ease-out
        cursor-pointer transform hover:-translate-y-1 ring-1 ring-black/5
        ${isEditable ? 'hover:ring-indigo-400 border-2 border-transparent hover:border-indigo-400 hover:border-dashed' : ''}
      `}
    >
      <div className={`relative w-full ${product.heightClass} overflow-hidden bg-gray-100`}>
        <img 
          src={product.imageUrl} 
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white font-medium text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             View Details
          </p>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-sm">
            £{product.price}
          </span>
        </div>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  );
};