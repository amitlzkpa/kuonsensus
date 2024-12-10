import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CloseButton,
  Flex,
  HoverCard,
  Pill,
  Text,
  Input,
  Combobox,
  InputBase,
  useCombobox,
} from '@mantine/core';
import { FaInfoCircle } from 'react-icons/fa';

import { generateArticle } from "../utils/extractionHelpers";
import { PromptReady_TextArea } from "../components/PromptReady_TextArea";

import { useLLMRef } from "../hooks/llmRef";

import sampleBoardData from "../assets/samples/c1_boardData.json";

const structureBlockTemplates = [
  {
    blockId: "",
    blockType: "structureBlock",
    structureObject: {
      "type": "introduction",
      "label": "Introduction",
      "description": "Introduce the topic and the issue at hand."
    }
  },
  {
    blockId: "",
    blockType: "structureBlock",
    structureObject: {
      "type": "conclusion",
      "label": "Conclusion",
      "description": "Summarize the key points and provide a conclusion."
    }
  },
  {
    blockId: "",
    blockType: "structureBlock",
    structureObject: {
      "type": "example",
      "label": "Example",
      "description": "Provide an example to illustrate the previous point."
    }
  },
  {
    blockId: "",
    blockType: "structureBlock",
    structureObject: {
      "type": "custom",
      "label": "Custom",
      "description": "Custom section for your content."
    }
  }
];

const blockTypeColors = {
  sideEffectBlock: "blue.1",
  structureBlock: "grey.1",
};

const commonPromptTexts = {
  sideEffectBlock: "Create a short stub of text as part of a document from the following text:",
  structureBlock: "Create a short stub of text as part of a document from the following text:"
};

const contentStubTemplate = {
  sectionId: "",
  sourceBlockItem: {},
  generatedText: "",
  commonPromptText: "commonPromptTexts",
  modifier: "",
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
  "empathize",
];

export function SelectSectionModifier({
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

const articleLengthOptions = [
  { value: 'short', description: '200-400 words. Good for short blurbs.' },
  { value: 'medium', description: '400-800 words. Mid-size giving you more room to express.' },
  { value: 'long', description: '800-2000 words. Long form content to make a strong case.' },
];

function ArticleLengthOption({ value, description }) {
  return (
    <Flex
      direction="column"
      align="stretch"
    >
      <Text fz="sm" fw={500}>
        {`${value.charAt(0).toUpperCase()}${value.slice(1)}`}
      </Text>
      <Text fz="xs" opacity={0.6}>
        {description}
      </Text>
    </Flex>
  );
}

export function SelectArticleLength({
  startValue = 'medium',
  onNewArticleLengthSelected = () => { }
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState(startValue);
  const selectedOption = articleLengthOptions.find((item) => item.value === value);

  const options = articleLengthOptions.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      <ArticleLengthOption {...item} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      w="100%"
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(val);
        onNewArticleLengthSelected(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          multiline
        >
          {selectedOption ? (
            `${selectedOption.value.charAt(0).toUpperCase()}${selectedOption.value.slice(1)}`
          ) : (
            <Input.Placeholder>Pick value</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

const BlockInTray_SideEffect = ({ blockData }) => {
  return (
    <Flex
      h="100%"
      direction="column"
      align="center"
      justify="center"
      gap="sm"
    >
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
                {blockData?.sideEffectObject?.stakeHolderName ?? "-"}
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
  );
};

const BlockInTray_Structure = ({ blockData }) => {
  return (
    <Flex
      h="100%"
      direction="column"
      align="center"
      justify="center"
      gap="sm"
    >
      <HoverCard width="24rem" shadow="md">
        <HoverCard.Target>
          <div>
            <FaInfoCircle width="0.3rem" height="0.3rem" color="#ABABAB" />
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
              <Text size="md">
                {blockData?.structureObject?.description}
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
        {blockData?.structureObject?.label ?? ""}
      </Text>
    </Flex>
  );
};


const BlockInTray = ({ blockData, handleOnDragStart = null }) => {
  return (
    <Card
      h="100%"
      w="100%"
      bg={blockTypeColors[blockData.blockType] ?? "gray.1"}
      radius="xl"
      style={{ cursor: handleOnDragStart ? 'move' : 'default' }}
      draggable={!!handleOnDragStart}
      onDragStart={(e) => { if (handleOnDragStart) handleOnDragStart(e) }}
    >

      {
        blockData.blockType === "sideEffectBlock"
          ?
          <BlockInTray_SideEffect
            blockData={blockData}
          />
          :
          blockData.blockType === "structureBlock"
            ?
            <BlockInTray_Structure
              blockData={blockData}
            />
            :
            <></>
      }

    </Card>
  );
};

const SectionBlockOnSheet = ({ sectionData, onClickRemoveSection }) => {

  return (
    <>
      {
        sectionData?.sourceBlockItem?.blockType === "sideEffectBlock"
          ?
          <SectionBlockOnSheet_SideEffect
            sectionData={sectionData}
            onClickRemoveSection={onClickRemoveSection}
          />
          :
          sectionData?.sourceBlockItem?.blockType === "structureBlock"
            ?
            <SectionBlockOnSheet_Structure
              sectionData={sectionData}
              onClickRemoveSection={onClickRemoveSection}
            />
            :
            <></>
      }
    </>
  );
};

const SectionBlockOnSheet_SideEffect = ({ sectionData, onClickRemoveSection }) => {

  const [generatedTextBuffer, setGeneratedTextBuffer] = useState(sectionData?.generatedText);

  useEffect(() => {
    sectionData.generatedText = generatedTextBuffer;
  }, [generatedTextBuffer, sectionData]);

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        gap="sm"
      >
        <SelectSectionModifier
          sectionData={sectionData}
        />
        <Flex
          direction="row"
          justify="flex-end"
          align="center"
          gap="sm"
        >
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
      </Flex>
      <Text fz="0.7rem">
        {sectionData?.sourceBlockItem?.sideEffectObject?.implicationReason}
      </Text>
      <Flex
        direction="column"
        w="100%"
        h="100%"
        p="sm"
        align="stretch"
      >
        <PromptReady_TextArea
          height="100%"
          enableAiGeneration={true}
          promptBase={`Rewrite following text${sectionData.modifier ? ` and modify it to ${sectionData.modifier} it` : ""}:\n${sectionData?.sourceBlockItem?.sideEffectObject?.sideEffectTitle} is ${sectionData?.sourceBlockItem?.sideEffectObject?.implication === "negative" ? "bad" : "good"} for ${sectionData?.sourceBlockItem?.sideEffectObject?.stakeHolderName} because ${sectionData?.sourceBlockItem?.sideEffectObject?.implicationReason}`}
          promptSamples=""
          inputValue={generatedTextBuffer}
          setInputValue={setGeneratedTextBuffer}
          generateOnLoad={true}
          textareaProps={{
            variant: "unstyled",
            placeholder: "Make a point...",
            minRows: 3,
            maxRows: 4,
            rows: 4
          }}
        />
      </Flex>
    </>
  );
};

const SectionBlockOnSheet_Structure = ({ sectionData, onClickRemoveSection }) => {

  const [generatedTextBuffer, setGeneratedTextBuffer] = useState(sectionData?.generatedText);

  useEffect(() => {
    sectionData.generatedText = generatedTextBuffer;
  }, [generatedTextBuffer, sectionData]);

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        gap="sm"
      >
        <Flex />
        <Flex
          direction="row"
          justify="flex-end"
          align="center"
          gap="sm"
        >
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
      </Flex>
      <Text fz="0.7rem">
        {sectionData?.sourceBlockItem?.structureBlockObject?.description}
      </Text>
      <Flex
        direction="column"
        w="100%"
        h="100%"
        p="sm"
        align="stretch"
      >
        <PromptReady_TextArea
          height="100%"
          enableAiGeneration={true}
          promptBase={`Replace this section with a paragraph to act as ${sectionData?.sourceBlockItem?.structureBlockObject?.label} in context of the rest of the content. ${sectionData?.sourceBlockItem?.structureBlockObject?.description}.${generatedTextBuffer ? ` Make sure to address comment below in the rewrite.\n${generatedTextBuffer}` : ""}`}
          promptSamples=""
          inputValue={generatedTextBuffer}
          setInputValue={setGeneratedTextBuffer}
          generateOnLoad={true}
          textareaProps={{
            variant: "unstyled",
            placeholder: "Add details...",
            minRows: 3,
            maxRows: 4,
            rows: 4
          }}
        />
      </Flex>
    </>
  );
};

const SectionOnSheet = ({ sectionData, onClickRemoveSection = () => { } }) => {

  return (
    <Card
      mih="15rem"
      mah="20rem"
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
          <SectionBlockOnSheet
            sectionData={sectionData}
            onClickRemoveSection={onClickRemoveSection}
          />
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
      sectionData.commonPromptText = commonPromptTexts.sideEffectBlock;
      // sectionData.commonPromptText = commonPromptText;
      break;
    case "stakeHolderBlock":
      // sectionData.commonPromptText = commonPromptText;
      break;
    case "structureBlock":
      sectionData.commonPromptText = commonPromptTexts.structureBlock;
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
  onArticleSave = null
}) => {

  const [avlSideEffectBlocks, setAvlSideEffectBlocks] = useState([]);

  const [filteredBlocks, setFilteredBlocks] = useState([]);

  const [filterSearchTerm, setFilterSearchTerm] = useState("");

  useEffect(() => {
    if (filterSearchTerm.trim() === "") {
      setFilteredBlocks(avlSideEffectBlocks);
      return;
    }
    setFilteredBlocks(avlSideEffectBlocks.filter((blk) => {
      return blk?.sideEffectObject?.sideEffectTitle?.toLowerCase().includes(filterSearchTerm.toLowerCase());
    }));
  }, [filterSearchTerm, avlSideEffectBlocks]);

  useEffect(() => {

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

    effectBlocks = effectBlocks.filter(bd => bd?.blockId);

    let structureBlocks = structureBlockTemplates.map((sb, idx) => {

      try {
        const structureBlock = { ...sb };
        structureBlock.blockId = `blkId_${sb?.structureObject?.type}_${idx}`;
        structureBlock.blockType = "structureBlock";
        structureBlock.structureBlockObject = sb.structureObject;
        return structureBlock;
      } catch (error) {
        console.log('error', error.message);
        return {};
      }
    });

    structureBlocks = structureBlocks.filter(sb => sb?.blockId);

    const allBlocks = [...structureBlocks, ...effectBlocks];

    setAvlSideEffectBlocks(allBlocks);

  }, [boardData]);

  const [articleLength, setArticleLength] = useState("medium");
  const [sections, setSections] = useState([]);

  const handleOnDragStart = (e, blockData) => {
    e.dataTransfer.setData("kuonBlockData", JSON.stringify(blockData));
  };

  const handleOnDropEnd = (e) => {
    const blockData = JSON.parse(e.dataTransfer.getData("kuonBlockData"));
    const sectionInitDataFromBlock = convertBlockToSection(blockData);
    setSections([...sections, sectionInitDataFromBlock]);
  };

  // REWRITE ARTICLE

  const articleLengthPromptTextOptions = {
    short: "Keep the word count between 200 to 400 words.",
    medium: "Keep the word count between 400 to 800 words.",
    long: "Keep the word count between 800 to 1200 words."
  }

  const llmRef = useLLMRef();

  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  const handleOnHitGo = async () => {

    try {
      setIsGeneratingArticle(true);
      const sectionStubLinesArray = (sections ?? []).map((section, idx) => {
        return [
          section.generatedText
          ??
          `${section?.sourceBlockItem?.sideEffectObject?.sideEffectTitle} is ${section?.sourceBlockItem?.sideEffectObject?.implication === "negative" ? "bad" : "good"} for ${section?.sourceBlockItem?.sideEffectObject?.stakeHolderName} because ${section?.sourceBlockItem?.sideEffectObject?.implicationReason}`,
        ];
      });

      const issueDescription = boardData?.boardDescription;
      const outlineText = sectionStubLinesArray.flat().join("\n");
      const articleLengthText = articleLengthPromptTextOptions[articleLength];

      const articleDraftText = [
        "",
        "### Objective:",
        issueDescription,
        "### Article Length",
        articleLengthText,
        "",
        "### Outline:",
        outlineText,
        ""
      ].join("\n");

      const rewrittenArticle = await generateArticle(articleDraftText, llmRef);

      if (onArticleSave) {
        onArticleSave({
          rewrittenArticle,
          sectionStubLinesArray,
          articleDraftText,
          articleLength
        });
      }

    } catch (error) {
      console.error(error.message);
    } finally {
      setIsGeneratingArticle(false);
    }
  }

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
        <Flex w="24rem" align="center" gap="sm">
          <SelectArticleLength
            startValue={articleLength}
            onNewArticleLengthSelected={setArticleLength}
          />
        </Flex>

        <Flex align="center" gap="sm">
          <Button
            variant="outline"
            disabled={isGeneratingArticle}
            onClick={() => { setSections([]) }}
          >
            Reset
          </Button>
          <Button
            loading={isGeneratingArticle}
            onClick={handleOnHitGo}
          >
            Go
          </Button>
        </Flex>
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
            value={filterSearchTerm}
            onChange={(e) => { setFilterSearchTerm(e.target.value) }}
            placeholder="Search blocks..."
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
                    filteredBlocks.map((block) => (
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
            pb="10rem"
            direction="column"
            align="stretch"
            gap="sm"
          >
            {(sections ?? []).length === 0
              ?
              (
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
                    mt="xl"
                  >
                    Start by dragging blocks from the tray
                  </Text>
                </Flex>
              )
              :
              (
                sections.map((section, index) => (
                  <SectionOnSheet
                    key={section.sectionId}
                    sectionData={section}
                    onClickRemoveSection={(section) => {
                      setSections(sections.filter((s) => s.sectionId !== section.sectionId));
                    }}
                  />
                ))
              )
            }
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}

export default SheetEditor;