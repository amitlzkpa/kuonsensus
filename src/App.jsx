import '@mantine/core/styles.css';
import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import {
  AppShell,
  Button,
  Burger,
  Center,
  Flex,
  Group,
  HoverCard,
  MantineProvider,
  Modal,
  NavLink,
  Text,
  Title
} from '@mantine/core';
import { FaInfoCircle, FaTrashAlt } from 'react-icons/fa';
import { useDisclosure } from '@mantine/hooks';

import * as kuonKeys from "./config/kuonKeys";
import * as localStorage from "./utils/localStorageHelpers";

import Board from "./views/Board";
import Dev from "./views/Dev";
import Landing from "./views/Landing";

const boardTemplate = {
  boardId: "",
  boardName: "",
  boardDescription: "",
  proposalPrompt: "",
  proposalDatabank: [],
  storedConversations: [],
  hasBeenInitialized: false,
  creationDate: "",
};

export function App() {

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [storedBoards_localStorage, setStoredBoards_localStorage] = useState([]);

  useEffect(() => {
    let storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR);
    if (!storedBoards) {
      localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, []);
      storedBoards = [];
    }
    setStoredBoards_localStorage(storedBoards);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/board/:boardId",
      element: <Board />,
    },
    {
      path: "/dev",
      element: <Dev />,
    },
  ]);

  const handleCreateNewBoard = () => {
    const newBoardId = `brd_${Math.floor(Math.random() * 100000)}`;
    const newBoard = {
      ...boardTemplate,
      boardId: newBoardId,
      creationDate: new Date().toISOString()
    };

    const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
    const updStoredBoards = [...storedBoards, newBoard];
    localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
    router.navigate(`/board/${newBoardId}`);
  };

  const [boardToDelete, setBoardToDelete] = useState({});
  const [opened, { open, close }] = useDisclosure(false);

  const handleBoardDelete = () => {
    const storedBoards = localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR) ?? [];
    const updStoredBoards = storedBoards.filter((board) => board.boardId !== boardToDelete.boardId);
    localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
    close();
  }

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Button
              component="a"
              href="/"
              radius="xl"
              size="md"
              variant="outline"
              pr={14}
              h={48}
              styles={{
                root: { color: "black", borderColor: "black" },
                section: { marginLeft: 22 }
              }}
            >
              Kuonsensus
            </Button>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Button
            m="md"
            href="/board/_new"
            onClick={handleCreateNewBoard}
          >
            Create New Board
          </Button>

          {[storedBoards_localStorage ?? []].length > 0
            ?
            (
              <Flex direction={"column"} gap={"md"}>
                {storedBoards_localStorage.map((board) => (
                  <Flex
                    key={board.boardId}
                    align="center"
                    justify="space-between"
                    gap="sm"
                  >
                    <HoverCard width={280} shadow="md">
                      <HoverCard.Target>
                        <div>
                          <FaInfoCircle size="0.9rem" color="#ababab" />
                        </div>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Flex
                          direction="column"
                          gap="sm"
                          w="100%"
                        >
                          <Text size="sm" c="gray.7" style={{ fontStyle: "italic" }}>{boardToDelete.boardId}</Text>
                          <Text size="md">
                            {board.boardDescription}
                          </Text>
                        </Flex>
                      </HoverCard.Dropdown>
                    </HoverCard>
                    <NavLink
                      href={`/board/${board.boardId}`}
                      style={{
                        fontStyle: board.boardName ? "" : "italic",
                        color: board.boardName ? "" : "gray",
                      }}
                      label={board.boardName ? board.boardName : "Untitled Board"}
                    />
                    <FaTrashAlt
                      size="0.7rem"
                      color="#ababab"
                      onClick={() => { setBoardToDelete(board); open(); }}
                      style={{ cursor: "pointer" }}
                    />
                  </Flex>
                ))}
              </Flex>
            )
            :
            (
              <Center>
                No boards found
              </Center>
            )
          }

        </AppShell.Navbar>

        <AppShell.Main>
          <RouterProvider router={router} />
        </AppShell.Main>

      </AppShell>

      <Modal
        title="Are you sure you want to delete this board?"
        centered
        opened={opened}
        onClose={close}
      >
        <Flex
          direction="column"
          gap="md"
          h="24rem"
          style={{ zIndex: 1000 }}
        >
          <Flex
            direction="column"
            style={{ flexGrow: 1 }}
          >
            <Text size="sm" c="gray.7" style={{ fontStyle: "italic" }}>{boardToDelete.boardId}</Text>
            <Title order={3}>{boardToDelete.boardName}</Title>
            <Text size="sm">{boardToDelete.boardDescription}</Text>
          </Flex>

          <Flex w="100%" justify="flex-end" gap="md">
            <Button onClick={close}>Cancel</Button>
            <Button color="red.4" onClick={handleBoardDelete}>Delete</Button>
          </Flex>
        </Flex>
      </Modal>
    </MantineProvider>
  );
}

export default App;