import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card,
  CloseButton,
  Flex,
  HoverCard,
  Pill,
  Text,
  Input,
  Button,
  Combobox,
  InputBase,
  useCombobox
} from '@mantine/core';

import sampleBoardData from "../assets/samples/c1_boardData.json";
// import { FaInfoCircle } from 'react-icons/fa';

const blockTypeColors = {
  sideEffectBlock: "blue.1",
};

const contentStubTemplate = {
  sectionId: "",
  sourceBlockItem: {},
  generatedText: "",
  generatedTextFinalized: false,
  commonPromptText: "Create a short stub of text as part of a document from the following text:",
  modifier: "formal",
  customPrompt: ""
};

const blockItemTemplate = {
  blockId: "",
  blockType: "",
  sideEffectObject: {}
};

const modifierOptions = [
  "oppose",
  "enhance",
  "downplay",
  "negate",
  "empathize",
];

export function SelectCreatable({
  sectionData = {}
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [data, setData] = useState(modifierOptions);
  const [value, setValue] = useState(sectionData?.modifier ?? '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    sectionData.modifier = value;
  }, [value, sectionData]);

  const exactOptionMatch = data.some((item) => item === search);
  const filteredOptions = exactOptionMatch
    ? data
    : data.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()));

  const options = filteredOptions.map((item) => (
    <Combobox.Option fz="0.7rem" value={item} key={item}>
      {item.toUpperCase()}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        if (val === '$create') {
          setData((current) => [...current, search]);
          setValue(search);
        } else {
          setValue(val);
          setSearch(val);
        }

        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          variant="unstyled"
          size="0.9rem"
          fz="0.7rem"
          rightSection={<Combobox.Chevron />}
          value={value}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value || '');
          }}
          placeholder="Pick a modifier"
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value="$create">+ Create {search}</Combobox.Option>
          )}
          {options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

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
          lh="1.1rem"
        >
          {blockData?.sideEffectObject?.sideEffectTitle ?? ""}
        </Text>
      </Flex>
    </Card>
  );
};

const SectionOnSheet = ({ sectionData, onClickRemoveSection = () => { } }) => {
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
        <Flex
          w="70%"
          direction="column"
          justify="flex-start"
          align="stretch"
        >
          <Flex
            justify="space-between"
            align="center"
            gap="sm"
          >
            <SelectCreatable
              sectionData={sectionData}
            />
            {
              !onClickRemoveSection
                ?
                <></>
                :
                (
                  <CloseButton
                    variant="subtle"
                    onClick={() => { onClickRemoveSection(sectionData) }}
                  />
                )
            }
          </Flex>
          <Text fz="0.7rem">
            {sectionData?.customPrompt}
          </Text>
          <Text fz="0.7rem">
            {sectionData?.commonPromptText}
          </Text>
          <Text fz="0.7rem">
            {sectionData?.generatedTextFinalized.toString()}
          </Text>
          <Text fz="0.7rem">
            {sectionData?.generatedText}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
};

const convertBlockToSection = (blockData) => {
  const sectionData = { ...contentStubTemplate };
  sectionData.sectionId = `scnId_${blockData.blockId}_${Math.floor(Math.random() * 100000)}`;
  sectionData.sourceBlockItem = blockData;
  switch (blockData?.blockType) {
    case "sideEffectBlock":
      // sectionData.commonPromptText = commonPromptText;
      break;
    case "stakeHolderBlock":
      // sectionData.commonPromptText = commonPromptText;
      break;
    case "structureBlock":
      // sectionData.commonPromptText = commonPromptText;
      break;
    default:
      // sectionData.commonPromptText = commonPromptText;
      break;
  }
  return sectionData;
};

export const SheetEditor = ({
  boardData = sampleBoardData,
  onHitGo = null
}) => {

  const [avlSideEffectBlocks, setAvlSideEffectBlocks] = useState([]);

  useEffect(() => {

    // console.log('sideEffect', boardData.sideEffects[0]);

    let effectBlocks = (boardData.sideEffects ?? []).map((bd, idx) => {

      try {
        const effectBlock = { ...blockItemTemplate };
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
    <Flex
      direction="column"
      align="stretch"
      gap="sm"
      py="sm"
    >
      <Flex
        w="100%"
        justify="space-between"
      >
        <div></div>
        <Button
          onClick={() => { if (onHitGo) onHitGo({ sections }) }}
        >Go
        </Button>
      </Flex>

      <Flex w="100%" p="sm" gap="sm">
        {/* Block Tray */}
        <Flex
          w="30%"
          direction="column"
          align="stretch"
          gap="sm"
          py="sm"
        >
          <Input
            w="100%"
            onChange={(e) => { console.log(e.target.value) }}
          />
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
                key={section.sectionId}
                sectionData={section}
                onClickRemoveSection={(section) => {
                  setSections(sections.filter((s) => s.sectionId !== section.sectionId));
                }}
              />
            ))}
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}

export default SheetEditor;