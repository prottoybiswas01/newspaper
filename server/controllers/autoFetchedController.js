const AutoFetchedArticle = require('../models/AutoFetchedArticle');

exports.getAutoFetchedArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const articles = await AutoFetchedArticle.find(query)
      .sort({ pubDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AutoFetchedArticle.countDocuments(query);

    res.status(200).json({
      success: true,
      articles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching auto fetched articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auto-fetched articles'
    });
  }
};

exports.deleteAutoFetchedArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AutoFetchedArticle.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article log not found' });
    }
    res.status(200).json({ success: true, message: 'Article log deleted successfully' });
  } catch (error) {
    console.error('Error deleting auto fetched article:', error);
    res.status(500).json({ success: false, message: 'Failed to delete article log' });
  }
};
