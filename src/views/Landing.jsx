import React from 'react';
import { Container, Stack, Title, Text, Button, Divider } from '@mantine/core';

import { SectionEditor } from '../components/SectionEditor';

const Landing = () => {
  return (
    <Container size="lg" style={{ textAlign: 'center', padding: '2rem' }}>

      <Stack mih="60vh" align="center">
        <SectionEditor />
      </Stack>


      {/* Header Section */}
      <Stack mih="70vh" py="6rem" spacing="md" align="center" justify="center">
        <Title order={1}>Kuonsensus</Title>
        <Text size="lg" weight={500}>
          <strong>Kuonsensus</strong> is a powerful tool designed to help you prepare impactful pitches that build consensus effectively.
        </Text>
        <Stack direction="row" spacing="md" justify="center">
          <Button size="lg" variant="outline">Demo</Button>
          <Button size="lg" component="a" href="/board/_new">Get Started</Button>
        </Stack>
      </Stack>

      <Divider my="xl" />

      {/* Why Kuonsensus Section */}
      <Stack mih="70vh" py="6rem" spacing="md" align="center" justify="center">
        <Title order={2}>Why Kuonsensus?</Title>
        <Text size="md">
          In our lives, many important decisions are made in groups. These could range from <strong>choosing paint colors</strong> to <strong>setting tax rates</strong>.
        </Text>
        <Text size="md">
          When working with groups, <strong>consensus is essential</strong> to move forward. However, group dynamics can be complex, with:
        </Text>
        <Stack spacing="xs">
          <Text>- <strong>Multiple stakeholders</strong></Text>
          <Text>- <strong>Diverse perspectives</strong></Text>
          <Text>- <strong>Conflicting agendas</strong></Text>
        </Stack>
        <Text size="md">
          <strong>Kuonsensus</strong> helps you navigate these challenges to ensure every angle is covered.
        </Text>
      </Stack>

      <Divider my="xl" />

      {/* How It Works Section */}
      <Stack mih="70vh" py="6rem" spacing="md" align="center" justify="center">
        <Title order={2}>How It Works</Title>
        <Text size="md">Kuonsensus simplifies the process into three easy steps:</Text>
        <Stack spacing="xs">
          <Text>1. <strong>Add your proposal</strong></Text>
          <Text>2. <strong>Identify the stakeholders</strong></Text>
          <Text>3. <strong>Work through the dynamics</strong></Text>
        </Stack>
        <Text size="md">
          With Kuonsensus, you can:
        </Text>
        <Stack spacing="xs">
          <Text>- <strong>Surface multiple viewpoints</strong></Text>
          <Text>- <strong>Capture the stakes involved</strong></Text>
          <Text>- <strong>Follow a guided process to align the group</strong></Text>
        </Stack>
        <Text size="md">
          The ultimate goal? To achieve the clarity and preparation it takes to <strong>reach consensus</strong>.
        </Text>
      </Stack>

      <Divider my="xl" />

      {/* What Kuonsensus Offers Section */}
      <Stack mih="70vh" py="6rem" spacing="md" align="center" justify="center">
        <Title order={2}>What Kuonsensus Offers</Title>
        <Text size="md">
          Kuonsensus supports your decision-making process by:
        </Text>
        <Stack spacing="xs">
          <Text>- <strong>Identifying what matters to whom</strong></Text>
          <Text>- <strong>Revealing the likelihood of alignment</strong></Text>
          <Text>- <strong>Helping you prepare and tailor your pitch</strong> for maximum impact</Text>
        </Stack>
        <Text size="md">
          Let Kuonsensus guide you toward collaboration, clarity, and consensus.
        </Text>
      </Stack>

      <Divider my="xl" />

      {/* CTA Section */}
      <Stack mih="70vh" py="6rem" spacing="md" align="center" justify="center">
        <Title order={1}>Give it a try</Title>
        <Text size="lg" weight={500}>
          Create your first Board today!
        </Text>
        <Stack direction="row" spacing="md" justify="center">
          <Button size="lg" component="a" href="/board/_new">Start</Button>
        </Stack>
      </Stack>

      <Divider my="xl" />
    </Container>
  );
};

export default Landing;
