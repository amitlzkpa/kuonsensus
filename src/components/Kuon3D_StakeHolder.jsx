import { useState } from "react";
import { Edges, Html } from '@react-three/drei';

export const Kuon3D_StakeHolder = ({ position, stakeHolder }) => {

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
      <Edges linewidth={clicked ? 3 : hovered ? 4 : 2} threshold={15} color={clicked ? "#b41220" : hovered ? "#c91a25" : "black"} />
      <Html
        center
        style={{
          width: "6rem",
          pointerEvents: "none"
        }}>
        <div style={{
          color: "black",
          lineHeight: "0.9rem",
          fontSize: "0.8rem",
          fontWeight: "bold",
          fontFamily: "Nunito",
          textAlign: "center",
        }}>
          {stakeHolder.stakeHolderName}
        </div>
      </Html>
    </mesh>
  );
};

export default Kuon3D_StakeHolder;