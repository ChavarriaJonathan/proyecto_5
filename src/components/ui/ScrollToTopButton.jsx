import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopButton = ({ showScrollTop, scrollToTop }) => {
  if (!showScrollTop) return null;

  return (
    <div className="scroll-to-top" onClick={scrollToTop}>
      <FaArrowUp />
    </div>
  );
};

export default ScrollToTopButton;