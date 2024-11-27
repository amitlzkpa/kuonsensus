import React, { useEffect, useState } from "react";
import * as ReactDOMServer from 'react-dom/server';
import { z } from "zod";
import { Button, Center, Container, Flex, JsonInput, Space, Textarea } from '@mantine/core';
import { FaBeer } from "react-icons/fa";
import { animated, useIsomorphicLayoutEffect, useSpring } from "@react-spring/web";

export const MorphingSvg = () => {

  const [springs, api] = useSpring(() => ({
    from: { x: 0 }
  }));

  useIsomorphicLayoutEffect(() => {
    api.start({
      from: {
        x: 0,
      },
      to: {
        x: 100,
      },
    });
  }, []);

  const handleClick = () => {

    const r = FaBeer().props.children[0].props.d;
    console.log(r);
  };


  return (
    <>

      <Center>
        <animated.div
          style={{
            width: 80,
            height: 80,
            background: '#ff6d6d',
            borderRadius: 8,
            ...springs,
          }}
        />
      </Center>

      <Center h="100" onClick={handleClick}>
        <FaBeer />
      </Center>
    </>
  )
};

export default MorphingSvg;
