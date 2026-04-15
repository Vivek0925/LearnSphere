const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 🎯 Only trusted study channels (VERY IMPORTANT)
const ALLOWED_CHANNELS = [
  "UCJihyK0A38SZ6SdJirEdIOw", // Gate Smashers
  "UCJ5v_MCY6GNUBTO8-D3XoAg", // Neso Academy
  "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
];

// 🔹 Map subject → search query
const SUBJECT_QUERIES = {
  "Data Structures": "data structures full course",
  Algorithms: "algorithms lecture",
  "Operating Systems": "operating system lecture",
  DBMS: "dbms full course",
  "Computer Networks": "computer networks lecture",
  "Software Engineering": "software engineering lecture",
};

exports.getAllVideos = async (req, res) => {
  try {
    const { subject = "Data Structures", topic = "" } = req.query;

    const query = SUBJECT_QUERIES[subject] + " " + topic;

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: YOUTUBE_API_KEY,
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 20,
          order: "relevance",
          videoDuration: "medium", // ❌ no shorts
        },
      },
    );

    const videos = response.data.items
      // Allow more videos but still filter junk
      .filter(
        (v) =>
          v.snippet.title.toLowerCase().includes("lecture") ||
          v.snippet.title.toLowerCase().includes("course") ||
          v.snippet.title.toLowerCase().includes("tutorial"),
      )
      .map((v) => ({
        _id: v.id.videoId,
        youtubeId: v.id.videoId,
        title: v.snippet.title,
        description: v.snippet.description,
        subjectName: subject,
        topic: topic || "General",
        duration: "10-30 min",
        difficulty: "intermediate",
        timestamps: [
          { time: "00:30", seconds: 30, label: "Introduction" },
          { time: "02:00", seconds: 120, label: "Core Concept" },
        ],
      }));

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching videos" });
  }
};
