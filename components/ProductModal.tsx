import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { XIcon, TrashIcon, CheckIcon, UploadIcon, DriveIcon, ComputerIcon } from './Icons';
import { GOOGLE_DRIVE_API_KEY, GOOGLE_DRIVE_APP_ID, GOOGLE_DRIVE_CLIENT_ID } from '../constants';

// Declare types for Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isEditable: boolean;
  onSave: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  isEditable,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  // Local state for price input to allow handling decimals (e.g. typing "10." without it reverting to "10")
  const [tempPrice, setTempPrice] = useState<string>("");
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && isOpen) {
      setFormData(product);
      setTempPrice(product.price.toString());
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Allow the user to type anything in the input box visually
      setTempPrice(value);
      
      // Update the actual data if it's a valid number
      // We don't force it yet, so we don't break the "10." state
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, price: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    // Ensure final price is a valid number on save
    const finalPrice = parseFloat(tempPrice);
    const updates = {
      ...formData,
      price: isNaN(finalPrice) ? 0 : finalPrice
    };

    onSave(product.id, updates);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete(product.id);
      onClose();
    }
  };
  
  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setFormData(prev => ({ ...prev, imageUrl: text }));
      }
    } catch (err) {
      console.warn("Clipboard paste failed or denied", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit check
         alert("File is too large. Please choose an image under 5MB.");
         return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContactSeller = () => {
    const subject = encodeURIComponent(`Inquiry: ${product.title}`);
    const body = encodeURIComponent(`Hi,\n\nI am interested in the ${product.title} listed for £${product.price}.\n\nCould you please provide more details?\n\nThanks.`);
    window.location.href = `mailto:sales@mestizomx.com?subject=${subject}&body=${body}`;
  };

  // --- Google Drive Integration ---
  
  const handleDrivePick = async () => {
    if (!GOOGLE_DRIVE_CLIENT_ID || !GOOGLE_DRIVE_API_KEY) {
      alert("Configuration Error:\nPlease set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_API_KEY in constants.ts.");
      return;
    }

    if (typeof window === 'undefined' || !window.gapi || !window.google) {
      alert("Google Scripts are still loading. Please wait a moment and try again.");
      return;
    }

    setIsDriveLoading(true);

    try {
      if (!window.gapi.client) {
         await new Promise<void>((resolve) => window.gapi.load('client:auth2', resolve));
      }
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('picker', { callback: resolve, onerror: reject });
      });

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_DRIVE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: async (response: any) => {
          if (response.error) {
            console.error("Auth Error:", response);
            alert(`Authentication Failed: ${response.error}`);
            setIsDriveLoading(false);
            return;
          }
          createPicker(response.access_token);
        },
      });

      tokenClient.requestAccessToken();

    } catch (error) {
      console.error("Error initiating Google Drive Picker:", error);
      alert("Failed to connect to Google Drive. Check the console for details.");
      setIsDriveLoading(false);
    }
  };

  const createPicker = (accessToken: string) => {
    try {
      const view = new window.google.picker.View(window.google.picker.ViewId.DOCS_IMAGES);
      view.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp");

      const pickerBuilder = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_DRIVE_API_KEY)
        .setCallback((data: any) => pickerCallback(data, accessToken));

      if (GOOGLE_DRIVE_APP_ID) {
        pickerBuilder.setAppId(GOOGLE_DRIVE_APP_ID);
      }
      
      const picker = pickerBuilder.build();
      picker.setVisible(true);
    } catch (e) {
      console.error("Error creating picker:", e);
      alert("Failed to create Drive Picker.");
      setIsDriveLoading(false);
    }
  };

  const pickerCallback = async (data: any, accessToken: string) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const doc = data.docs[0];
      const fileId = doc.id;
      
      try {
        const fileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Download failed: ${response.status} ${errText}`);
        }
        
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
           const base64data = reader.result as string;
           setFormData(prev => ({ ...prev, imageUrl: base64data }));
           setIsDriveLoading(false);
        };
        reader.readAsDataURL(blob);

      } catch (err) {
        console.error("Error downloading image from Drive:", err);
        alert("Could not download image. \n\nTip: Ensure your domain is added to 'Authorized JavaScript origins' in the Google Cloud Console credentials.");
        setIsDriveLoading(false);
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
      setIsDriveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative bg-gray-100 h-64 md:h-auto min-h-[300px] group/image overflow-hidden">
          <img 
            src={formData.imageUrl || 'https://via.placeholder.com/600?text=No+Image'} 
            alt={formData.title || product.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = 'https://via.placeholder.com/600?text=Image+Error';
            }}
            className={`w-full h-full object-cover ${
              isEditable ? 'transition-transform duration-700 ease-in-out group-hover/image:scale-105' : ''
            }`}
          />
          {isEditable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity">
               <div className="bg-white p-4 rounded-xl shadow-lg w-11/12 max-w-sm space-y-3">
                 <label className="block text-xs font-bold text-gray-500 uppercase">Image Source</label>
                 
                 {/* URL Input */}
                 <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      name="imageUrl"
                      value={formData.imageUrl || ''}
                      onChange={handleChange}
                      className="flex-1 text-sm border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                      placeholder="Paste image URL here..."
                    />
                    <button 
                      type="button"
                      onClick={handlePasteUrl}
                      className="relative group p-1 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label="Paste URL from clipboard"
                    >
                       <UploadIcon className="w-5 h-5 text-indigo-500" />
                       <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Paste URL</span>
                    </button>
                 </div>

                 <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-2 text-xs text-gray-400 font-bold">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                 </div>

                 {/* Upload Options */}
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                 />

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <ComputerIcon className="w-4 h-4 text-slate-700" />
                      <span>Device</span>
                    </button>
                    
                    <button 
                      onClick={handleDrivePick}
                      disabled={isDriveLoading}
                      className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      {isDriveLoading ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin"></div>
                      ) : (
                        <DriveIcon className="w-4 h-4 text-slate-700" />
                      )}
                      <span>Drive</span>
                    </button>
                 </div>
               </div>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 md:hidden bg-white/90 backdrop-blur text-slate-900 p-2 rounded-full shadow-lg"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
             <div className="flex-1 mr-4">
               {isEditable ? (
                 <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                      <input 
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        className="w-full text-3xl font-bold text-slate-900 border-b-2 border-slate-100 focus:border-indigo-500 focus:outline-none bg-transparent transition-colors py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price (£)</label>
                      <input 
                        type="number"
                        name="price"
                        step="0.01"
                        value={tempPrice} 
                        onChange={handleChange}
                        className="w-32 text-2xl font-semibold text-slate-900 border-b-2 border-slate-100 focus:border-indigo-500 focus:outline-none bg-transparent transition-colors py-1"
                      />
                    </div>
                 </div>
               ) : (
                 <>
                   <h2 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{product.title}</h2>
                   <p className="text-2xl font-semibold text-indigo-600">£{product.price}</p>
                 </>
               )}
             </div>
             
             <button 
                onClick={onClose}
                className="hidden md:block text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-full"
              >
                <XIcon className="w-6 h-6" />
             </button>
          </div>

          <div className="flex-1">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Description</h3>
             {isEditable ? (
               <textarea
                 name="description"
                 value={formData.description || ''}
                 onChange={handleChange}
                 rows={6}
                 className="w-full text-lg text-slate-600 leading-relaxed border-2 border-slate-100 rounded-xl p-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none"
               />
             ) : (
               <p className="text-lg text-slate-600 leading-relaxed">
                 {product.description}
               </p>
             )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
            {isEditable ? (
              <>
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                  <span>Delete</span>
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transform active:scale-95 transition-all"
                >
                  <CheckIcon className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleContactSeller}
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-indigo-600 shadow-xl shadow-slate-900/20 hover:shadow-indigo-600/30 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
              >
                Contact Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};