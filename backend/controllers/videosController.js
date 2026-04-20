const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 🔹 Map subject → search query
const SUBJECT_QUERIES = {
  "Data Structures": "data structures full course",
  Algorithms: "algorithms lecture",
  "Operating Systems": "operating system lecture",
  DBMS: "dbms full course",
  "Computer Networks": "computer networks lecture",
  "Software Engineering": "software engineering lecture",
};

function formatIsoDuration(isoDuration = "") {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return "N/A";

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

exports.getAllVideos = async (req, res) => {
  try {
    const { subject = "Data Structures", topic = "" } = req.query;

    const query = SUBJECT_QUERIES[subject] + " " + topic;

    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: YOUTUBE_API_KEY,
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 20,
          order: "relevance",
          videoDuration: "medium",
        },
      },
    );

    const filteredItems = searchResponse.data.items.filter(
      (v) =>
        v.snippet.title.toLowerCase().includes("lecture") ||
        v.snippet.title.toLowerCase().includes("course") ||
        v.snippet.title.toLowerCase().includes("tutorial"),
    );

    const videoIds = filteredItems.map((v) => v.id.videoId).filter(Boolean);

    let durationMap = new Map();
    if (videoIds.length) {
      const detailsResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            key: YOUTUBE_API_KEY,
            part: "contentDetails",
            id: videoIds.join(","),
          },
        },
      );

      durationMap = new Map(
        detailsResponse.data.items.map((item) => [
          item.id,
          formatIsoDuration(item.contentDetails?.duration),
        ]),
      );
    }

    const videos = filteredItems.map((v) => ({
      _id: v.id.videoId,
      youtubeId: v.id.videoId,
      title: v.snippet.title,
      description: v.snippet.description,
      subjectName: subject,
      topic: topic || "General",
      duration: durationMap.get(v.id.videoId) || "N/A",
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
