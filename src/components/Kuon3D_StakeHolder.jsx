import { useState } from "react";
import { Edges } from '@react-three/drei';

export const Kuon3D_StakeHolder = ({ position }) => {

  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  return (
    <mesh
      position={position}
      onPointerDown={() => click(true)}
      onPointerUp={() => click(false)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => { hover(false); click(false) }}
      receiveShadow
    >
      <cylinderGeometry attach="geometry" args={[4, 4, 1, 128]} />
      <meshStandardMaterial attach="material" color={"#DEDEDE"} />
      <Edges linewidth={clicked ? 3 : hovered ? 4 : 2} threshold={15} color={clicked ? "#0002ef" : hovered ? "#c02040" : "black"} />
    </mesh>
  );
};

export default Kuon3D_StakeHolder;