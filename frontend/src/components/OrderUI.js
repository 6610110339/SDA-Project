export default function OrderUI({ userCharacters, waveMonsters }) {
    const waveMonster = waveMonsters.length > 0 ? waveMonsters[0] : null;
  
    return (
      <div>
        <h2>🔹 Your Characters</h2>
        <ul>
          {userCharacters.map((char) => (
            <li key={char.id}>
              <img src={char.image} alt={char.name} width={50} />
              {char.name} (Lv.{char.level}) - HP: {char.health}
            </li>
          ))}
        </ul>
  
        <h2>⚔️ Wave Monster</h2>
        {waveMonster ? (
          <div>
            <img src={waveMonster.image} alt={waveMonster.name} width={50} />
            {waveMonster.name} (Lv.{waveMonster.level}) - HP: {waveMonster.health}
          </div>
        ) : (
          <p>No monsters in this wave.</p>
        )}
      </div>
    );
  }
  