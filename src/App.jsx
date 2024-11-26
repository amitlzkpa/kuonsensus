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
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      margin: 0,
      padding: 12,
    }}>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
