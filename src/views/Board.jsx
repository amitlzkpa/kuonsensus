import React, { useEffect, useRef, useState } from 'react';
import { Flex, Tabs, Text, Title } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, SoftShadows } from '@react-three/drei';
// import { Avatar } from "./Avatar";

import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";

import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";
import sampleSideEffects from "../assets/samples/a1_sideEffects.json";

const boardTemplate = {
  boardId: "brd_temp",
  boardName: "Sample Board",
  boardDescription: "This is a sample board",
  proposalPrompt: "",
  proposalDatabank: [],
  currStakeholders: [],
  currSideEffects: [],
  storedConversations: [],
};

const conversationHistoryTemplate = {
  conversationId: "",
  conversationMessages: [],
  conversationStakeholders: [],
  conversationParticipants: [],
  currConversationOutline: [],
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
      newBoard.currStakeholders = sampleStakeHolders;
      newBoard.currSideEffects = sampleSideEffects;
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
            camera={{
              position: [1, 3, 2],
              fov: 45
            }}
            shadows
          >
            <color attach="background" args={["black"]} />
            <CameraControls
              ref={controls}
              minDistance={3.5}
              maxDistance={4}
              minPolarAngle={Math.PI * 0.35}
              maxPolarAngle={Math.PI * 0.54}
              minAzimuthAngle={-Math.PI * 0.3}
              maxAzimuthAngle={Math.PI * 0.2}
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
            <directionalLight position={[1, 0.1, -5]} intensity={3} color={"red"} />
            <directionalLight position={[-1, 0.1, -5]} intensity={8} color={"blue"} />
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
                >
                  <Text>{stakeholder.stakeholderName}</Text>
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
    </Flex>
  );
};

export default Board;