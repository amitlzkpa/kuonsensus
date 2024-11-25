import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Dev from "./views/Dev";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Dev />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
