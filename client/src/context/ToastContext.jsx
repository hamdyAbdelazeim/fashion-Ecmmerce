import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import CartToast from '../components/CartToast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((product) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev.slice(-3), { id, product }]); // max 4 stacked
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div
                className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
                aria-live="assertive"
                aria-atomic="false"
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map(({ id, product }) => (
                        <CartToast key={id} product={product} onDismiss={() => removeToast(id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
