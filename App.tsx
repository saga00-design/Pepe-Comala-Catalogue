import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, APP_NAME } from './constants';
import { Product, ProductUpdate } from './types';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { EditIcon, PlusIcon, EyeIcon, CheckIcon } from './components/Icons';

function App() {
  // Initialize products from localStorage if available, otherwise use default
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pepe_comala_products');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load products from local storage', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('pepe_comala_products', JSON.stringify(products));
  }, [products]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200); // Clear after animation
  };

  const handleSaveProduct = (id: string, updates: ProductUpdate) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `new-${Date.now()}`,
      title: 'New Item',
      description: 'Add your description here...',
      price: 0,
      imageUrl: 'https://picsum.photos/600/600',
      heightClass: 'aspect-[1/1]'
    };
    
    setProducts(prev => [newProduct, ...prev]);
    // Optionally open it immediately
    setSelectedProduct(newProduct);
    setIsModalOpen(true);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-900/20">
               P
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900">{APP_NAME}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {isEditMode && (
               <button 
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 animate-in fade-in slide-in-from-right-4"
               >
                 <PlusIcon className="w-4 h-4" />
                 <span className="hidden sm:inline">Add Item</span>
               </button>
             )}
             
             <button
               onClick={toggleEditMode}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all border
                 ${isEditMode 
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                 }`}
             >
               {isEditMode ? <CheckIcon className="w-4 h-4" /> : <EditIcon className="w-4 h-4" />}
               <span className="hidden sm:inline">{isEditMode ? 'Save & Preview' : 'Edit Page'}</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Masonry Grid */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* 
           Tailwind Columns for Masonry Effect 
           - columns-1 for mobile
           - columns-2 for tablet
           - columns-3 for desktop
           - columns-4 for large screens
        */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={handleProductClick}
              isEditable={isEditMode}
            />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <EditIcon className="w-8 h-8 opacity-20" />
             </div>
             <p className="text-lg font-medium">No items found.</p>
             {isEditMode && (
               <button onClick={handleAddProduct} className="mt-4 text-indigo-600 font-semibold hover:underline">
                 Create your first item
               </button>
             )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-[1920px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-slate-500 text-sm">© 2024 {APP_NAME} Showcase. All rights reserved.</p>
           <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Contact</a>
           </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEditable={isEditMode}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}

export default App;