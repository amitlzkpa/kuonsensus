import React, { useEffect, useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";

import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";

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


  return (
    <div>
      <Stack>
        <Text>{boardId}</Text>
        <Text>{boardData?.boardName}</Text>
        <Text>{boardData?.currStakeholders.length}</Text>
      </Stack>
    </div>
  );
};

export default Board;