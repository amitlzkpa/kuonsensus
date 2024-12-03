import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card,
  Flex,
  HoverCard,
  Pill,
  Text
} from '@mantine/core';

import sampleBoardData from "../assets/samples/c1_boardData.json";
// import { FaInfoCircle } from 'react-icons/fa';

const blockTypeColors = {
  sideEffectBlock: "blue.1",
};

const contentStubTemplate = {
  sourceBlockItem: {},
  generatedText: "",
  generatedTextFinalized: false,
  generalPromptText: "Create a short stub of text as part of a document out of following text:",
  tone: "formal",
  customPrompt: ""
};

const BlockInTray = ({ blockData, handleOnDragStart = null }) => {
  return (
    <Card
      h="100%"
      bg={blockTypeColors[blockData.blockType] ?? "gray.1"}
      radius="xl"
      style={{ cursor: handleOnDragStart ? 'move' : 'default' }}
      draggable={!!handleOnDragStart}
      onDragStart={(e) => { if (handleOnDragStart) handleOnDragStart(e) }}
    >
      <Flex
        h="100%"
        direction="column"
        align="center"
        justify="center"
        gap="sm"
      >
        {/* Info box */}
        <HoverCard width="24rem" shadow="md">
          <HoverCard.Target>
            <div>
              <Pill
                c={blockData?.sideEffectObject?.implication === "positive" ? "green.9" : "orange.7"}
                withRemoveButton={false}
              >
                {blockData?.sideEffectObject?.implication}
              </Pill>
            </div>
          </HoverCard.Target>
          <HoverCard.Dropdown style={{ height: "18rem", overflowY: "auto" }}>
            <Flex
              w="100%"
              direction="column"
            >
              <Flex
                h="100%"
                direction="column"
                align="stretch"
                justify="space-between"
              >
                <Text size="sm">
                  {blockData?.sideEffectObject?.stakeholderName ?? "-"}
                </Text>

                <Text size="md">
                  {blockData?.sideEffectObject?.implicationReason}
                </Text>
              </Flex>
            </Flex>
          </HoverCard.Dropdown>
        </HoverCard>

        <Text
          size="sm"
          c="gray.7"
          align="center"
          lh="0.9rem"
        >
          {blockData?.sideEffectObject?.sideEffectTitle ?? ""}
        </Text>
      </Flex>
    </Card>
  );
};

const SectionOnSheet = ({ sectionData }) => {
  console.log('-------------');
  console.log(sectionData);
  return (
    <Card
      mih="12rem"
      mah="18rem"
      bg="gray.1"
      radius="xl"
    >
      <Flex
        h="100%"
        w="100%"
        direction="row"
        align="stretch"
        justify="flex-start"
        gap="sm"
      >
        <Flex
          w="30%"
          h="100%"
        >
          <BlockInTray
            blockData={sectionData?.sourceBlockItem}
          />
        </Flex>
        {/* {sectionData?.sourceBlockItem?.sideEffectObject?.sideEffectTitle} */}
      </Flex>
    </Card>
  )
};

const convertBlockToSection = (blockData) => {
  console.log(blockData);
  const sectionData = { ...contentStubTemplate };
  sectionData.sourceBlockItem = blockData;
  switch (blockData?.blockType) {
    case "A":
      // sectionData.generalPromptText = generalPromptText;
      break;
    case "B":
      // sectionData.generalPromptText = generalPromptText;
      break;
    case "C":
      // sectionData.generalPromptText = generalPromptText;
      break;
    default:
      // sectionData.generalPromptText = generalPromptText;
      break;
  }
  return sectionData;
};

export const SectionEditor = ({ boardData = sampleBoardData }) => {

  const [avlSideEffectBlocks, setAvlSideEffectBlocks] = useState([]);

  useEffect(() => {

    // console.log('sideEffect', boardData.sideEffects[0]);

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

    // console.log('effectBlock', effectBlocks[0]);
    // console.log(effectBlocks.length);

  }, [boardData]);


  const [sections, setSections] = useState([]);

  const handleOnDragStart = (e, blockData) => {
    e.dataTransfer.setData("kuonBlockData", JSON.stringify(blockData));
  };

  const handleOnDropEnd = (e) => {
    const blockData = JSON.parse(e.dataTransfer.getData("kuonBlockData"));
    const sectionInitDataFromBlock = convertBlockToSection(blockData);
    console.log(sectionInitDataFromBlock);
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