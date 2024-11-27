import React from 'react';
import { Text } from '@mantine/core';

const boardTemplate = {
  boardId: "brd_0001",
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
  return (
    <div>
      <Text>Hello World</Text>
    </div>
  );
};

export default Board;