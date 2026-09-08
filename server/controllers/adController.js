const Ad = require('../models/Ad');
const AuditLog = require('../models/AuditLog');

// @desc    Smart Ad Delivery Engine with Targeting, Priority & Fallback
// @route   GET /api/ads/serve
const serveAd = async (req, res) => {
  try {
    const { placement, category, articleId, device = 'Desktop', excludeIds } = req.query;

    if (!placement) {
      return res.status(400).json({ success: false, message: 'Placement is required' });
    }

    const now = new Date();
    const excludeList = excludeIds ? excludeIds.split(',').filter(Boolean) : [];

    // Query active ads for placement
    const ads = await Ad.find({
      placement,
      active: true,
      status: 'active'
    });

    // Filter by dates, device, category, article
    const eligibleAds = ads.filter(ad => {
      // Exclude already rendered IDs if specified
      if (excludeList.includes(String(ad._id))) return false;

      // Date check
      if (ad.startDate && new Date(ad.startDate) > now) return false;
      if (ad.endDate && new Date(ad.endDate) < now) return false;

      // Device targeting
      if (Array.isArray(ad.targetDevices) && ad.targetDevices.length > 0) {
        const devMatched = ad.targetDevices.some(d => d.toLowerCase() === device.toLowerCase());
        if (!devMatched) return false;
      }

      // Category targeting (if specified on ad, current category must match)
      if (Array.isArray(ad.targetCategories) && ad.targetCategories.length > 0 && category) {
        const catMatched = ad.targetCategories.some(c => 
          c.toLowerCase() === category.toLowerCase() || 
          category.toLowerCase().includes(c.toLowerCase())
        );
        if (!catMatched) return false;
      }

      // Specific article targeting
      if (Array.isArray(ad.targetArticles) && ad.targetArticles.length > 0 && articleId) {
        const artMatched = ad.targetArticles.some(a => a === String(articleId));
        if (!artMatched) return false;
      }

      return true;
    });

    if (eligibleAds.length > 0) {
      // Sort by priority descending (10 is top priority, 1 is low)
      eligibleAds.sort((a, b) => (b.priority || 5) - (a.priority || 5));

      // Get highest priority group
      const highestPriority = eligibleAds[0].priority || 5;
      const topTierAds = eligibleAds.filter(a => (a.priority || 5) === highestPriority);

      // Randomly pick one among the top priority tier
      const chosenAd = topTierAds[Math.floor(Math.random() * topTierAds.length)];

      return res.json({
        success: true,
        ad: chosenAd,
        isFallback: false
      });
    }

    // Fallback: Check for designated house ad for this placement
    const houseAd = await Ad.findOne({
      placement,
      active: true,
      isHouseAd: true
    });

    if (houseAd) {
      return res.json({
        success: true,
        ad: houseAd,
        isFallback: true
      });
    }

    // Default institutional house ad fallback
    return res.json({
      success: true,
      ad: {
        _id: 'house_default_' + placement,
        title: 'দৈনিক দর্পণ ডিজিটাল সংস্করণ',
        advertiserName: 'দৈনিক দর্পণ',
        campaignName: 'House Promotion',
        creativeType: 'house-ad',
        placement,
        description: 'সবার আগে সর্বশেষ ও বিশ্বস্ত সংবাদ পেতে আমাদের সঙ্গেই থাকুন।',
        ctaText: 'সাবস্ক্রাইব করুন',
        sponsorBadge: 'বিজ্ঞাপন',
        destinationUrl: 'https://dainikdarpan.com',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
        isHouseAd: true,
        priority: 1
      },
      isFallback: true
    });
  } catch (error) {
    console.error('serveAd error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active ads by placement location (legacy & batch)
// @route   GET /api/ads
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

// @desc    Increment ad impression metrics
// @route   POST /api/ads/:id/impression
const recordImpression = async (req, res) => {
  try {
    if (req.params.id && !req.params.id.startsWith('house_default_')) {
      await Ad.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment ad click metrics
// @route   POST /api/ads/:id/click
const recordClick = async (req, res) => {
  try {
    if (req.params.id && !req.params.id.startsWith('house_default_')) {
      await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ad manager statistics & reports
// @route   GET /api/ads/reports
const getAdReports = async (req, res) => {
  try {
    const ads = await Ad.find({}).sort({ createdAt: -1 });
    
    let totalImpressions = 0;
    let totalClicks = 0;
    let activeCampaigns = 0;

    const campaignsMap = {};
    const placementMap = {};

    ads.forEach(ad => {
      totalImpressions += (ad.impressions || 0);
      totalClicks += (ad.clicks || 0);
      if (ad.active && ad.status === 'active') activeCampaigns++;

      // Campaign aggregation
      const cName = ad.campaignName || 'General';
      if (!campaignsMap[cName]) {
        campaignsMap[cName] = { name: cName, advertiser: ad.advertiserName, impressions: 0, clicks: 0, count: 0 };
      }
      campaignsMap[cName].impressions += (ad.impressions || 0);
      campaignsMap[cName].clicks += (ad.clicks || 0);
      campaignsMap[cName].count++;

      // Placement aggregation
      const pName = ad.placement || 'general';
      if (!placementMap[pName]) {
        placementMap[pName] = { placement: pName, impressions: 0, clicks: 0 };
      }
      placementMap[pName].impressions += (ad.impressions || 0);
      placementMap[pName].clicks += (ad.clicks || 0);
    });

    const averageCtr = totalImpressions > 0 
      ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) 
      : 0;

    // Top campaigns by impressions
    const topCampaigns = Object.values(campaignsMap)
      .map(c => ({
        ...c,
        ctr: c.impressions > 0 ? parseFloat(((c.clicks / c.impressions) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5);

    // Best placements
    const bestPlacements = Object.values(placementMap)
      .map(p => ({
        ...p,
        ctr: p.impressions > 0 ? parseFloat(((p.clicks / p.impressions) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.impressions - a.impressions);

    // Ads ending soon (within 7 days)
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endingSoon = ads.filter(a => a.endDate && new Date(a.endDate) > now && new Date(a.endDate) <= next7Days);

    res.json({
      success: true,
      report: {
        totalAds: ads.length,
        activeCampaigns,
        totalImpressions,
        totalClicks,
        averageCtr,
        topCampaigns,
        bestPlacements,
        endingSoon
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    CMS - Get all ads
// @route   GET /api/ads/all
const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({}).sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    CMS - Create an ad placement / campaign creative
// @route   POST /api/ads
const createAd = async (req, res) => {
  try {
    const {
      title,
      advertiserName,
      campaignName,
      placement,
      creativeType,
      type,
      imageUrl,
      videoUrl,
      linkUrl,
      destinationUrl,
      description,
      ctaText,
      sponsorBadge,
      scriptCode,
      startDate,
      endDate,
      status,
      active,
      priority,
      targetDevices,
      targetCategories,
      targetArticles,
      frequencyCap,
      isHouseAd
    } = req.body;

    if (!title || !placement) {
      return res.status(400).json({ success: false, message: 'Title and placement are required' });
    }

    const finalDestUrl = destinationUrl || linkUrl || '';

    const ad = await Ad.create({
      title,
      advertiserName: advertiserName || 'Direct Advertiser',
      campaignName: campaignName || 'General Campaign',
      placement,
      creativeType: creativeType || 'banner',
      type: type || 'image',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      linkUrl: finalDestUrl,
      destinationUrl: finalDestUrl,
      description: description || '',
      ctaText: ctaText || 'বিস্তারিত জানুন',
      sponsorBadge: sponsorBadge || 'বিজ্ঞাপন',
      scriptCode: scriptCode || '',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'active',
      active: active !== undefined ? active : true,
      priority: priority !== undefined ? Number(priority) : 5,
      targetDevices: Array.isArray(targetDevices) ? targetDevices : ['Desktop', 'Mobile', 'Tablet'],
      targetCategories: Array.isArray(targetCategories) ? targetCategories : [],
      targetArticles: Array.isArray(targetArticles) ? targetArticles : [],
      frequencyCap: frequencyCap !== undefined ? Number(frequencyCap) : 3,
      isHouseAd: Boolean(isHouseAd)
    });

    // Audit log
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ad.create',
        targetType: 'Ad',
        targetId: ad._id ? ad._id.toString() : '',
        targetTitle: ad.title,
        details: `Created ad in placement ${placement} for advertiser ${advertiserName || 'Direct'}`
      }).catch(() => null);
    }

    res.status(201).json({ success: true, ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    CMS - Update an ad placement / campaign
// @route   PUT /api/ads/:id
const updateAd = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.linkUrl && !updateData.destinationUrl) {
      updateData.destinationUrl = updateData.linkUrl;
    }

    const updated = await Ad.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    // Audit log
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ad.update',
        targetType: 'Ad',
        targetId: updated._id ? updated._id.toString() : '',
        targetTitle: updated.title,
        details: `Updated ad status: ${updated.status}, active: ${updated.active}`
      }).catch(() => null);
    }

    res.json({ success: true, ad: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    CMS - Delete an ad
// @route   DELETE /api/ads/:id
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }
    await Ad.findByIdAndDelete(req.params.id);

    // Audit log
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ad.delete',
        targetType: 'Ad',
        targetId: req.params.id,
        targetTitle: ad.title,
        details: `Deleted ad creative ${ad.title}`
      }).catch(() => null);
    }

    res.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  serveAd,
  getAdsByPlacement,
  recordImpression,
  recordClick,
  getAdReports,
  getAllAds,
  createAd,
  updateAd,
  deleteAd
};
