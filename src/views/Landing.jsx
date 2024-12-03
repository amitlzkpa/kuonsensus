import React, { useEffect, useRef } from 'react';
import { Center, Container, Flex, Stack, Title, Text, Button, Divider } from '@mantine/core';

import { FaUsers, FaBalanceScale, FaDiceD20, FaRegHandshake, FaTasks } from 'react-icons/fa';
import { MdOutlineCompareArrows, MdInsights, MdOutlineEditNote } from 'react-icons/md';
import { AiOutlineRobot } from 'react-icons/ai';
import { BiLayer } from 'react-icons/bi';
import { PiEqualizerBold } from "react-icons/pi";

import Typed from "typed.js";

const Landing = () => {

  const adverbsSpanRef = useRef();

  useEffect(() => {
    const t = new Typed(adverbsSpanRef.current, {
      strings: ["effectively^1400", "thoughtfully^1200", "confidently^1600", "measurably^1000",],
      typeSpeed: 90,
      loop: true,
      showCursor: false,
    });

    return () => {
      t.destroy();
    };

  }, []);

  return (
    <Container size="lg" style={{ textAlign: 'center', padding: '2rem' }}>
      <Flex
        direction="column"
        w="100%"
        align="center"
      >

        {/* Header Section */}
        <Stack mih="70vh" maw="40rem" pb="6rem" spacing="md" align="center" justify="center">
          <Center h="22rem" w="22rem">
            <img src="/pwa-512x512.png" style={{ width: "100%", height: "100%" }} />
          </Center>
          <Text
            fw={900}
            fz={42}
            c="#b41220"
          >
            Kuonsensus
          </Text>
          <Text size="xl" weight={500}>
            Kuonsensus helps you prepare impactful pitches<br /> for building consensus <strong ref={adverbsSpanRef}></strong>
          </Text>
          <Stack direction="row" spacing="md" justify="center">
            <Button size="lg" variant="outline">Demo</Button>
            <Button size="lg" component="a" href="/board/_new">Get Started</Button>
          </Stack>
        </Stack>

        <Divider w="100%" my="xl" />

        {/* Why Kuonsensus Section */}
        <Stack mih="70vh" maw="40rem" py="6rem" spacing="md" align="center" justify="center">
          <Title order={2}>Why Kuonsensus?</Title>
          <Text size="md">
            In our lives, many important decisions are made in groups. These could range from <strong>choosing paint colors</strong> to <strong>setting tax rates</strong>.
          </Text>
          <Text size="md">
            When working with groups, <strong>consensus is essential</strong> to move forward. However, group dynamics can be complex, with:
          </Text>
          <Stack spacing="xs">
            <Flex align="center" gap="sm">
              <FaUsers size="2rem" />
              <Text><strong>Multiple stakeholders</strong></Text>
            </Flex>
            <Flex align="center" gap="sm">
              <FaDiceD20 size="2rem" />
              <Text><strong>Diverse perspectives</strong></Text>
            </Flex>
            <Flex align="center" gap="sm">
              <MdOutlineCompareArrows size="2rem" />
              <Text><strong>Conflicting agendas</strong></Text>
            </Flex>
          </Stack>
          <Flex direction="column" align="center">
            <Text size="md">
              <strong>Kuonsensus</strong> helps you navigate these challenges
              <br />
              to ensure every angle is covered.
            </Text>
            <FaRegHandshake size="4rem" />
          </Flex>
        </Stack>

        <Divider w="100%" my="xl" />

        {/* How It Works Section */}
        <Stack mih="70vh" maw="60rem" py="6rem" spacing="md" align="center" justify="center">
          <Title order={2}>How It Works</Title>
          <Text size="md">Kuonsensus simplifies the process into three easy steps:</Text>
          <Stack spacing="xs">
            <Text>1. <strong>Add your proposal</strong></Text>
            <Text>2. <strong>Identify the stakeholders</strong></Text>
            <Text>3. <strong>Work through the dynamics</strong></Text>
          </Stack>

          <Text size="md" my="lg">
            You can:
          </Text>

          <Flex align="center" justify="space-evenly" gap="xl">
            <Flex w="25%" direction="column" align="center" justify="flex-start">
              <Text mb="1rem"><strong>Surface multiple viewpoints</strong></Text>
              <BiLayer size="5rem" />
            </Flex>
            <Flex w="20%" direction="column" align="center" justify="flex-start">
              <Text><strong>Capture the stakes involved</strong></Text>
              <PiEqualizerBold size="6rem" />
            </Flex>
            <Flex w="20%" direction="column" align="center" justify="flex-start" pb="1rem">
              <Text mb="1rem"><strong>Follow a guided process</strong></Text>
              <FaTasks size="4rem" />
            </Flex>
          </Flex>

          <Text size="md">
            The ultimate goal?
            <br />
            To achieve the clarity and preparation
            <br />
            it takes to <strong>reach consensus</strong>.
          </Text>
        </Stack>

        <Divider w="100%" my="xl" />

        {/* What Kuonsensus Offers Section */}
        <Stack mih="70vh" maw="80rem" py="6rem" spacing="lg" align="center" justify="center">
          <Title order={2} mb="xl">What Kuonsensus Offers</Title>

          <Flex w="100%" align="center" justify="space-evenly">

            <Flex w="30%" direction="column" align="center" gap="lg">
              <FaBalanceScale size="4rem" />
              <Text size="lg" weight={500}>
                <strong>Reveal alignment potential</strong>
                <br />
                Analyze the likelihood of consensus across the group.
              </Text>
            </Flex>

            <Flex w="30%" direction="column" align="center" gap="lg">
              <MdInsights size="4rem" />
              <Text size="lg" weight={500}>
                <strong>Prepare pitches with precision</strong>
                <br />
                Tailor your message to resonate with every perspective.
              </Text>
            </Flex>

          </Flex>

          <Flex w="100%" align="center" justify="space-evenly">

            <Flex w="30%" direction="column" align="center" gap="lg">
              <AiOutlineRobot size="4rem" />
              <Text size="lg" weight={500}>
                <strong>Leverage our AI assistant</strong>
                <br />
                Get context-aware suggestions to refine your strategy.
              </Text>
            </Flex>

            <Flex w="30%" direction="column" align="center" gap="lg">
              <MdOutlineEditNote size="4rem" />
              <Text size="lg" weight={500}>
                <strong>AI handles the typing</strong>
                <br />
                Focus on thinking and reviewing while AI does the writing for you.
              </Text>
            </Flex>

          </Flex>

        </Stack>

        <Divider w="100%" my="xl" />

        {/* CTA Section */}
        <Stack mih="70vh" maw="40rem" py="6rem" spacing="md" align="center" justify="center">
          <Title order={1}>Give it a try</Title>
          <Text size="lg" weight={500}>
            Create your first Board today!
          </Text>
          <Stack direction="row" spacing="md" justify="center">
            <Button size="lg" component="a" href="/board/_new">Start</Button>
          </Stack>
        </Stack>

        <Divider w="100%" my="xl" />
      </Flex>
    </Container>
  );
};

export default Landing;
