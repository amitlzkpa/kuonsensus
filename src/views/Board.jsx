import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, JsonInput, Tabs, Text, Textarea, Title, Space } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Environment, SoftShadows } from '@react-three/drei';

import { extractStakeholders, extractSideEffects } from "../utils/extractionHelpers";
import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";

// import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";
// import sampleSideEffects from "../assets/samples/a1_sideEffects.json";


const sampleStartingPrompt = `
In order to address environmental concerns from new construction,
propose requiring developers to include measures such as
- tree planting
- renewable energy systems
- contributions to local conservation funds
`;

const boardTemplate = {
  boardId: "",
  boardName: "",
  boardDescription: "",
  proposalPrompt: "",
  proposalDatabank: [],
  currStakeholders: [],
  currSideEffects: [],
  storedConversations: [],
  hasBeenInitialized: false,
};

const conversationHistoryTemplate = {
  conversationId: "",
  conversationMessages: [],
  conversationStakeholders: [],
  conversationParticipants: [],
  currConversationOutline: [],
};

const Board_Init = ({ boardData }) => {
  const [inText, setInText] = useState("");
  const [outText, setOutText] = useState("{}");
  const [isProcessing, setIsProcessing] = useState(false);

  const llmRef = React.useRef();

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
      const stakeHolders = await extractStakeholders(inText, llmRef);
      // const stakeHolders = sampleStakeHolders;

      const allSideEffects = [];
      for (const stakeHolder of stakeHolders) {
        let sideEffects = await extractSideEffects(inText, stakeHolder, llmRef);
        allSideEffects.push(sideEffects);
      }

      const json = { allSideEffects, stakeHolders };

      console.log(json);

      setOutText(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(error?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setInText("");
    setOutText("{}");
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      justify="start"
    >
      <Title order={3}>{boardData?.boardId}</Title>

      <Textarea
        onChange={(e) => setInText(e.currentTarget.value)}
        value={inText}
        placeholder="Enter text here"
        autosize
        minRows={4}
        maxRows={12}
      />

      <Space h="md" />

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

      <Space h="md" />

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
    const selectedStakeholderNames = selectedStakeholders.map((sh) => sh.stakeholderName);
    const sideEffectsForSelectedStakeholders = boardData?.currSideEffects.filter((se) => selectedStakeholderNames.includes(se.stakeholderName));
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
              {boardData?.currStakeholders.map((stakeholder) => (
                <Flex
                  key={stakeholder.stakeholderName}
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
              {boardData?.currSideEffects.map((sideEffect) => (
                <Flex
                  key={sideEffect.sideEffectTitle}
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
          {selectedStakeholders.map((selectedStakeholder) => (
            <Flex
              key={selectedStakeholder.stakeholderName}
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
          {sideEffectsForSelectedStakeholders.map((sideEffect) => (
            <Flex
              key={sideEffect.sideEffectTitle}
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


    if (boardId === "_new") {
      const newBoardId = `brd_${Math.floor(Math.random() * 100000)}`;
      const newBoard = { ...boardTemplate, boardId: newBoardId };
      // newBoard.currStakeholders = sampleStakeHolders;
      // newBoard.currSideEffects = sampleSideEffects;
      const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
      const updStoredBoards = [...storedBoards, newBoard];
      localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
      navigate(`/board/${newBoardId}`);
    } else if (boardId !== "_new" && !boardData) {
      const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
      const foundBoard = storedBoards.find((board) => board.boardId === boardId);
      if (foundBoard) {
        setBoardData(foundBoard);
      }
    }

  }, [boardId, boardData, navigate]);

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
          (<Board_Init boardData={boardData} />)
      }
    </Flex>
  );
};

export default Board;