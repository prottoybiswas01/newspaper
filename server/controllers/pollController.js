const Poll = require('../models/Poll');

// Get active poll
const getActivePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vote in poll
const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    
    // We check if the user has already voted
    // If user is authenticated, we can use user.id, else IP
    const voterId = req.user ? req.user.id : ip;

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (poll.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This poll is already closed' });
    }

    if (poll.votedUserIds && poll.votedUserIds.includes(voterId)) {
      return res.status(400).json({ success: false, message: 'You have already voted in this poll' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid option index' });
    }

    // Increment vote count and store voter identifier
    poll.options[optionIndex].votes += 1;
    if (!poll.votedUserIds) poll.votedUserIds = [];
    poll.votedUserIds.push(voterId);

    // Save
    const updatedPoll = await Poll.findByIdAndUpdate(
      poll._id, 
      { 
        $set: { options: poll.options, votedUserIds: poll.votedUserIds } 
      }, 
      { new: true }
    );

    res.json({ success: true, message: 'Vote recorded successfully', poll: updatedPoll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Get all polls
const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find({}).sort({ createdAt: -1 });
    res.json({ success: true, polls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Create a poll
const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Question and at least two options are required' });
    }

    const formattedOptions = options.map(opt => ({
      option: opt,
      votes: 0
    }));

    // If making this one active, close all other polls
    await Poll.findByIdAndUpdate(null, { $set: { status: 'closed' } }); // dummy query update

    const poll = await Poll.create({
      question,
      options: formattedOptions,
      status: 'active'
    });

    res.status(201).json({ success: true, poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Update a poll status
const updatePoll = async (req, res) => {
  try {
    const { status, question } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (question) updateData.question = question;

    // If setting active, close all other polls
    if (status === 'active') {
      const activePolls = await Poll.find({ status: 'active' });
      for (const p of activePolls) {
        if (p._id.toString() !== req.params.id) {
          await Poll.findByIdAndUpdate(p._id, { $set: { status: 'closed' } });
        }
      }
    }

    const updated = await Poll.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({ success: true, poll: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Delete a poll
const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    await Poll.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActivePoll,
  votePoll,
  getAllPolls,
  createPoll,
  updatePoll,
  deletePoll
};
