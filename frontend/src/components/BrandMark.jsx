import React from 'react';
const BrandMark = ({ text = 'HK Signature', className = '' }) => (
  <span className={`brand-mark inline-flex items-center font-semibold ${className}`}>{text}</span>
);

export default BrandMark;
