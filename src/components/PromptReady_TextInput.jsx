import React, { useEffect, useRef, useState } from 'react';
import { useDebounce } from "@uidotdev/usehooks";
import { FaPen } from 'react-icons/fa';
import { Button, Flex, Input, TextInput } from '@mantine/core';

export const PromptReady_TextInput = (props) => {

  const [inputValue, setInputValue] = useState(props.inputProps.value);
  const debouncedInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (props?.onChange_debounced) {
      props?.onChange_debounced(debouncedInputValue);
    }
  }, [debouncedInputValue, props]);

  return (
    <div style={{ position: "relative", height: props.height ?? "2.25rem", resize: "vertical" }}>
      <Input
        style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        {...props.inputProps}
      />
      <div style={{ position: "absolute", top: "15%", right: 15, cursor: "pointer" }}>
        <FaPen size="0.6rem" color="primary" />
      </div>
    </div>
  );
}

export default PromptReady_TextInput;