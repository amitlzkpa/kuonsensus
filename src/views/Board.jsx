import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, JsonInput, Tabs, Text, Title } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Environment, SoftShadows } from '@react-three/drei';

import { extractStakeholders, extractSideEffects } from "../utils/extractionHelpers";
import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";
import { PromptReady_TextArea } from "../components/PromptReady_TextArea";

// import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";
// import sampleSideEffects from "../assets/samples/a1_sideEffects.json";


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

const Board_Init = ({ setBoardData }) => {
  const { boardId } = useParams();

  const [userInitText, setUserInitText] = useState("");
  const [outText, setOutText] = useState("{}");
  const [isProcessing, setIsProcessing] = useState(false);

  const llmRef = React.useRef();

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
    const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
    const foundBoard = storedBoards.find((board) => board.boardId === boardId);
    if (foundBoard) {
      bufferBoardDataInit.boardId = boardId;
      bufferBoardDataInit.proposalPrompt = userInitText;
      bufferBoardDataInit.hasBeenInitialized = true;
      bufferBoardDataInit.creationDate = new Date().toISOString();
      const updatedBoardData = { ...foundBoard, ...bufferBoardDataInit };
      const updStoredBoards = [...storedBoards, updatedBoardData];
      localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
      setBoardData(updatedBoardData);
    }

  };

  useEffect(() => {
    if (llmRef.current) return;

    (async () => {
      llmRef.current = await ai.languageModel.create();
    })();
  }, []);

  const handleSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const stakeHolders = await extractStakeholders(userInitText, llmRef);
      // const stakeHolders = sampleStakeHolders;

      setBufferBoardDataInit({
        ...bufferBoardDataInit,
        stakeholders: stakeHolders,
      });

      const allSideEffects = [];
      for (const stakeHolder of stakeHolders) {
        const stakeholderSideEffects = await extractSideEffects(userInitText, stakeHolder, llmRef);
        allSideEffects.push(stakeholderSideEffects);

        setBufferBoardDataInit({
          ...bufferBoardDataInit,
          stakeholders: stakeHolders,
        });
      }

      const sideEffects = allSideEffects.flat();
      const json = { sideEffects, stakeHolders };

      console.log(json);

      setBufferBoardDataInit(json);

      setOutText(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(error?.message);
    } finally {
      setIsProcessing(false);
    }
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
          <Flex>
            ...
          </Flex>
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

      <Flex>
        <Flex
          direction="column"
          gap="sm"
        >

          {
            (bufferBoardDataInit?.stakeHolders ?? []).map(
              (stakeholder, idx) => (
                <Flex
                  key={idx}
                  direction="column"
                  align="start"
                  justify="flex-start"
                  style={{ margin: "1rem 0 1rem 0" }}
                >
                  <Text>{stakeholder.stakeholderName}</Text>
                  <Text>{stakeholder.description}</Text>

                  <Flex
                    direction="column"
                    gap="sm"
                  >
                    {
                      (bufferBoardDataInit?.sideEffects ?? [])
                        .filter((sideEffect) => sideEffect.stakeholderName === stakeholder.stakeholderName)
                        .map(
                          (sideEffect, idx) => (
                            <Flex
                              key={idx}
                              direction="column"
                              align="start"
                              justify="start"
                            >
                              <Text>&nbsp;&nbsp;{sideEffect.implication} - {sideEffect.sideEffectTitle}</Text>
                            </Flex>
                          )
                        )
                    }
                  </Flex>

                </Flex>
              )
            )
          }

        </Flex>

        <Flex
          direction="column"
          gap="sm"
        >

          {
            (eachUniqueSideEffect ?? [])
              .sort((a, b) => b.sideEffectItemList.length - a.sideEffectItemList.length)
              .map(
                (sideEffect, idx) => (
                  <Flex
                    key={idx}
                    direction="column"
                    align="start"
                    justify="flex-start"
                    style={{ margin: "1rem 0 1rem 0" }}
                  >
                    <Text>{sideEffect?.sideEffectTitle}</Text>
                    <Text>{(sideEffect?.sideEffectItemList ?? []).length}</Text>
                  </Flex>
                )
              )
          }

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

  const onClick_Stakeholder = (stakeholder) => {
    const stakeholderIsSelected = selectedStakeholders.find(sh => sh.stakeholderName === stakeholder.stakeholderName);
    if (stakeholderIsSelected) {
      setSelectedStakeholders(selectedStakeholders.filter((sh) => sh.stakeholderName !== stakeholder.stakeholderName));
    } else {
      setSelectedStakeholders([...selectedStakeholders, stakeholder]);
    }
  };

  const [sideEffectsForSelectedStakeholders, setSideEffectsForSelectedStakeholders] = useState([]);

  useEffect(() => {
    const selectedStakeholderNames = (selectedStakeholders ?? []).map((sh) => sh.stakeholderName);
    const sideEffectsForSelectedStakeholders = boardData?.sideEffects.filter((se) => selectedStakeholderNames.includes(se.stakeholderName));
    setSideEffectsForSelectedStakeholders(sideEffectsForSelectedStakeholders ?? []);
  }, [boardData, selectedStakeholders]);

  return (
    <Flex>

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
            <color attach="background" args={["#FF0000"]} />
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
            <mesh position={[0, 0, 0]} receiveShadow>
              <cylinderGeometry attach="geometry" args={[4, 4, 1, 128]} />
              <meshStandardMaterial attach="material" color={"#DEDEDE"} />
            </mesh>
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
              {(boardData?.stakeHolders ?? []).map((stakeholder, idx) => (
                <Flex
                  key={idx}
                  direction="row"
                  align="center"
                  justify="space-between"
                  onClick={() => onClick_Stakeholder(stakeholder)}
                >
                  {
                    (selectedStakeholders.find(sh => sh.stakeholderName === stakeholder.stakeholderName))
                      ?
                      <Text style={{ fontWeight: "bold" }}>{stakeholder.stakeholderName}</Text>
                      :
                      <Text>{stakeholder.stakeholderName}</Text>
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

      <Flex>
        <Flex
          direction="column"
          align="start"
          justify="flex-start"
          style={{ flexGrow: 1 }}
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
              <Text>{selectedStakeholder.stakeholderName}</Text>
              <Text>{selectedStakeholder.description}</Text>
            </Flex>
          ))}
        </Flex>

        <Flex
          direction="column"
          align="start"
          justify="flex-start"
          style={{ flexGrow: 1 }}
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