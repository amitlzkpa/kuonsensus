import '@mantine/core/styles.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Anchor, AppShell, Burger, Group, MantineProvider, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import Board from "./views/Board";
import Dev from "./views/Dev";
import Landing from "./views/Landing";

export function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/board",
      element: <Board />,
    },
    {
      path: "/dev",
      element: <Dev />,
    },
  ]);

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
            Kuonsensus
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <Anchor href="/">Landing</Anchor>
          <Anchor href="/board">Board</Anchor>
          <Anchor href="/dev">Dev</Anchor>
        </AppShell.Navbar>
        <AppShell.Main>
          <RouterProvider router={router} />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;