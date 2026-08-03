import fs from 'fs';

const year = "2025"; // Change this to grab different historical years

const filteredPlayerList = JSON.parse(
  fs.readFileSync(new URL(`../players/filtered_player_list_${year}.json`, import.meta.url), 'utf8')
);

const draftRecap = JSON.parse(
  fs.readFileSync(new URL(`draft_recap_${year}.json`, import.meta.url), 'utf8')
);

async function addPlayerName() {
  try {
    const draftData = draftRecap.draftDetail.picks;
    const playerData = filteredPlayerList;
    
    let playerIds = [];
    let picksWithName = [];
    let i;
    let j;

    for (j = 0; j < playerData.length; j++) {
      playerIds.push(playerData[j].id);
    }

    for (i = 0; i < draftData.length; i++) {
      if (playerIds.includes(draftData[i].playerId)) {
        for (j = 0; j < playerData.length; j++) {
          if (draftData[i].playerId === playerData[j].id) {
            draftData[i].fullName = playerData[j].fullName;
            draftData[i].firstName = playerData[j].firstName;
            draftData[i].lastName = playerData[j].lastName;
            draftData[i].defaultPositionId = playerData[j].defaultPositionId;
            draftData[i].eligibleSlots = playerData[j].eligibleSlots;
            draftData[i].proTeamId = playerData[j].proTeamId;
            picksWithName.push(draftData[i]);
          }
        }
      }
      else {
        draftData[i].fullName = 'Unknown Player';
        picksWithName.push(draftData[i]);
      }
    }
    console.log(picksWithName.length);

    // Save the data locally so you never have to filter the player list for this year again
    const filename = `updated_draft_recap_${year}.json`;

    fs.writeFileSync(filename, JSON.stringify(picksWithName, null, 2));
    console.log(`✅ Successfully saved ${year} updated draft recap to ${filename}`);
    
  } catch (error) {
    console.error("❌ Failed to update draft recapx:", error);
  }
}

addPlayerName();