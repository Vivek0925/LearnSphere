const Note = require('../models/Note');
const axios = require('axios');

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, '').trim();
}

exports.getNotesBySubject = async (req, res) => {
  try {
    const notes = await Note.find({ subjectName: req.params.subjectName });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const { search, subject } = req.query;
    const query = {};
    if (subject) query.subjectName = subject;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
    const notes = await Note.find(query).sort({ subjectName: 1, topic: 1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchGeeksforGeeks = async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return res.json([]);
    }

    const encodedQuery = encodeURIComponent(query);
    const postsUrl = `https://www.geeksforgeeks.org/wp-json/wp/v2/posts?search=${encodedQuery}&per_page=6&_fields=id,link,title.rendered`;
    const pagesUrl = `https://www.geeksforgeeks.org/wp-json/wp/v2/pages?search=${encodedQuery}&per_page=4&_fields=id,link,title.rendered`;

    const [postsRes, pagesRes] = await Promise.all([
      axios.get(postsUrl, { timeout: 10000 }),
      axios.get(pagesUrl, { timeout: 10000 })
    ]);

    const rawItems = [
      ...(Array.isArray(postsRes.data) ? postsRes.data : []),
      ...(Array.isArray(pagesRes.data) ? pagesRes.data : [])
    ];

    const seenLinks = new Set();
    const results = rawItems
      .map((item, index) => ({
        id: `gfg-${item.id || index}`,
        title: stripHtml(item?.title?.rendered || 'GeeksforGeeks Article'),
        category: 'GeeksforGeeks',
        level: 'Intermediate',
        tags: ['gfg', 'web result'],
        url: item.link
      }))
      .filter((item) => {
        if (!item.url || seenLinks.has(item.url)) return false;
        seenLinks.add(item.url);
        return true;
      })
      .slice(0, 8);

    return res.json(results);
  } catch (err) {
    console.error('GFG search failed:', err.message);
    return res.status(500).json({ message: 'Failed to fetch GeeksforGeeks results' });
  }
};
