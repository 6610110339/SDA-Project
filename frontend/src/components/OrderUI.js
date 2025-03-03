import React from "react";

export default function OrderUI({ characters, monsters }) {
  // รวมตัวละครของผู้เล่นและมอนสเตอร์ แล้วเรียงลำดับ
  const allEntities = [...characters, ...monsters].sort((a, b) => {
    // ถ้า a เป็นตัวละครของผู้เล่น ให้มาก่อน (playerCharacter = true)
    if (a.playerCharacter && !b.playerCharacter) return -1;
    if (!a.playerCharacter && b.playerCharacter) return 1;
    return 0;
  });

  return (
    <div>
      {allEntities.map((entity, index) => (
        <div key={index} style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
          <strong>{entity.name}</strong> (HP: {entity.hp})
        </div>
      ))}
    </div>
  );
}
