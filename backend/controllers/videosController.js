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

function durationToSeconds(durationText = "") {
  if (!durationText || durationText === "N/A") return 0;

  const parts = durationText.split(":").map((part) => Number(part));

  if (parts.some((part) => Number.isNaN(part))) return 0;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return 0;
}

function formatSeconds(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function parseTimestamps(description = "") {
  if (!description) return [];

  const chapterPattern = /^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+)$/gm;
  const timestamps = [];
  let match;

  while ((match = chapterPattern.exec(description)) !== null) {
    const time = match[1].trim();
    const label = match[2].trim();

    if (time && label) {
      timestamps.push({
        time,
        label,
        seconds: 0,
      });
    }
  }

  return timestamps.slice(0, 8);
}

function buildFallbackTimestamps(durationText = "") {
  const totalSeconds = durationToSeconds(durationText);

  if (!totalSeconds) return [];

  const checkpoints = [0.1, 0.35, 0.6, 0.85];
  const labels = ["Introduction", "Core Concepts", "Practice / Examples", "Summary / Revision"];

  return checkpoints
    .map((ratio, index) => {
      const seconds = Math.floor(totalSeconds * ratio);
      if (seconds <= 0 || seconds >= totalSeconds) return null;

      return {
        time: formatSeconds(seconds),
        label: labels[index],
        seconds,
      };
    })
    .filter(Boolean);
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
    let descriptionMap = new Map();
    if (videoIds.length) {
      const detailsResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            key: YOUTUBE_API_KEY,
            part: "contentDetails,snippet",
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

      descriptionMap = new Map(
        detailsResponse.data.items.map((item) => [item.id, item.snippet?.description || ""]),
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
      timestamps: (() => {
        const descriptionTimestamps = parseTimestamps(descriptionMap.get(v.id.videoId) || v.snippet.description || "");
        if (descriptionTimestamps.length > 0) return descriptionTimestamps;

        return buildFallbackTimestamps(durationMap.get(v.id.videoId) || "");
      })(),
    }));

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching videos" });
  }
};
