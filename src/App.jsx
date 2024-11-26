import '@mantine/core/styles.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { MantineProvider } from '@mantine/core';

import Dev from "./views/Dev";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Dev />,
  },
]);

function App() {
  return (
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>
  )
}

export default App
