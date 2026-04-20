const axios = require("axios");
const ytSearch = require("yt-search");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMESTAMP_MODEL = "meta-llama/llama-3.1-8b-instruct";

// 🔹 Map subject → search query
const SUBJECT_QUERIES = {
  "Data Structures": "data structures full course",
  Algorithms: "algorithms lecture",
  "Operating Systems": "operating system lecture",
  DBMS: "dbms full course",
  "Computer Networks": "computer networks lecture",
  "Software Engineering": "software engineering lecture",
};

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function getRelevanceScore(video, topic = "") {
  if (!topic.trim()) return 0;

  const haystack = `${video.snippet?.title || ""} ${video.snippet?.description || ""}`.toLowerCase();
  const tokens = tokenize(topic);

  let score = 0;

  if (haystack.includes(topic.toLowerCase())) score += 6;

  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
  }

  return score;
}

function isInstructionalVideo(video) {
  const text = `${video.snippet?.title || ""} ${video.snippet?.description || ""}`.toLowerCase();
  const keywords = [
    "lecture",
    "course",
    "tutorial",
    "explained",
    "complete",
    "full",
    "for beginners",
    "crash course",
  ];

  return keywords.some((k) => text.includes(k));
}

function extractJsonArray(text = "") {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

function parseDurationTextToSeconds(durationText = "") {
  if (!durationText || durationText === "N/A") return 0;
  const parts = durationText.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function normalizeTimestampItem(item, maxSeconds) {
  if (!item || typeof item !== "object") return null;
  const time = String(item.time || "").trim();
  const label = String(item.label || "").trim();
  if (!time || !label) return null;

  const seconds = durationToSeconds(time);
  if (!seconds || seconds >= maxSeconds) return null;

  return { time: formatSeconds(seconds), label, seconds };
}

function buildDefaultQuery(subject = "", topic = "") {
  const trimmedTopic = topic.trim();
  const subjectHint = SUBJECT_QUERIES[subject] || subject || "computer science";

  if (trimmedTopic) return `${trimmedTopic} lecture tutorial explained`;
  return `${subjectHint} lecture tutorial explained`;
}

async function fetchVideosFromYouTubeApi(query) {
  if (!YOUTUBE_API_KEY) return [];

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
      },
      timeout: 12000,
    },
  );

  const items = searchResponse.data?.items || [];
  const ids = items.map((v) => v.id?.videoId).filter(Boolean);
  if (!ids.length) return [];

  const detailsResponse = await axios.get(
    "https://www.googleapis.com/youtube/v3/videos",
    {
      params: {
        key: YOUTUBE_API_KEY,
        part: "contentDetails,snippet",
        id: ids.join(","),
      },
      timeout: 12000,
    },
  );

  const detailsById = new Map(
    (detailsResponse.data?.items || []).map((item) => [item.id, item]),
  );

  return items
    .map((item) => {
      const id = item.id?.videoId;
      const detail = detailsById.get(id);
      if (!id || !detail) return null;

      return {
        _id: id,
        youtubeId: id,
        title: detail.snippet?.title || item.snippet?.title || "Untitled",
        description: detail.snippet?.description || item.snippet?.description || "",
        duration: formatIsoDuration(detail.contentDetails?.duration),
      };
    })
    .filter(Boolean);
}

async function fetchVideosFromFallback(query) {
  try {
    const result = await ytSearch(query);
    return (result.videos || []).slice(0, 20).map((v) => ({
      _id: v.videoId,
      youtubeId: v.videoId,
      title: v.title || "Untitled",
      description: v.description || "",
      duration: v.timestamp || "N/A",
    }));
  } catch {
    return [];
  }
}

function mergeAndRankVideos(primaryVideos, fallbackVideos, topic) {
  const merged = [];
  const seen = new Set();

  for (const source of [primaryVideos, fallbackVideos]) {
    for (const v of source) {
      if (!v?.youtubeId || seen.has(v.youtubeId)) continue;
      seen.add(v.youtubeId);
      merged.push(v);
    }
  }

  const scored = merged
    .map((video) => {
      const score = getRelevanceScore({ snippet: { title: video.title, description: video.description } }, topic);
      const instructionalBoost = isInstructionalVideo({ snippet: { title: video.title, description: video.description } }) ? 2 : 0;
      return { video, score: score + instructionalBoost };
    })
    .sort((a, b) => b.score - a.score);

  return scored.map((entry) => entry.video).slice(0, 15);
}

async function buildAiTimestamps({ title, description, durationText, topic }) {
  const fallback = buildFallbackTimestamps(durationText);
  if (!OPENROUTER_API_KEY) return fallback;

  const maxSeconds = parseDurationTextToSeconds(durationText);
  if (!maxSeconds) return fallback;

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: TIMESTAMP_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You generate concise study chapter timestamps for educational videos. Return only valid JSON array with objects: time, label.",
          },
          {
            role: "user",
            content: `Generate 4-6 chapter timestamps for this video.\nTitle: ${title}\nTopic: ${topic || "General"}\nDuration: ${durationText}\nDescription: ${description}\nRules:\n- time must be in mm:ss or hh:mm:ss\n- do not exceed video duration\n- first timestamp should be near beginning\n- labels should be short study-friendly\nOutput JSON only, like [{"time":"00:45","label":"Intro"}]`,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    const text = response.data?.choices?.[0]?.message?.content || "";
    const raw = extractJsonArray(text);

    const normalized = raw
      .map((item) => normalizeTimestampItem(item, maxSeconds))
      .filter(Boolean)
      .slice(0, 8);

    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

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
    const { subject = "", topic = "" } = req.query;
    const trimmedTopic = topic.trim();

    const query = buildDefaultQuery(subject, trimmedTopic);
    let apiVideos = [];

    try {
      apiVideos = await fetchVideosFromYouTubeApi(query);
    } catch {
      apiVideos = [];
    }

    const fallbackVideos = await fetchVideosFromFallback(query);
    const rankedVideos = mergeAndRankVideos(apiVideos, fallbackVideos, trimmedTopic);

    const videos = rankedVideos.map((v) => {
      const descriptionTimestamps = parseTimestamps(v.description || "");

      return {
        _id: v.youtubeId,
        youtubeId: v.youtubeId,
        title: v.title,
        description: v.description,
        subjectName: subject || "General",
        topic: trimmedTopic || "General",
        duration: v.duration || "N/A",
        difficulty: "intermediate",
        timestamps: descriptionTimestamps.length > 0
          ? descriptionTimestamps
          : buildFallbackTimestamps(v.duration || ""),
      };
    });

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching videos" });
  }
};

exports.getVideoTimestamps = async (req, res) => {
  try {
    const { youtubeId } = req.params;
    const { title = "", description = "", duration = "", topic = "" } = req.query;

    if (!youtubeId) {
      return res.status(400).json({ message: "youtubeId is required", timestamps: [] });
    }

    const parsedFromDescription = parseTimestamps(description);
    if (parsedFromDescription.length > 0) {
      return res.json({ timestamps: parsedFromDescription });
    }

    const timestamps = await buildAiTimestamps({
      title,
      description,
      durationText: duration,
      topic,
    });

    return res.json({ timestamps });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to generate timestamps", timestamps: [] });
  }
};
