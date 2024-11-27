import React, { useState } from "react";
import { Button, Center, Stack } from '@mantine/core';
import { FaCircle as Icon1, FaSquare as Icon2 } from "react-icons/fa";
import { animated, useIsomorphicLayoutEffect, useSpring } from "@react-spring/web";

export const MorphingSvg = () => {

  const [active, setActive] = useState(false);
  const { x } = useSpring({ config: { duration: 800 }, x: active ? 1 : 0 });

  const [springs, api] = useSpring(() => ({
    from: { x: 0 }
  }));

  const [outputs, setOutputs] = useState([]);

  useIsomorphicLayoutEffect(() => {
    api.start({
      from: {
        x: 0,
      },
      to: {
        x: 100,
      },
    });

    const svg1 = Icon1().props.children[0].props.d;
    const svg2 = Icon2().props.children[0].props.d;

    setOutputs([svg1, svg2]);

  }, []);

  const handleClick = () => {
    setActive(!active);
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
          <svg
            viewBox="0 0 1000 1000"
            onClick={() => setActive(!active)}
          >
            <animated.path
              d={x.to({
                range: [0, 1],
                output: outputs,
              })}
            />
          </svg>
        </Center>

        <Button onClick={handleClick}>
          Run
        </Button>
      </Stack>
    </>
  )
};

export default MorphingSvg;
