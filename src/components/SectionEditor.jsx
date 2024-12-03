import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Flex, Text } from '@mantine/core';

import sampleBoardData from "../assets/samples/c1_boardData.json";

const blockTypeColors = {
  sideEffectBlock: "blue.1",
};

const BlockInTray = ({ blockData, handleOnDragStart }) => {

  return (
    <Card
      h="5rem"
      bg={blockTypeColors[blockData.blockType] ?? "gray.1"}
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
        <Text
          size="sm"
          c="gray.7"
          align="center"
          lh="0.9rem"
        >
          {blockData?.sideEffectObject.sideEffectTitle ?? ""}
        </Text>
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

export const SectionEditor = ({ boardData = sampleBoardData }) => {

  const [avlSideEffectBlocks, setAvlSideEffectBlocks] = useState([]);

  useEffect(() => {

    console.log('sideEffect', boardData.sideEffects[0]);

    let effectBlocks = (boardData.sideEffects ?? []).map((bd, idx) => {

      try {
        const effectBlock = {};
        effectBlock.blockId = `blkId_${bd?.boardName}_${bd?.sideEffectTitle}_${idx}`;
        effectBlock.blockType = "sideEffectBlock";
        effectBlock.sideEffectObject = bd;
        return effectBlock;
      } catch (error) {
        console.log('error', error.message);
        return {};
      }
    });

    effectBlocks = effectBlocks.filter(bd => bd !== bd?.boardId);

    setAvlSideEffectBlocks(effectBlocks);

    console.log('effectBlock', effectBlocks[0]);
    console.log(effectBlocks.length);

  }, [boardData]);


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
          (avlSideEffectBlocks ?? []).length === 0
            ?
            (
              <Card bg="gray.1" radius="xl" h="9rem">
                <Flex
                  h="100%"
                  w="100%"
                  direction="column"
                  align="center"
                  justify="center"
                >
                  <Text
                    size="sm"
                    c="gray.7"
                    fs="italic"
                    align="center"
                  >
                    No Blocks Available
                  </Text>
                </Flex>
              </Card>
            )
            :
            (
              <Flex
                direction="column"
                align="stretch"
                justify="flex-start"
                gap="sm"
                style={{ overflowY: "auto", overflowX: "hidden" }}
              >
                {
                  avlSideEffectBlocks.map((block) => (
                    <BlockInTray
                      key={block.blockId}
                      blockData={block}
                      handleOnDragStart={(e) => handleOnDragStart(e, block)}
                    />
                  ))
                }
              </Flex>
            )
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