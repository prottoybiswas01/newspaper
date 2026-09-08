const StoryHub = require('../models/StoryHub');
const Article = require('../models/Article');
const AuditLog = require('../models/AuditLog');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc    Get all active story hubs
// @route   GET /api/story-hubs
const getStoryHubs = async (req, res) => {
  try {
    const hubs = await StoryHub.find({}).sort({ createdAt: -1 });
    res.json({ success: true, hubs, storyHubs: hubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single story hub by slug with attached articles
// @route   GET /api/story-hubs/:slug
const getStoryHubBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const hub = await StoryHub.findOne({ slug });
    if (!hub) {
      return res.status(404).json({ success: false, message: 'Story hub not found' });
    }

    // Fetch related articles for this story hub
    const articles = await Article.find({
      status: 'published',
      storyHubId: String(hub._id)
    }).sort({ publishDate: -1 });

    res.json({
      success: true,
      hub,
      articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new story hub
// @route   POST /api/story-hubs
const createStoryHub = async (req, res) => {
  try {
    const { 
      title, 
      subtitle,
      summary, 
      description,
      coverImage, 
      bannerImage,
      category, 
      status,
      active, 
      isBreaking, 
      keyFacts, 
      timeline, 
      timelineEvents, 
      liveUpdates 
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let slug = slugify(title);
    if (!slug) slug = 'story-hub';
    let count = 1;
    while (await StoryHub.findOne({ slug })) {
      slug = `${slugify(title)}-${count++}`;
    }

    const finalSummary = summary || description || subtitle || '';
    const finalImage = coverImage || bannerImage || '';
    const finalTimeline = Array.isArray(timeline) && timeline.length > 0 ? timeline : (Array.isArray(timelineEvents) ? timelineEvents : []);
    const hubStatus = status || 'developing';
    const isActive = active !== undefined ? active : (hubStatus !== 'concluded');

    const hub = await StoryHub.create({
      title,
      subtitle: subtitle || '',
      slug,
      summary: finalSummary,
      description: finalSummary,
      coverImage: finalImage,
      bannerImage: finalImage,
      category: category || 'bangladesh',
      status: hubStatus,
      active: isActive,
      isBreaking: Boolean(isBreaking),
      keyFacts: Array.isArray(keyFacts) ? keyFacts : [],
      timeline: finalTimeline,
      timelineEvents: finalTimeline,
      liveUpdates: Array.isArray(liveUpdates) ? liveUpdates : []
    });

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'storyhub.create',
        targetType: 'StoryHub',
        targetId: hub._id ? hub._id.toString() : '',
        targetTitle: hub.title,
        details: 'Created Story Hub for major ongoing news event'
      }).catch(() => null);
    }

    res.status(201).json({ success: true, hub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update story hub
// @route   PUT /api/story-hubs/:id
const updateStoryHub = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.bannerImage && !updateData.coverImage) updateData.coverImage = updateData.bannerImage;
    if (updateData.description && !updateData.summary) updateData.summary = updateData.description;
    if (updateData.timelineEvents && (!updateData.timeline || updateData.timeline.length === 0)) updateData.timeline = updateData.timelineEvents;

    const updated = await StoryHub.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Story hub not found' });
    }
    res.json({ success: true, hub: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete story hub
// @route   DELETE /api/story-hubs/:id
const deleteStoryHub = async (req, res) => {
  try {
    const hub = await StoryHub.findById(req.params.id);
    if (!hub) {
      return res.status(404).json({ success: false, message: 'Story hub not found' });
    }
    await StoryHub.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Story hub deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStoryHubs,
  getStoryHubBySlug,
  createStoryHub,
  updateStoryHub,
  deleteStoryHub
};
