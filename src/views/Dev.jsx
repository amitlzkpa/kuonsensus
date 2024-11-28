import React, { useEffect, useState } from "react";
import { Center, Container } from '@mantine/core';

import MorphingSvg from "../components/MorphingSvg";

export default function Dev() {

  return (
    <Container fluid>

      <Center>
        <MorphingSvg />
      </Center>

    </Container>
  );
}
