import React from "react";
import { Button, Center, Stack } from '@mantine/core';
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
      <Stack>
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

        <Center h="100">
          <FaBeer />
        </Center>

        <Button onClick={handleClick}>
          Run
        </Button>
      </Stack>
    </>
  )
};

export default MorphingSvg;
