import React, { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  Button,
  Card,
  Pill,
  Flex,
  HoverCard,
  Loader,
  Stepper,
  Tabs,
  Text,
  Title,
  Skeleton,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import Typed from "typed.js";
import { FaTrashAlt } from 'react-icons/fa';
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Environment, SoftShadows } from '@react-three/drei';

import {
  extractStakeholders,
  extractSideEffects,
  generateDescription,
  generateTitle
} from "../utils/extractionHelpers";
import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";
import { useLLMRef } from "../hooks/llmRef";
import { useStoredBoards, triggerStorageUpdate } from '../hooks/localStorage';
import { PromptReady_TextArea } from "../components/PromptReady_TextArea";
import { PromptReady_TextInput } from "../components/PromptReady_TextInput";
import { Kuon3D_StakeHolder } from "../components/Kuon3D_StakeHolder";

// import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";
// import sampleSideEffects from "../assets/samples/a1_sideEffects.json";

function getSeatingConfiguration(participants) {

  const seatSize = 12;
  const tableDepth = seatSize * 2;
  const totalSeats = (participants ?? []).length;

  const seats = [];
  const tableLength = Math.ceil(totalSeats / 2) * seatSize; // Calculate table length based on seat count
  const halfDepth = tableDepth / 2;
  const halfLength = tableLength / 2;

  for (let i = 0; i < totalSeats; i++) {
    if (i < totalSeats / 2) {
      // Top side (horizontal axis)
      const x = -halfLength + i * seatSize;
      const y = halfDepth;
      seats.push({
        stakeHolder: participants[i],
        position: [x, 0, y]
      });
    } else {
      // Bottom side (horizontal axis)
      const x = -halfLength + (i - totalSeats / 2) * seatSize;
      const y = -halfDepth;
      seats.push({
        stakeHolder: participants[i],
        position: [x, 0, y]
      });
    }
  }

  return seats;
}

const sampleStartingPrompt = `
In order to address environmental concerns from new construction,
propose requiring developers to include measures such as
- tree planting
- renewable energy systems
- contributions to local conservation funds
`;

const ImplicationList = ({ sideEffects, handleRemoveSideEffect }) => {
  return (
    <Flex
      direction="column"
      align="stretch"
      justify="start"
      gap="sm"
    >
      {
        sideEffects.map(
          (sideEffect, idx) => (
            <Flex
              key={sideEffect.sideEffectTitle}
              direction="row"
              align="center"
              justify="start"
              gap="sm"
            >
              <Pill
                c={sideEffect.implication === "positive" ? "green.9" : "orange.7"}
                withRemoveButton
                onRemove={() => handleRemoveSideEffect(sideEffect)}
              >
                {sideEffect.implication}
              </Pill>

              <HoverCard width={280} height={50} shadow="md">
                <HoverCard.Target>
                  <div>
                    <Text>{sideEffect.sideEffectTitle}</Text>
                  </div>
                </HoverCard.Target>
                <HoverCard.Dropdown style={{ maxHeight: "10rem", overflowY: "auto" }}>
                  <Flex
                    direction="column"
                    w="100%"
                  >
                    <Text size="md">
                      {sideEffect.implicationReason}
                    </Text>
                  </Flex>
                </HoverCard.Dropdown>
              </HoverCard>
            </Flex>
          )
        )
      }
    </Flex>
  );
}


const Board_Init = ({ boardId, setBoardData }) => {

  const llmRef = useLLMRef();

  const storedBoards = useStoredBoards();

  const tabVals = ["first", "second", "third"];
  const [active, setActive] = useState(0);
  const [activeTabVal, setActiveTabVal] = useState("first");

  const [highestStepVisited, setHighestStepVisited] = useState(active);

  const handleStepChange = (nextStep) => {
    const isOutOfBounds = nextStep > tabVals.length || nextStep < 0;

    if (isOutOfBounds) {
      return;
    }

    setActive(nextStep);
    setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
  };

  const shouldAllowSelectStep = (step) => highestStepVisited >= step && active !== step;


  useEffect(() => {
    setActiveTabVal(tabVals[active]);
  }, [active, tabVals]);

  const [userInitText, setUserInitText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [bufferBoardDataInit, setBufferBoardDataInit] = useState();
  const [eachUniqueSideEffect, setEachUniqueSideEffect] = useState([]);

  useEffect(() => {

    const uqSideEffectList = [];
    for (let sideEffect of bufferBoardDataInit?.sideEffects ?? []) {
      let currSdEf = uqSideEffectList.find(uqEff => uqEff.sideEffectTitle === sideEffect.sideEffectTitle);
      if (!currSdEf) {
        let uqSdEf = {
          sideEffectTitle: sideEffect.sideEffectTitle,
          sideEffectItemList: [sideEffect]
        }
        uqSideEffectList.push(uqSdEf);
      }
      else {
        currSdEf.sideEffectItemList.push(sideEffect);
      }
    }
    setEachUniqueSideEffect(uqSideEffectList);

  }, [bufferBoardDataInit]);

  const handleFinalizeBoardSetup = async () => {
    const boardIdx = storedBoards.findIndex((board) => board.boardId === boardId);
    const foundBoard = storedBoards[boardIdx] ?? {};
    bufferBoardDataInit.boardId = boardId;
    bufferBoardDataInit.proposalPrompt = userInitText;
    bufferBoardDataInit.hasBeenInitialized = true;
    const consolidatedBoardData = { ...foundBoard, ...bufferBoardDataInit };
    const updStoredBoards = [...storedBoards];
    updStoredBoards[boardIdx] = consolidatedBoardData;
    localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
    triggerStorageUpdate();
    setBoardData(consolidatedBoardData);
  };

  const titleEl = useRef(null);
  const descriptionEl = useRef(null);

  const handleSubmit = async () => {
    if (isProcessing) return;
    handleStepChange(1);
    setIsProcessing(true);

    try {

      const creationBuffer = {};
      creationBuffer.sideEffects = [];
      creationBuffer.stakeHolders = [];

      setBufferBoardDataInit({
        ...bufferBoardDataInit,
        ...creationBuffer,
      });

      const boardName = await generateTitle(userInitText, llmRef);
      creationBuffer.boardName = boardName;

      new Typed(titleEl.current, {
        strings: [boardName],
        typeSpeed: 50,
        loop: false,
        showCursor: false,
      });

      setBufferBoardDataInit({
        ...bufferBoardDataInit,
        ...creationBuffer,
      });

      const boardDescription = await generateDescription(userInitText, llmRef);
      creationBuffer.boardDescription = boardDescription;

      new Typed(descriptionEl.current, {
        strings: [boardDescription],
        typeSpeed: 20,
        loop: false,
        showCursor: false,
      });

      setBufferBoardDataInit({
        ...bufferBoardDataInit,
        ...creationBuffer,
      });

      const stakeHolders = await extractStakeholders(userInitText, llmRef);
      // const stakeHolders = sampleStakeHolders;
      creationBuffer.stakeHolders = stakeHolders;

      setBufferBoardDataInit({
        ...bufferBoardDataInit,
        ...creationBuffer,
      });

      const allSideEffects = [];
      for (const stakeHolder of stakeHolders) {
        const stakeHolderSideEffects = await extractSideEffects(userInitText, stakeHolder, llmRef);
        allSideEffects.push(stakeHolderSideEffects);
      }

      const sideEffects = allSideEffects.flat();
      creationBuffer.sideEffects = sideEffects;

      console.log(creationBuffer);

      setBufferBoardDataInit(creationBuffer);
    } catch (error) {
      console.error(error?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveSideEffect = (sideEffect) => {
    const updSideEffects = bufferBoardDataInit.sideEffects.filter((se) => se.sideEffectTitle !== sideEffect.sideEffectTitle);
    setBufferBoardDataInit({
      ...bufferBoardDataInit,
      sideEffects: updSideEffects
    });
  };

  const handleDeleteStakeHolder = (stakeHolder) => {
    const updSideEffects = bufferBoardDataInit.sideEffects.filter((se) => se.stakeHolderName !== stakeHolder.stakeHolderName);
    const updStakeHolders = bufferBoardDataInit.stakeHolders.filter((sh) => sh.stakeHolderName !== stakeHolder.stakeHolderName);
    setBufferBoardDataInit({
      ...bufferBoardDataInit,
      sideEffects: updSideEffects,
      stakeHolders: updStakeHolders
    });
  };

  const [newStakeholderName, setNewStakeholderName] = useState("");
  const [newStakeholderDescription, setNewStakeholderDescription] = useState("");

  const handleAddStakeholder = () => {
    const updStakeHolders = [...bufferBoardDataInit.stakeHolders, {
      stakeHolderName: newStakeholderName,
      description: newStakeholderDescription
    }];
    setBufferBoardDataInit({
      ...bufferBoardDataInit,
      stakeHolders: updStakeHolders
    });
    setNewStakeholderName("");
    setNewStakeholderDescription("");
  };

  const [positiveSideEffectTitleBuffer, setPositiveSideEffectTitleBuffer] = useState("");
  const [positiveSideEffectReasonBuffer, setPositiveSideEffectReasonBuffer] = useState("");

  const handlePositiveSideEffectAdd = () => {
    const updSideEffects = [...bufferBoardDataInit.sideEffects, {
      sideEffectTitle: positiveSideEffectTitleBuffer,
      implication: "positive",
      implicationReason: positiveSideEffectReasonBuffer
    }];
    setBufferBoardDataInit({
      ...bufferBoardDataInit,
      sideEffects: updSideEffects
    });
    setPositiveSideEffectTitleBuffer("");
    setPositiveSideEffectReasonBuffer("");
  };

  const [negativeSideEffectTitleBuffer, setNegativeSideEffectTitleBuffer] = useState("");
  const [negativeSideEffectReasonBuffer, setNegativeSideEffectReasonBuffer] = useState("");

  const handleNegativeSideEffectAdd = () => {
    const updSideEffects = [...bufferBoardDataInit.sideEffects, {
      sideEffectTitle: negativeSideEffectTitleBuffer,
      implication: "negative",
      implicationReason: negativeSideEffectReasonBuffer
    }];
    setBufferBoardDataInit({
      ...bufferBoardDataInit,
      sideEffects: updSideEffects
    });
    setNegativeSideEffectTitleBuffer("");
    setNegativeSideEffectReasonBuffer("");
  };

  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        justify="start"
        gap="md"
      >
        {/* Top Row */}
        <Flex
          direction="row"
          align="center"
          justify="space-between"
        >
          <Title order={3}>Set Up Your Board</Title>

          <Flex
            direction="row"
            align="center"
            gap="sm"
          >
            {isProcessing ? (
              <Loader type="dots" />
            ) : (
              <></>
            )}

            <Button
              onClick={handleFinalizeBoardSetup}
              disabled={active !== 2}
            >
              Done
            </Button>
          </Flex>

        </Flex>
      </Flex>

      {/* Stepper */}
      <Flex
        direction="column"
        align="center"
        mt="sm"
        mb="lg"
      >
        <Stepper active={active} onStepClick={handleStepChange}>
          <Stepper.Step
            label="First step"
            description="Give an outline"
            allowStepSelect={shouldAllowSelectStep(0)}
          >
            Step 1: Start with an outline of your proposal
          </Stepper.Step>
          <Stepper.Step
            label="Second step"
            description="Review stakeholders"
            allowStepSelect={shouldAllowSelectStep(1)}
          >
            Step 2: Review who is involved
          </Stepper.Step>
          <Stepper.Step
            label="Third step"
            description="Set priorities"
            allowStepSelect={shouldAllowSelectStep(2)}
          >
            Step 3: Set priorities and your goals
          </Stepper.Step>
        </Stepper>
      </Flex>

      {/* Step content */}
      <Flex
        direction="column"
        align="stretch"
        w="100%"
      >
        <Tabs value={activeTabVal}>
          <Tabs.Panel value="first">
            {/* Prompt Area */}
            <Flex
              direction="column"
              align="stretch"
              justify="start"
              gap="sm"
            >
              <Flex
                direction="column"
                align="stretch"
                justify="start"
              >
                <Text>
                  Enter details of your proposal below.
                </Text>
                <Text>
                  You can start with a simple outline and use the magic button to polish it.
                </Text>
              </Flex>
            </Flex>

            <Flex
              direction="column"
              align="stretch"
              justify="start"
            >
              <PromptReady_TextArea
                height="10rem"
                enableAiGeneration={true}
                promptBase={`Provide a 2-3 line description for a proposal on the topic given below\nStructure it similar to the sample below.\n\n## Topic:\n\n${!userInitText ? ["A new construction project.", "A new product launch.", "A new marketing campaign.", "A new business venture."][Math.floor(Math.random() * 4)] : userInitText}\n`}
                promptSamples="To align competing departmental priorities, propose prioritizing high-margin product lines that offer the greatest profitability potential. This approach ensures financial stability while enabling reinvestment in broader initiatives over time. Marketing and R&D efforts could focus on these strategic products to maximize impact.\n\nPropose an investment of $2 million to expand our reach into high-potential markets, leveraging the proven success of our flagship product. This funding will focus on scaling marketing efforts and establishing strategic partnerships in regions where demand is underserved.\n\nPropose that our organization formalize a hybrid work model, allowing employees to work from home two to three days a week. This approach can reduce office utility costs, ease the burden of commuting, and increase overall job satisfaction."
                inputValue={userInitText}
                setInputValue={setUserInitText}
                textareaProps={{
                  placeholder: sampleStartingPrompt,
                  minRows: 4,
                  maxRows: 12,
                  rows: 6,
                }}
              />
            </Flex>

            {/* Buttons Row */}
            <Flex
              gap="sm"
              justify="flex-start"
              align="center"
              direction="row"
            >
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || !userInitText}
              >
                Submit
              </Button>
            </Flex>

            {/* Bottom Instructions */}
            <Flex
              direction="column"
              align="stretch"
              justify="start"
            >
              <Text>
                Hit Submit when you are ready.
              </Text>
              <Text>
                We will analyze it to help you identify stakeholders and potential side effects.
              </Text>
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="second">
            {/* Title and Desc */}
            <Flex
              direction="column"
              align="start"
              justify="start"
            >
              <Title order={2}>
                <span contentEditable ref={titleEl} />
              </Title>
              <Text>
                <span contentEditable ref={descriptionEl} />
              </Text>
            </Flex>

            {/* Stakeholders List */}
            <Flex gap="md">
              <Flex
                direction="column"
                gap="sm"
                w="100%"
                mt="lg"
              >
                <Title order={4}>
                  Stakeholders
                </Title>

                {
                  isProcessing && (bufferBoardDataInit?.stakeHolders ?? []).length < 1 ? (
                    <Flex
                      direction="column"
                      align="stretch"
                      gap="sm"
                    >
                      <Skeleton height={16} radius="xl" />
                      <Skeleton height={16} radius="xl" />
                      <Skeleton height={16} radius="xl" />
                      <Skeleton height={16} radius="xl" />
                    </Flex>
                  ) : (
                    <>
                      <Accordion multiple>
                        {
                          (bufferBoardDataInit?.stakeHolders ?? []).map(
                            (stakeHolder, idx) => (
                              <Accordion.Item key={idx} value={stakeHolder.stakeHolderName}>
                                <Accordion.Control icon={"→"}>
                                  {stakeHolder.stakeHolderName}
                                </Accordion.Control>
                                <Accordion.Panel>
                                  <Flex
                                    key={idx}
                                    direction="column"
                                    align="stretch"
                                    justify="flex-start"
                                  >
                                    <Flex
                                      direction="row"
                                      align="center"
                                      justify="space-between"
                                      gap="sm"
                                      p="md"
                                    >
                                      <Flex></Flex>
                                      <Flex>
                                        <FaTrashAlt
                                          color="#ababab"
                                          onClick={() => { handleDeleteStakeHolder(stakeHolder) }}
                                          style={{ cursor: "pointer" }}
                                        />
                                      </Flex>
                                    </Flex>
                                    <Text>{stakeHolder.description}</Text>

                                    <Flex
                                      direction="row"
                                      gap="sm"
                                      p="md"
                                      w="100%"
                                    >
                                      {/* Positives */}
                                      <Flex
                                        w="50%"
                                        direction="column"
                                        gap="sm"
                                      >
                                        <Accordion variant="filled" chevron={null} defaultValue="second" w="100%">
                                          <Accordion.Item key="first" value="first">
                                            <Accordion.Control icon="+">
                                              <Text c="gray.5" fz="sm">
                                                <Pill c="green.9">positive</Pill>
                                              </Text>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                              <Flex
                                                direction="column"
                                                align="stretch"
                                                justify="flex-start"
                                                gap="sm"
                                                p="md"
                                                h="13rem"
                                                w="100%"
                                              >
                                                <Flex
                                                  direction="row"
                                                  align="center"
                                                  gap="sm"
                                                >
                                                  <Button onClick={handlePositiveSideEffectAdd}>
                                                    Add
                                                  </Button>
                                                </Flex>
                                                <PromptReady_TextInput
                                                  enableAiGeneration={true}
                                                  promptBase={`Generate title describing a positive side effect for ${stakeHolder.stakeHolderName}${positiveSideEffectTitleBuffer ? ` around ${positiveSideEffectTitleBuffer}` : ''} based on the following proposal: ${bufferBoardDataInit?.proposalPrompt}`}
                                                  promptSamples="Increased Revenue, Improved Customer Satisfaction, Reduced Costs etc."
                                                  inputValue={positiveSideEffectTitleBuffer}
                                                  setInputValue={setPositiveSideEffectTitleBuffer}
                                                  inputProps={{
                                                    placeholder: "Effect label",
                                                  }}
                                                />
                                                <PromptReady_TextArea
                                                  height="4rem"
                                                  enableAiGeneration={true}
                                                  promptBase={`Provide a 1-line reason as to why ${positiveSideEffectTitleBuffer} affects ${stakeHolder.stakeHolderName} positively in context of the following proposal: ${bufferBoardDataInit?.proposalPrompt}`}
                                                  promptSamples={"Renewable energy systems can reduce long-term energy costs, providing financial benefits to investors.\nNew construction projects can create job opportunities for the local community, boosting the local economy\nTree planting can improve air quality, benefiting the health and well-being of the local community"}
                                                  inputValue={positiveSideEffectReasonBuffer}
                                                  setInputValue={setPositiveSideEffectReasonBuffer}
                                                  textareaProps={{
                                                    placeholder: "Enter reasoning for effect",
                                                    minRows: 2,
                                                    maxRows: 12,
                                                    rows: 2,
                                                  }}
                                                />
                                              </Flex>
                                            </Accordion.Panel>
                                          </Accordion.Item>
                                        </Accordion>

                                        {
                                          isProcessing ? (
                                            <Flex
                                              direction="column"
                                              align="stretch"
                                              gap="sm"
                                              w="100%"
                                            >
                                              <Skeleton height={16} radius="xl" />
                                              <Skeleton height={16} radius="xl" />
                                              <Skeleton height={16} radius="xl" />
                                              <Skeleton height={16} radius="xl" />
                                            </Flex>
                                          ) : (
                                            <ImplicationList sideEffects={(bufferBoardDataInit?.sideEffects ?? [])
                                              .filter((sideEffect) => sideEffect.stakeHolderName === stakeHolder.stakeHolderName)
                                              .filter((sideEffect) => sideEffect.implication === "positive")
                                            }
                                              handleRemoveSideEffect={handleRemoveSideEffect}
                                            />
                                          )
                                        }

                                      </Flex>

                                      {/* Negatives */}
                                      <Flex
                                        w="50%"
                                        direction="column"
                                        gap="sm"
                                      >
                                        <Accordion variant="filled" chevron={null} defaultValue="second" w="100%">
                                          <Accordion.Item key="first" value="first">
                                            <Accordion.Control icon="+">
                                              <Text c="gray.5" fz="sm">
                                                <Pill c="orange.7">negative</Pill>
                                              </Text>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                              <Flex
                                                direction="column"
                                                align="stretch"
                                                justify="flex-start"
                                                gap="sm"
                                                p="md"
                                                h="13rem"
                                                w="100%"
                                              >
                                                <Flex
                                                  direction="row"
                                                  align="center"
                                                  gap="sm"
                                                >
                                                  <Button onClick={handleNegativeSideEffectAdd}>
                                                    Add
                                                  </Button>
                                                </Flex>
                                                <PromptReady_TextInput
                                                  enableAiGeneration={true}
                                                  promptBase={`Generate title describing a negative side effect for ${stakeHolder.stakeHolderName}${positiveSideEffectTitleBuffer ? ` around ${negativeSideEffectTitleBuffer}` : ''} based on the following proposal: ${bufferBoardDataInit?.proposalPrompt}`}
                                                  promptSamples="Increased Costs, Reduced Revenue, Customer Dissatisfaction etc."
                                                  inputValue={negativeSideEffectTitleBuffer}
                                                  setInputValue={setNegativeSideEffectTitleBuffer}
                                                  inputProps={{
                                                    placeholder: "Effect label",
                                                  }}
                                                />
                                                <PromptReady_TextArea
                                                  height="4rem"
                                                  enableAiGeneration={true}
                                                  promptBase={`Provide a 1-line reason as to why ${negativeSideEffectTitleBuffer} affects ${stakeHolder.stakeHolderName} negatively in context of the following proposal: ${bufferBoardDataInit?.proposalPrompt}`}
                                                  promptSamples={"Increased costs may lead to higher prices for goods and services, impacting the local community negatively\nIncreased costs can affect the project budget and timeline, creating challenges for the project team\nIncreased costs can reduce the return on investment for investors, impacting their financial interests"}
                                                  inputValue={negativeSideEffectReasonBuffer}
                                                  setInputValue={setNegativeSideEffectReasonBuffer}
                                                  textareaProps={{
                                                    placeholder: "Enter reasoning for effect",
                                                    minRows: 2,
                                                    maxRows: 12,
                                                    rows: 2,
                                                  }}
                                                />
                                              </Flex>
                                            </Accordion.Panel>
                                          </Accordion.Item>
                                        </Accordion>

                                        {
                                          isProcessing ? (<Flex
                                            direction="column"
                                            align="stretch"
                                            gap="sm"
                                            w="100%"
                                          >
                                            <Skeleton height={16} radius="xl" />
                                            <Skeleton height={16} radius="xl" />
                                            <Skeleton height={16} radius="xl" />
                                            <Skeleton height={16} radius="xl" />
                                          </Flex>
                                          ) : (
                                            <ImplicationList sideEffects={(bufferBoardDataInit?.sideEffects ?? [])
                                              .filter((sideEffect) => sideEffect.stakeHolderName === stakeHolder.stakeHolderName)
                                              .filter((sideEffect) => sideEffect.implication === "negative")
                                            }
                                              handleRemoveSideEffect={handleRemoveSideEffect}
                                            />
                                          )
                                        }
                                      </Flex>
                                    </Flex>

                                  </Flex>
                                </Accordion.Panel>
                              </Accordion.Item>

                            )
                          )
                        }
                      </Accordion>

                      <Accordion variant="filled" chevron={null} defaultValue="second">
                        <Accordion.Item key="first" value="first">
                          <Accordion.Control icon="+">
                            <Text c="gray.5" fz="sm">
                              Add Stakeholder
                            </Text>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Flex
                              direction="column"
                              align="stretch"
                              justify="flex-start"
                              gap="sm"
                              p="md"
                              h="13rem"
                            >
                              <Flex
                                direction="row"
                                align="center"
                                gap="sm"
                              >
                                <Button onClick={handleAddStakeholder}>
                                  Add New Stakeholder
                                </Button>
                              </Flex>
                              <PromptReady_TextInput
                                enableAiGeneration={false}
                                inputValue={newStakeholderName}
                                setInputValue={setNewStakeholderName}
                                inputProps={{
                                  placeholder: "Enter a name",
                                }}
                              />
                              <PromptReady_TextArea
                                height="4rem"
                                enableAiGeneration={true}
                                promptBase={`Give a 1-line description for ${newStakeholderName} as one of the stakeholders in the following proposal: ${bufferBoardDataInit?.proposalPrompt}`}
                                promptSamples={"Investors are key stakeholders in the project as they provide the necessary funding for the project. Their input is critical for decision-making and project success.\nThe local community is directly impacted by the project. Their input is important to address any concerns and ensure that the project benefits the community.\nThe project team is responsible for executing the project. Their input is essential for planning and implementation."}
                                inputValue={newStakeholderDescription}
                                setInputValue={setNewStakeholderDescription}
                                textareaProps={{
                                  placeholder: "Enter a description",
                                  minRows: 4,
                                  maxRows: 12,
                                  rows: 4,
                                }}
                              />
                            </Flex>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </>
                  )
                }

                <Flex>
                  <Button
                    onClick={() => handleStepChange(2)}
                    disabled={(bufferBoardDataInit?.stakeHolders ?? []).length === 0}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="third">
            {/* Title and Desc */}
            <Flex
              direction="column"
              align="start"
              justify="start"
            >
              <Title order={2}>
                {bufferBoardDataInit?.boardName}
              </Title>
            </Flex>

            {/* Effects List */}
            <Flex gap="md">
              <Flex
                direction="column"
                gap="sm"
                w="100%"
                mt="lg"
              >
                <Title order={4}>
                  Effects
                </Title>

                {
                  isProcessing && (bufferBoardDataInit?.sideEffects ?? []).length < 1 ? (
                    <Flex
                      direction="column"
                      align="stretch"
                      gap="sm"
                    >
                      <Skeleton height={16} radius="xl" />
                      <Skeleton height={16} radius="xl" />
                      <Skeleton height={16} radius="xl" />
                      <Skeleton height={16} radius="xl" />
                    </Flex>
                  ) : (
                    <Accordion multiple>
                      {
                        eachUniqueSideEffect.map(
                          (uqEff, idx) => (
                            <Accordion.Item key={idx} value={uqEff.sideEffectTitle}>
                              <Accordion.Control icon={"→"}>
                                {uqEff.sideEffectTitle}
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Flex
                                  key={idx}
                                  direction="row"
                                  justify="flex-start"
                                  gap="sm"
                                >
                                  {
                                    uqEff.sideEffectItemList.map(
                                      (sideEffect, idx) => (
                                        <HoverCard key={idx} width={280} height={50} shadow="md">
                                          <HoverCard.Target>
                                            <Card w="10rem" padding="md" bd="1px solid #DEDEDE" shadow="sm">
                                              <Flex
                                                direction="column"
                                                gap="sm"
                                              >
                                                <Pill c={sideEffect.implication === "positive" ? "green.9" : "orange.7"}>
                                                  {sideEffect.implication}
                                                </Pill>
                                                <Title order={5}>{sideEffect.stakeHolderName}</Title>
                                              </Flex>
                                            </Card>
                                          </HoverCard.Target>
                                          <HoverCard.Dropdown style={{ maxHeight: "10rem", overflowY: "auto" }}>
                                            <Flex
                                              direction="column"
                                              w="100%"
                                            >
                                              <Text size="md">
                                                {sideEffect.implicationReason}
                                              </Text>
                                            </Flex>
                                          </HoverCard.Dropdown>
                                        </HoverCard>
                                      )
                                    )
                                  }
                                </Flex>
                              </Accordion.Panel>
                            </Accordion.Item>
                          )
                        )
                      }
                    </Accordion>
                  )

                }
              </Flex>
            </Flex>

          </Tabs.Panel>
        </Tabs>
      </Flex>
    </>
  );
};

const Board_Edit = ({ boardData }) => {

  const [selectedStakeholders, setSelectedStakeholders] = useState([]);

  const onClick_Stakeholder = (stakeHolder) => {
    const stakeHolderIsSelected = selectedStakeholders.find(sh => sh.stakeHolderName === stakeHolder.stakeHolderName);
    if (stakeHolderIsSelected) {
      setSelectedStakeholders(selectedStakeholders.filter((sh) => sh.stakeHolderName !== stakeHolder.stakeHolderName));
    } else {
      setSelectedStakeholders([...selectedStakeholders, stakeHolder]);
    }
  };

  const [sideEffectsForSelectedStakeholders, setSideEffectsForSelectedStakeholders] = useState([]);

  useEffect(() => {
    const selectedStakeholderNames = (selectedStakeholders ?? []).map((sh) => sh.stakeHolderName);
    const sideEffectsForSelectedStakeholders = boardData?.sideEffects.filter((se) => selectedStakeholderNames.includes(se.stakeHolderName));
    setSideEffectsForSelectedStakeholders(sideEffectsForSelectedStakeholders ?? []);
  }, [boardData, selectedStakeholders]);

  return (
    <Flex
      direction="column"
      align="stretch"
      justify="start"
      gap="md"
    >

      <Title order={3}>{boardData?.boardName}</Title>
      <Text>{boardData?.boardDescription}</Text>
      <Flex h="420">
        {/* Graphic */}
        <Flex w="60%">
          <Canvas
            shadows
            style={{ width: "100%", height: "100%" }}
          >
            <color attach="background" args={["#DEDEDE"]} />
            <OrthographicCamera
              makeDefault
              position={[0, 10, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              zoom={10}
            />
            <Environment preset="sunset" environmentIntensity={0.3} />
            <SoftShadows size={52} samples={16} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={2.2}
              castShadow
              shadow-mapSize-height={2048}
              shadow-mapSize-width={2048}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-5, 5, 5]} intensity={0.7} />
            <directionalLight position={[1, 0.1, -5]} intensity={3} />
            <directionalLight position={[-1, 0.1, -5]} intensity={8} />
            {/* <axesHelper args={[10]} /> */}
            {
              getSeatingConfiguration(boardData?.stakeHolders)
                .map((seat, idx) => (
                  <Kuon3D_StakeHolder key={idx} position={seat.position} stakeHolder={seat.stakeHolder} />
                ))
            }
          </Canvas>
        </Flex>

        {/* Table */}
        <Flex
          w="40%"
          p="md"
        >
          <Tabs defaultValue="stakeholders">
            <Tabs.List>
              <Tabs.Tab value="stakeholders">
                Stakeholders
              </Tabs.Tab>
              <Tabs.Tab value="sideeffects">
                Effects
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="stakeholders">
              {(boardData?.stakeHolders ?? []).map((stakeHolder, idx) => (
                <Flex
                  key={idx}
                  direction="row"
                  align="center"
                  justify="space-between"
                  onClick={() => onClick_Stakeholder(stakeHolder)}
                >
                  {
                    (selectedStakeholders.find(sh => sh.stakeHolderName === stakeHolder.stakeHolderName))
                      ?
                      <Text style={{ fontWeight: "bold" }}>{stakeHolder.stakeHolderName}</Text>
                      :
                      <Text>{stakeHolder.stakeHolderName}</Text>
                  }
                </Flex>
              ))}
            </Tabs.Panel>

            <Tabs.Panel value="sideeffects">
              {(boardData?.sideEffects ?? []).map((sideEffect, idx) => (
                <Flex
                  key={idx}
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Text>{sideEffect.sideEffectTitle}</Text>
                </Flex>
              ))}
            </Tabs.Panel>
          </Tabs>
        </Flex>

      </Flex>

      <Flex
        gap="md"
      >
        {/* Selected Stakeholders */}
        <Flex
          direction="column"
          align="start"
          justify="flex-start"
          w="40%"
        >
          {(selectedStakeholders ?? []).map((selectedStakeholder, idx) => (
            <Flex
              key={idx}
              direction="column"
              align="start"
              justify="flex-start"
              style={{ margin: "1rem 0 1rem 0" }}
              onClick={() => onClick_Stakeholder(selectedStakeholder)}
            >
              <Text>{selectedStakeholder.stakeHolderName}</Text>
              <Text>{selectedStakeholder.description}</Text>
            </Flex>
          ))}
        </Flex>

        {/* Side Effects for Selected Stakeholders */}
        <Flex
          direction="column"
          align="start"
          justify="flex-start"
          w="60%"
        >
          {(sideEffectsForSelectedStakeholders ?? []).map((sideEffect, idx) => (
            <Flex
              key={idx}
              direction="row"
              align="center"
              justify="flex-start"
            >
              <Text>{sideEffect.sideEffectTitle}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

const Board = () => {

  const { boardId } = useParams();

  const [boardData, setBoardData] = useState();

  const storedBoards = useStoredBoards();

  // Create or Navigate Board
  useEffect(() => {

    if (!boardId) return;

    const foundBoard = storedBoards.find((board) => board.boardId === boardId);
    if (foundBoard) {
      setBoardData(foundBoard);
    }

  }, [boardId, storedBoards]);

  return (
    // Board Main Pane
    <Flex
      direction="column"
      align="stretch"
      justify="start"
      gap="md"
    >

      {
        boardData?.hasBeenInitialized ? (
          <Board_Edit boardData={boardData} />
        ) : (
          <Board_Init boardId={boardId} setBoardData={setBoardData} />
        )
      }
    </Flex>
  );
};

export default Board;