const Ad = require('../models/Ad');

// Get active ads by placement location
const getAdsByPlacement = async (req, res) => {
  try {
    const { placement } = req.query;
    const query = { active: true };
    if (placement) {
      query.placement = placement;
    }
    const ads = await Ad.find(query);
    res.json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment ad impression metrics
const recordImpression = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment ad click metrics
const recordClick = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Get all ads
const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({}).sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Create an ad placement
const createAd = async (req, res) => {
  try {
    const { title, placement, type, imageUrl, linkUrl, scriptCode } = req.body;
    if (!title || !placement) {
      return res.status(400).json({ success: false, message: 'Title and placement are required' });
    }

    const ad = await Ad.create({
      title,
      placement,
      type: type || 'image',
      imageUrl: imageUrl || '',
      linkUrl: linkUrl || '',
      scriptCode: scriptCode || ''
    });

    res.status(201).json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Update an ad placement
const updateAd = async (req, res) => {
  try {
    const { title, placement, type, imageUrl, linkUrl, scriptCode, active } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (placement) updateData.placement = placement;
    if (type) updateData.type = type;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (scriptCode !== undefined) updateData.scriptCode = scriptCode;
    if (active !== undefined) updateData.active = active;

    const updated = await Ad.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    res.json({ success: true, ad: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Delete an ad
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdsByPlacement,
  recordImpression,
  recordClick,
  getAllAds,
  createAd,
  updateAd,
  deleteAd
};
