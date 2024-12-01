import { useEffect, useState } from "react";

import * as kuonKeys from "../config/kuonKeys";
import * as localStorage from "../utils/localStorageHelpers";

function getStoredBoards() {
  return localStorage.getItem(kuonKeys.KUON_KEY_STORED_BOARDS_LCLSTR);
}

export let triggerStorageUpdate;

export function useStoredBoards() {
  const [storedBoards, setStoredBoards] = useState(getStoredBoards());

  triggerStorageUpdate = () => {
    console.log('foo');
    setStoredBoards(getStoredBoards());
  };

  useEffect(() => {
    function handleChangeStorage() {
      setStoredBoards(getStoredBoards());
    }

    window.addEventListener('storage', handleChangeStorage);
    return () => window.removeEventListener('storage', handleChangeStorage);
  }, []);

  return storedBoards;
}