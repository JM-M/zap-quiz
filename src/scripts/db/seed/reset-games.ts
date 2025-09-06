import { config } from "dotenv";
import { db } from "../../../db";
import { games, players } from "../../../db/schema";

// Load environment variables
config({ path: ".env.local" });

async function resetGames() {
  console.log("🔄 Starting games reset operation...");

  try {
    // First, delete all players (this will cascade delete playerAnswers and playerScores)
    console.log("🗑️  Deleting all players and related data...");
    const deletedPlayers = await db.delete(players);
    console.log("✅ Deleted all players, player answers, and player scores");

    // Reset all games to waiting status and clear game state
    console.log("🔄 Resetting all games to waiting status...");
    const updatedGames = await db
      .update(games)
      .set({
        status: "waiting",
        currentScreen: "countdown",
        currentQuestionIndex: 0,
        startedAt: null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .returning();

    console.log(`✅ Reset ${updatedGames.length} games to waiting status`);

    console.log("🎉 Games reset completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Games reset to waiting: ${updatedGames.length}`);
    console.log(`   - All players, answers, and scores cleared`);
  } catch (error) {
    console.error("❌ Error during games reset:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  resetGames()
    .then(() => {
      console.log("🎉 Games reset completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Games reset failed:", error);
      process.exit(1);
    });
}

export { resetGames };
