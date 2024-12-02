import React, { useCallback, useRef, useState } from 'react';
import { Card } from '@mantine/core';


export const SectionWrapper = ({ text, index, moveSectionWrapper }) => {
  const ref = useRef(null);

  let isDragging = true;
  const opacity = isDragging ? 0 : 1;

  return (
    <Card
      ref={ref}
      style={{ opacity, cursor: 'move' }}
      bd="1px solid #ddd"
      p="md"
      m="md"
      align="center"
      justify="center"
      h="10rem"
      radius="xl"
      w="100%"
    >
      {text}
    </Card>
  )
}

export const SectionEditor = () => {

  const [sections, setSections] = useState([]);

  return (
    <>
      Boom
    </>
  );
}

export default SectionEditor;