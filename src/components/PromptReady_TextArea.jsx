import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, JsonInput, Tabs, Text, Textarea, Title, Space } from '@mantine/core';

export const PromptReady_TextArea = (props) => {
  return (
    <div style={{ position: "relative", minHeight: "120px", height: props.height ?? "10rem", resize: "vertical" }}>
      <Textarea
        style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        {...props.textareaProps}
      />
      <div style={{ position: "absolute", top: 0, right: 0 }}>
        <Button>Polish</Button>
      </div>
    </div>
  );
};