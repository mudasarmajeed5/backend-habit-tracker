import db from "./connection.ts";
import { users, habits, habitTags, entries, tags } from "./schema.ts";

const seed = async () => {
  console.log("🌱 Starting db seed");
  try {
    console.log("Clearing the previous database.");
    await db.delete(habits);
    await db.delete(users);
    await db.delete(tags);
    await db.delete(entries);
    await db.delete(habitTags);

    console.log("Creating demo user...");
    const [demoUser] = await db
      .insert(users)
      .values({
        email: "johndoe@gmail.com",
        username: "john",
        firstName: "John",
        lastName: "Doe",
        password: "Niggora@123",
      })
      .returning();

    console.log("Creating tag");
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: "health",
        color: "#DED501",
      })
      .returning();

    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        name: "Do 50 pushups",
        frequency: "daily",
        userId: demoUser.id,
        description: "Do it 5 times a day",
        targetCount: 2,
      })
      .returning();

    await db.insert(habitTags).values({
      habitId: exerciseHabit.id,
      tagId: healthTag.id,
    });

    // now we insert some entries for this habit.
    console.log("Adding entries for the user");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
        note: "completed",
      });
    }
    console.log("✅ Database seeded");
    console.log(
      `- User credentials ${demoUser.email}\nusername: ${demoUser.username}\npassword: ${demoUser.password}`,
    );
  } catch (error) {
    console.error("❌ seed failed", error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => process.exit(1));
}
export default seed