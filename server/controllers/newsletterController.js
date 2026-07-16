const Newsletter = require('../models/Newsletter');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const exists = await Newsletter.findOne({ email });
    if (exists) {
      if (exists.status === 'unsubscribed') {
        const updated = await Newsletter.findByIdAndUpdate(exists._id, { $set: { status: 'active' } }, { new: true });
        return res.json({ success: true, message: 'Thank you for subscribing again!', subscriber: updated });
      }
      return res.status(400).json({ success: false, message: 'This email is already subscribed' });
    }

    const subscriber = await Newsletter.create({ email });
    res.status(201).json({ success: true, message: 'Successfully subscribed to our newsletter!', subscriber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    res.json({ success: true, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Email subscription not found' });
    }

    await Newsletter.findByIdAndUpdate(subscriber._id, { $set: { status: 'unsubscribed' } });
    res.json({ success: true, message: 'Successfully unsubscribed from our list.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  subscribe,
  getSubscribers,
  unsubscribe
};
