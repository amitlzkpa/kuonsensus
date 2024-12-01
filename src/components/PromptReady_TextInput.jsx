import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, Input, TextInput } from '@mantine/core';

export const PromptReady_TextInput = (props) => {
  return (
    <div style={{ position: "relative", height: props.height ?? "2.25rem", resize: "vertical" }}>
      <Input
        style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        {...props.inputProps}
      />
      <div style={{ position: "absolute", bottom: 0, right: 0 }}>
        <Button>P</Button>
      </div>
    </div>
  );
}

export default PromptReady_TextInput;