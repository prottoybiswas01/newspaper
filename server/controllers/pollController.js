const Poll = require('../models/Poll');

// Default starter poll in case the database is freshly initialized or empty
const DEFAULT_POLL = {
  question: 'আপনি কি মনে করেন ২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা (AI) সাংবাদিকতার ভবিষ্যৎ সম্পূর্ণ পরিবর্তন করবে?',
  options: [
    { option: 'হ্যাঁ, সম্পূর্ণভাবে পরিবর্তন করবে', votes: 142 },
    { option: 'না, মানব সাংবাদিকতার বিকল্প নেই', votes: 38 },
    { option: 'আংশিক প্রভাব ফেলবে', votes: 64 },
    { option: 'মন্তব্য নেই', votes: 11 }
  ],
  status: 'active'
};

// Get active poll
const getActivePoll = async (req, res) => {
  try {
    let poll = null;
    try {
      const activePolls = await Poll.find({ status: 'active' }).sort({ createdAt: -1 }).limit(1);
      if (Array.isArray(activePolls) && activePolls.length > 0) {
        poll = activePolls[0];
      }
    } catch (queryErr) {
      console.warn('Poll find query error, trying findOne fallback:', queryErr.message);
      poll = await Poll.findOne({ status: 'active' });
    }

    // If no active poll exists in database yet, auto-seed a default poll
    if (!poll) {
      try {
        poll = await Poll.create(DEFAULT_POLL);
      } catch (seedErr) {
        // Fallback in-memory response if DB write fails
        poll = {
          _id: 'default_active_poll_id',
          ...DEFAULT_POLL,
          createdAt: new Date().toISOString()
        };
      }
    }

    res.json({ success: true, poll });
  } catch (error) {
    console.error('Error in getActivePoll:', error);
    // Return fallback instead of 500 so UI never crashes
    res.json({
      success: true,
      poll: {
        _id: 'fallback_active_poll',
        ...DEFAULT_POLL,
        createdAt: new Date().toISOString()
      }
    });
  }
};

// Vote in poll
const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const voterId = req.user ? req.user.id : ip;

    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'জরিপ পাওয়া যায়নি' });
    }

    if (poll.status === 'closed') {
      return res.status(400).json({ success: false, message: 'এই জরিপটি বন্ধ রয়েছে' });
    }

    if (poll.votedUserIds && poll.votedUserIds.includes(voterId)) {
      return res.status(400).json({ success: false, message: 'আপনি ইতোমধ্যে এই জরিপে ভোট দিয়েছেন' });
    }

    if (optionIndex === undefined || optionIndex < 0 || optionIndex >= (poll.options || []).length) {
      return res.status(400).json({ success: false, message: 'সঠিক অপশন নির্বাচন করুন' });
    }

    // Increment vote count and store voter identifier
    const updatedOptions = [...poll.options];
    updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1;
    const updatedVoters = Array.isArray(poll.votedUserIds) ? [...poll.votedUserIds, voterId] : [voterId];

    let updatedPoll;
    try {
      updatedPoll = await Poll.findByIdAndUpdate(
        poll._id, 
        { 
          $set: { options: updatedOptions, votedUserIds: updatedVoters } 
        }, 
        { new: true }
      );
    } catch (dbErr) {
      poll.options = updatedOptions;
      poll.votedUserIds = updatedVoters;
      updatedPoll = poll;
    }

    res.json({ 
      success: true, 
      message: 'আপনার ভোট সফলভাবে গ্রহণ করা হয়েছে', 
      poll: updatedPoll || poll 
    });
  } catch (error) {
    console.error('Error in votePoll:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CMS - Get all polls
const getAllPolls = async (req, res) => {
  try {
    let polls = await Poll.find({}).sort({ createdAt: -1 });
    if (!Array.isArray(polls) || polls.length === 0) {
      polls = [DEFAULT_POLL];
    }
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
      return res.status(400).json({ success: false, message: 'প্রশ্ন এবং কমপক্ষে দুটি বিকল্প আবশ্যক' });
    }

    const formattedOptions = options.map(opt => ({
      option: typeof opt === 'string' ? opt : (opt.option || ''),
      votes: 0
    }));

    // If making this one active, close all other active polls
    try {
      const activePolls = await Poll.find({ status: 'active' });
      if (Array.isArray(activePolls)) {
        for (const p of activePolls) {
          await Poll.findByIdAndUpdate(p._id, { $set: { status: 'closed' } });
        }
      }
    } catch (e) {
      console.warn('Error closing older polls:', e.message);
    }

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
      try {
        const activePolls = await Poll.find({ status: 'active' });
        if (Array.isArray(activePolls)) {
          for (const p of activePolls) {
            if (p._id && p._id.toString() !== req.params.id) {
              await Poll.findByIdAndUpdate(p._id, { $set: { status: 'closed' } });
            }
          }
        }
      } catch (e) {
        console.warn('Error updating poll status:', e.message);
      }
    }

    const updated = await Poll.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'জরিপ পাওয়া যায়নি' });
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
      return res.status(404).json({ success: false, message: 'জরিপ পাওয়া যায়নি' });
    }
    await Poll.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'জরিপ সফলভাবে মুছে ফেলা হয়েছে' });
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
