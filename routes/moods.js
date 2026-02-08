import express from "express";
import { db } from "../db.js";
const router = express.Router();

// 🟢 POST: Create a new mood entry
router.post("/", async (req, res) => {
    const { user_id, mood_text } = req.body;
    console.log("📥 Received request for user:", user_id);

    // ⭐ EXTRA CREDIT: Input Validation
    if (!mood_text || mood_text.trim() === "") {
        console.log("⚠️ Validation failed: Empty mood_text");
        return res.status(400).json({ error: "Mood text cannot be empty!" });
    }

    try {
        // 1. Insert the mood entry
        const [result] = await db.query(
            "INSERT INTO mood_entries (user_id, mood_text) VALUES (?, ?)",
            [user_id, mood_text]
        );
        
        const moodId = result.insertId;
        console.log("✅ Mood inserted into DB with ID:", moodId);

        // 🤖 AI response logic
        const aiMsg = `Glad you shared that you are feeling ${mood_text}. Remember to take things one step at a time.`;
        await db.query(
            "INSERT INTO ai_responses (mood_entry_id, ai_message) VALUES (?, ?)",
            [moodId, aiMsg]
        );

        res.status(201).json({ 
            message: "Mood saved", 
            id: moodId,
            aiMessage: aiMsg 
        });

    } catch (err) {
        console.error("❌ DATABASE ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🔵 GET: Retrieve all moods for verification
router.get("/", async (req, res) => {
    try {
        // Note: m.created_at removed to match your database structure
        const [rows] = await db.query(`
            SELECT m.id, u.full_name, m.mood_text, a.ai_message
            FROM mood_entries m
            JOIN users u ON m.user_id = u.id
            LEFT JOIN ai_responses a ON m.id = a.mood_entry_id
        `);
        res.json(rows);
    } catch (err) {
        console.error("❌ GET ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🔴 ⭐ EXTRA CREDIT: DELETE a mood entry
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Delete child record first (AI response) then parent (Mood entry)
        await db.query("DELETE FROM ai_responses WHERE mood_entry_id = ?", [id]);
        const [result] = await db.query("DELETE FROM mood_entries WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Mood entry not found" });
        }

        res.json({ message: `Mood ID ${id} deleted successfully` });
    } catch (err) {
        console.error("❌ DELETE ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;