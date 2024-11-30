import { useState } from "react";
import { Edges } from '@react-three/drei';

export const Kuon3D_StakeHolder = () => {

  const [hovered, hover] = useState(false);

  return (
    <mesh
      position={[0, 0, 0]}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      receiveShadow
    >
      <cylinderGeometry attach="geometry" args={[4, 4, 1, 128]} />
      <meshStandardMaterial attach="material" color={"#DEDEDE"} />
      <Edges linewidth={hovered ? 4 : 2} threshold={15} color={hovered ? "#c02040" : "black"} />
    </mesh>
  );
};

export default Kuon3D_StakeHolder;