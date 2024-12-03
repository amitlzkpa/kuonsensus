import React, { useCallback, useRef, useState } from 'react';
import { Card, Flex } from '@mantine/core';

const BlockInTray = ({ blockData, handleOnDragStart }) => {

  return (
    <Card
      h="5rem"
      bg="gray.1"
      radius="xl"
      style={{ cursor: 'move' }}
      draggable
      onDragStart={handleOnDragStart}
    >
      <Flex
        h="100%"
        direction="column"
        align="center"
        justify="center"
      >
        {blockData?.blockType ?? ""}
      </Flex>
    </Card>
  );
};

const convertBlockToSection = (blockData) => {
  switch (blockData?.blockType) {
    case "A":
      return { srcPrompt: "AA" };
    case "B":
      return { srcPrompt: "AB" };
    case "C":
      return { srcPrompt: "AC" };
    default:
      return { srcPrompt: "AX" };
  }
};

export const SectionEditor = () => {

  const [sections, setSections] = useState([]);

  const handleOnDragStart = (e, blockData) => {
    e.dataTransfer.setData("kuonBlockData", JSON.stringify(blockData));
  };

  const handleOnDropEnd = (e) => {
    const blockData = JSON.parse(e.dataTransfer.getData("kuonBlockData"));
    const sectionInitDataFromBlock = convertBlockToSection(blockData);
    setSections([...sections, sectionInitDataFromBlock]);
  };

  return (
    <Flex w="100%" p="sm" gap="sm">
      {/* Block Tray */}
      <Flex
        w="30%"
        direction="column"
        align="stretch"
        gap="sm"
      >
        <BlockInTray
          blockData={{ blockType: "A" }}
          handleOnDragStart={(e) => handleOnDragStart(e, { blockType: "A" })}
        />
      </Flex>

      {/* Content Sections */}
      <Card
        w="70%"
        mih="30rem"
        mah="100vh"
        bg="red.1"
        radius="xl"
        style={{ overflowY: "auto" }}
        onDrop={handleOnDropEnd}
        onDragOver={(e) => e.preventDefault()}
      >
        <Flex
          w="100%"
          direction="column"
          align="stretch"
          gap="sm"
        >
          {sections.map((section, index) => (
            <Card
              key={index}
              h="5rem"
              bg="gray.1"
              radius="xl"
            >
              <Flex
                h="100%"
                direction="column"
                align="center"
                justify="center"
              >
                {section.srcPrompt}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Card>
    </Flex>
  );
}

export default SectionEditor;