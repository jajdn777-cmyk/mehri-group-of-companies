
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

/**
 * MehriLogo: Image Asset.
 * Uses user provided URL.
 */
export const MehriLogo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  // Standardized sizes for consistency - UPDATED to be larger (roughly +50%)
  const sizeMap = {
    sm: "h-12", // Increased from h-10 (48px)
    md: "h-20", // Increased from h-16 (80px)
    lg: "h-32", // Increased from h-20 (128px)
    xl: "h-40", // Increased from h-24 (160px)
    xxl: "h-[240px]" // Increased from 200px
  };

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
       <img 
         src="https://i.ibb.co.com/xqxm5rCT/logo-mehri-no-bg.png" 
         alt="MEHRI Logo" 
         className={`${sizeMap[size]} w-auto object-contain drop-shadow-sm`}
       />
    </div>
  );
};
