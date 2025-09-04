import { config } from "dotenv";
import { db } from "../../../db";
import { games, players, questionOptions, questions } from "../../../db/schema";
import { user } from "../../../db/schema/auth";

// Load environment variables
config({ path: ".env.local" });

async function seedDatabase() {
  console.log("🌱 Starting database seed operation...");

  try {
    // Create a sample user (host)
    const [hostUser] = await db
      .insert(user)
      .values({
        id: "user_123456789",
        name: "Quiz Host",
        email: "host@example.com",
        emailVerified: true,
      })
      .returning();

    console.log("✅ Created host user:", hostUser.email);

    // Create a sample game
    const [game] = await db
      .insert(games)
      .values({
        code: "ABC123",
        title: "Sample Quiz Game",
        status: "waiting",
        hostId: hostUser.id,
        settings: {
          timeLimit: 30,
          allowLateJoins: true,
          showCorrectAnswers: true,
        },
      })
      .returning();

    console.log("✅ Created game:", game.code);

    // Create sample questions
    const sampleQuestions = [
      {
        question: "What is the capital of France?",
        order: 1,
        timeLimit: 30,
        points: 10,
      },
      {
        question: "Which planet is known as the Red Planet?",
        order: 2,
        timeLimit: 25,
        points: 10,
      },
      {
        question: "What is 2 + 2?",
        order: 3,
        timeLimit: 15,
        points: 5,
      },
    ];

    const createdQuestions = [];
    for (const questionData of sampleQuestions) {
      const [question] = await db
        .insert(questions)
        .values({
          ...questionData,
          gameId: game.id,
        })
        .returning();
      createdQuestions.push(question);
    }

    console.log("✅ Created questions:", createdQuestions.length);

    // Create question options for each question
    const questionOptionsData = [
      // Question 1: Capital of France
      [
        { text: "Paris", isCorrect: true, order: 1 },
        { text: "London", isCorrect: false, order: 2 },
        { text: "Berlin", isCorrect: false, order: 3 },
        { text: "Madrid", isCorrect: false, order: 4 },
      ],
      // Question 2: Red Planet
      [
        { text: "Mars", isCorrect: true, order: 1 },
        { text: "Venus", isCorrect: false, order: 2 },
        { text: "Jupiter", isCorrect: false, order: 3 },
        { text: "Saturn", isCorrect: false, order: 4 },
      ],
      // Question 3: Math
      [
        { text: "4", isCorrect: true, order: 1 },
        { text: "3", isCorrect: false, order: 2 },
        { text: "5", isCorrect: false, order: 3 },
        { text: "6", isCorrect: false, order: 4 },
      ],
    ];

    for (let i = 0; i < createdQuestions.length; i++) {
      const question = createdQuestions[i];
      const options = questionOptionsData[i];

      for (const optionData of options) {
        await db.insert(questionOptions).values({
          ...optionData,
          questionId: question.id,
        });
      }
    }

    console.log("✅ Created question options");

    // Create sample players
    const samplePlayers = [
      { name: "Alice", isHost: false },
      { name: "Bob", isHost: false },
      { name: "Charlie", isHost: false },
    ];

    const createdPlayers = [];
    for (const playerData of samplePlayers) {
      const [player] = await db
        .insert(players)
        .values({
          ...playerData,
          gameId: game.id,
        })
        .returning();
      createdPlayers.push(player);
    }

    console.log("✅ Created players:", createdPlayers.length);

    console.log(`🎮 Sample game created with code: ${game.code}`);
    console.log(`👤 Host: ${hostUser.name} (${hostUser.email})`);
    console.log(`📝 Questions: ${createdQuestions.length}`);
    console.log(`👥 Players: ${createdPlayers.length}`);
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Database seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database seeding failed:", error);
      process.exit(1);
    });
}
