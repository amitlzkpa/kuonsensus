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

  // const handleOnDrag = useCallback((dragIndex, hoverIndex) => {
  //   const dragItem = sections[dragIndex];
  //   const hoverItem = sections[hoverIndex];
  //   setSections((sections) => {
  //     const updatedSections = [...sections];
  //     updatedSections[dragIndex] = hoverItem;
  //     updatedSections[hoverIndex] = dragItem;
  //     return updatedSections;
  //   });
  // }, [sections]);

  const handleOnDrag = (e, widgetData) => {
    e.dataTransfer.setData("kuonWidgetData", widgetData);
  };

  const handleOnDrop = (e) => {
    const widgetData = e.dataTransfer.getData("kuonWidgetData");
    // const sectionInitDataFromWidget = convertWidgetToSection(widgetData);
    setSections([...sections, widgetData]);
  }

  return (
    <>
      Boom
    </>
  );
}

export default SectionEditor;