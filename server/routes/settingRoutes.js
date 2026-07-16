const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

// Get a setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      // Return a 404 but with success: false so the frontend can fallback
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, value: setting.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update/Upsert a setting by key
router.post('/:key', protect, authorize('Editor', 'Admin', 'Super Admin'), async (req, res) => {
  try {
    const { value } = req.body;
    let setting = await Setting.findOne({ key: req.params.key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: req.params.key, value });
    }
    res.json({ success: true, setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
