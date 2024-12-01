import '@mantine/core/styles.css';
import './index.css';
import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import {
  AppShell,
  Button,
  Burger,
  Center,
  Container,
  Flex,
  Group,
  HoverCard,
  MantineProvider,
  Modal,
  NavLink,
  Text,
  Title,
  createTheme,
  rem,
} from '@mantine/core';
import { FaInfoCircle, FaTrashAlt } from 'react-icons/fa';
import { useDisclosure } from '@mantine/hooks';

import * as kuonKeys from "./config/kuonKeys";
import * as localStorage from "./utils/localStorageHelpers";

import { useStoredBoards, triggerStorageUpdate } from './hooks/localStorage';
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

  const theme = createTheme({
    fontFamily: 'Nunito, sans-serif',
    fontFamilyMonospace: 'Monaco, Courier, monospace',
    headings: {
      fontWeight: '800',
      fontFamily: 'Bitter',
      sizes: {
        h1: { fontSize: rem(38), lineHeight: '0.9' },
        h2: { fontSize: rem(34), lineHeight: '0.9' },
        h3: { fontSize: rem(30), lineHeight: '0.9' },
        h4: { fontSize: rem(26), lineHeight: '0.9' },
        h5: { fontSize: rem(22), lineHeight: '0.9' },
        h6: { fontSize: rem(18), lineHeight: '0.9' },
      },
    },
    fontSizes: {
      xs: rem(16),
      sm: rem(17),
      md: rem(20),
      lg: rem(22),
      xl: rem(26),
    },
    lineHeights: {
      xs: '1.6',
      sm: '1.65',
      md: '1.75',
      lg: '1.8',
      xl: '1.85',
    },
    defaultRadius: 'xl',
    primaryColor: 'kuonsensus-maroon',
    colors: {
      'kuonsensus-maroon': [
        "#ffeaec",
        "#fcd4d7",
        "#f4a7ac",
        "#ec777e",
        "#e64f57",
        "#e3353f",
        "#e22732",
        "#c91a25",
        "#b41220",
        "#9e0419"
      ],
    },

  });

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [storedBoards_localStorage, setStoredBoards_localStorage] = useState([]);

  const storedBoards = useStoredBoards();

  useEffect(() => {
    if (!storedBoards) {
      localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, []);
      triggerStorageUpdate();
    }
    setStoredBoards_localStorage(storedBoards);
  }, [storedBoards]);

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

    const updStoredBoards = [...storedBoards, newBoard];
    localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
    triggerStorageUpdate();
    router.navigate(`/board/${newBoardId}`);
  };

  const [boardToDelete, setBoardToDelete] = useState({});
  const [opened, { open, close }] = useDisclosure(false);

  const handleBoardDelete = () => {
    const updStoredBoards = storedBoards.filter((board) => board.boardId !== boardToDelete.boardId);
    localStorage.setItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR, updStoredBoards);
    triggerStorageUpdate();
    close();
  }

  return (
    <MantineProvider theme={theme}>
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
              pr={14}
              h={48}
              styles={{
                // root: { color: "black", borderColor: "black" },
                section: { marginLeft: 22 }
              }}
            >
              Kuonsensus
            </Button>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar pl="md" py="md">
          <Button
            radius="xl"
            size="md"
            variant="outline"
            m="md"
            h={88}
            mr="2rem"
            href="/board/_new"
            onClick={handleCreateNewBoard}
          >
            Create New Board
          </Button>

          {[storedBoards_localStorage ?? []].length > 0
            ?
            (
              <Flex direction={"column"} gap={"md"} pr="sm" style={{ overflowY: "auto" }}>
                {storedBoards_localStorage.map((board) => (
                  <Flex
                    key={board.boardId}
                    align="center"
                    justify="space-between"
                    gap="sm"
                  >
                    <HoverCard width={280} height={50} shadow="md">
                      <HoverCard.Target>
                        <div>
                          <FaInfoCircle size="0.9rem" color="#ababab" />
                        </div>
                      </HoverCard.Target>
                      <HoverCard.Dropdown style={{ maxHeight: "10rem", overflowY: "auto" }}>
                        <Flex
                          direction="column"
                          w="100%"
                        >
                          <Text size="sm" c="gray.7" style={{ fontStyle: "italic" }}>{board.boardId}</Text>
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
          <Container size="60rem">
            <RouterProvider router={router} />
          </Container>
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
            <Button onClick={close} variant="outline">Cancel</Button>
            <Button onClick={handleBoardDelete}>Delete</Button>
          </Flex>
        </Flex>
      </Modal>
    </MantineProvider>
  );
}

export default App;