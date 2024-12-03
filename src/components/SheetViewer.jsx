import React, { useCallback, useEffect, useRef, useState } from 'react';

export const SheetViewer = ({ boardData }) => {
  return (
    <>
      <pre>
        {boardData.generatedArticles[0].articleText}
      </pre>
    </>
  );
};

export default SheetViewer;