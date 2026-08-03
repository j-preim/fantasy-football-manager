import fs from 'fs';

const year = "2025"; // Change this to grab different historical years

const playerList = JSON.parse(
  fs.readFileSync(new URL(`player_list_${year}.json`, import.meta.url), 'utf8')
);
const draftRecap = JSON.parse(
  fs.readFileSync(new URL(`../drafts/draft_recap_${year}.json`, import.meta.url), 'utf8')
);


async function filterPlayersByDraft() {
  try {
    const draftData = draftRecap.draftDetail.picks;
    const playerData = playerList;
    
    let filteredPlayerList = [];
    let i;
    let j;

    for (i = 0; i < draftData.length; i++) {
      for (j = 0; j < playerData.length; j++) {
        if (draftData[i].playerId === playerData[j].id) {
          filteredPlayerList.push(playerData[j]);
        }
      }
    }
    console.log(filteredPlayerList.length);

    // Save the data locally so you never have to filter the player list for this year again
    const filename = `filtered_player_list_${year}.json`;

    fs.writeFileSync(filename, JSON.stringify(filteredPlayerList, null, 2));
    console.log(`✅ Successfully saved ${year} filtered player list to ${filename}`);
    
  } catch (error) {
    console.error("❌ Failed to filter player list:", error);
  }
}

filterPlayersByDraft();