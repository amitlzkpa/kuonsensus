import React, { useEffect, useRef, useState } from 'react';
import { Accordion, Button, Chip, Divider, Flex, JsonInput, Loader, Tabs, Text, Title } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import Typed from "typed.js";
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
import { PromptReady_TextArea } from "../components/PromptReady_TextArea";
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

const conversationHistoryTemplate = {
  conversationId: "",
  conversationMessages: [],
  conversationStakeholders: [],
  conversationParticipants: [],
  currConversationOutline: [],
};

const ImplicationList = ({ sideEffects }) => {
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
              key={idx}
              direction="row"
              align="center"
              justify="start"
              gap="sm"
            >
              <Chip color={sideEffect.implication === "positive" ? "green" : "orange"}>
                {sideEffect.implication}
              </Chip>
              <Text>{sideEffect.sideEffectTitle}</Text>
            </Flex>
          )
        )
      }
    </Flex>
  );
}

const Board_Init = ({ setBoardData }) => {
  const { boardId } = useParams();

  const [userInitText, setUserInitText] = useState("");
  const [outText, setOutText] = useState("{}");
  const [isProcessing, setIsProcessing] = useState(false);

  const llmRef = React.useRef();

  const [bufferBoardDataInit, setBufferBoardDataInit] = useState();
  const [eachUniqueSideEffect, setEachUniqueSideEffect] = useState([]);

  useEffect(() => {
    if (llmRef.current) return;

    (async () => {
      llmRef.current = await ai.languageModel.create();
    })();
  }, []);

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


  const titleEl = useRef(null);
  const descriptionEl = useRef(null);

  const handleSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {

      const creationBuffer = {};

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

      setOutText(JSON.stringify(creationBuffer, null, 2));
    } catch (error) {
      console.error(error?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeBoardSetup = async () => {
    const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
    const boardIdx = storedBoards.findIndex((board) => board.boardId === boardId);
    const foundBoard = storedBoards[boardIdx] ?? {};
    bufferBoardDataInit.boardId = boardId;
    bufferBoardDataInit.proposalPrompt = userInitText;
    bufferBoardDataInit.hasBeenInitialized = true;
    const consolidatedBoardData = { ...foundBoard, ...bufferBoardDataInit };
    const updStoredBoards = [...storedBoards];
    updStoredBoards[boardIdx] = consolidatedBoardData;
    localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
    setBoardData(consolidatedBoardData);
  };

  const handleReset = () => {
    setUserInitText("");
    setOutText("{}");
    setBufferBoardDataInit();
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      justify="start"
      gap="md"
    >
      <Flex
        direction="row"
        align="center"
        justify="space-between"
      >
        <Title order={3}>Set Up Your Board</Title>

        <Button
          onClick={handleFinalizeBoardSetup}
          disabled={isProcessing}
        >
          Done
        </Button>
      </Flex>

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
            Enter the text of your proposal below.
          </Text>
          <Text>
            You can start with a simple outline and use the magic button to polish it.
          </Text>
        </Flex>

        <PromptReady_TextArea
          height="10rem"
          textareaProps={{
            onChange: (e) => setUserInitText(e.currentTarget.value),
            value: userInitText,
            placeholder: sampleStartingPrompt,
            minRows: 4,
            maxRows: 12,
            rows: 7,
          }}
        />
      </Flex>

      <Flex
        gap="sm"
        justify="flex-start"
        align="center"
        direction="row"
      >
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          Submit
        </Button>
        <Button
          onClick={handleReset}
          disabled={isProcessing}
        >
          Reset
        </Button>
        {isProcessing ? (
          <Loader type="dots" />
        ) : (
          <></>
        )}
      </Flex>

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

      <Divider />

      <Flex
        direction="column"
        align="start"
        justify="start"
      >
        <Text>
          Title:{" "}
          <span contentEditable ref={titleEl} />
        </Text>
        <Text>
          Description:{" "}
          <span contentEditable ref={descriptionEl} />
        </Text>
      </Flex>

      <Flex gap="md">
        <Flex
          direction="column"
          gap="sm"
          w="100%"
        >

          <Accordion>
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
                        <Text>{stakeHolder.description}</Text>

                        <Flex
                          direction="row"
                          gap="sm"
                          p="md"
                          w="100%"
                        >
                          {/* Positives */}
                          <Flex w="50%">
                            <ImplicationList sideEffects={(bufferBoardDataInit?.sideEffects ?? [])
                              .filter((sideEffect) => sideEffect.stakeHolderName === stakeHolder.stakeHolderName)
                              .filter((sideEffect) => sideEffect.implication === "positive")
                            } />
                          </Flex>

                          {/* Negatives */}
                          <Flex w="50%">
                            <ImplicationList sideEffects={(bufferBoardDataInit?.sideEffects ?? [])
                              .filter((sideEffect) => sideEffect.stakeHolderName === stakeHolder.stakeHolderName)
                              .filter((sideEffect) => sideEffect.implication === "negative")
                            } />
                          </Flex>
                        </Flex>

                      </Flex>
                    </Accordion.Panel>
                  </Accordion.Item>

                )
              )
            }
          </Accordion>
        </Flex>
      </Flex>

      <JsonInput
        value={outText}
        autosize
        minRows={4}
        maxRows={12}
      />
    </Flex>
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
      <Flex
        h="420"
      >
        {/* Graphic */}
        <Flex
          w="60%"
        >
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


  const navigate = useNavigate();
  const { boardId } = useParams();

  const [boardData, setBoardData] = useState();

  // Create or Navigate Board
  useEffect(() => {

    if (!boardId) return;

    const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
    const foundBoard = storedBoards.find((board) => board.boardId === boardId);
    if (foundBoard) {
      setBoardData(foundBoard);
    }

  }, [boardId]);

  const controls = useRef();

  return (
    // Board Main Pane
    <Flex
      direction="column"
      align="stretch"
      justify="start"
    >
      {
        boardData?.hasBeenInitialized
          ?
          (<Board_Edit boardData={boardData} />)
          :
          (<Board_Init setBoardData={setBoardData} />)
      }
    </Flex>
  );
};

export default Board;