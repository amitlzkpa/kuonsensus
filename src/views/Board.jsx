import React, { useEffect, useState } from 'react';
import { Center, Text } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";

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

  useEffect(() => {

    if (!boardId) return;

    const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];

    if (boardId === "_new") {
      const newBoardId = `brd_${Math.floor(Math.random() * 1000)}`;
      const newBoard = { ...boardTemplate, boardId: newBoardId };
      localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, [...storedBoards, newBoard]);
      navigate(`/board/${newBoardId}`);
      return;
    }

    const foundBoard = storedBoards.find((board) => board.boardId === boardId);
    if (foundBoard) {
      setBoardData(foundBoard);
    }

  }, [boardId, navigate]);


  return (
    <div>
      <Center>
        <Text>{boardId}</Text>
        <Text>{boardData?.boardName}</Text>

      </Center>
    </div>
  );
};

export default Board;