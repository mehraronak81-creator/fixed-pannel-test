import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default ({ children }: { children: React.ReactNode }) => {
    const element = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const createAndAppendElement = () => {
            const div = document.createElement('div');
            div.id = 'modal-portal';
            document.body.appendChild(div);
            element.current = div;
        };
    
        if (document.readyState === 'complete') {
            createAndAppendElement();
        } else {
            document.addEventListener('DOMContentLoaded', createAndAppendElement);
        }
    
        return () => {
            if (element.current) {
                document.body.removeChild(element.current);
            }
        };
    }, []);

    if (!element.current) {
        return null; 
    }
    
    return createPortal(children, element.current);
};
