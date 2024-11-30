import { Edges } from '@react-three/drei';

export const Kuon3D_Stakeholder = () => {
  return (
    <mesh position={[0, 0, 0]} receiveShadow>
      <cylinderGeometry attach="geometry" args={[4, 4, 1, 128]} />
      <meshStandardMaterial attach="material" color={"#DEDEDE"} />
      <Edges linewidth={1} threshold={15} color={"black"} />
    </mesh>
  );
};

export default Kuon3D_Stakeholder;