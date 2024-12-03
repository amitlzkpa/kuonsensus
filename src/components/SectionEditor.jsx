import React, { useCallback, useRef, useState } from 'react';
import { Card, Flex, Text } from '@mantine/core';

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

const SectionOnSheet = ({ sectionData }) => {
  return (
    <Card
      mih="5rem"
      mah="15rem"
      bg="gray.1"
      radius="xl"
    >
      <Flex
        h="100%"
        direction="column"
        align="center"
        justify="center"
      >
        {sectionData.srcPrompt}
      </Flex>
    </Card>
  )
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

const sampleBlocks = [
  { blockId: "a", blockType: "A" },
  { blockId: "b", blockType: "B" },
  { blockId: "c", blockType: "C" },
];

export const SectionEditor = () => {

  const [availableBlocks, setAvailableBlocks] = useState(sampleBlocks);
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
        {
          (availableBlocks ?? []).length === 0
            ?
            (
              <Card bg="gray.1" radius="xl" h="5rem">
                <Flex
                  h="100%"
                  w="100%"
                  align="center"
                  justify="center"
                >
                  <Text size="md" c="gray.7" fs="italic">
                    No Blocks Available
                  </Text>
                </Flex>
              </Card>
            )
            :
            availableBlocks.map((block) => (
              <BlockInTray
                key={block.blockId}
                blockData={block}
                handleOnDragStart={(e) => handleOnDragStart(e, block)}
              />
            ))
        }
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
            <SectionOnSheet
              key={index}
              sectionData={section}
            />
          ))}
        </Flex>
      </Card>
    </Flex>
  );
}

export default SectionEditor;