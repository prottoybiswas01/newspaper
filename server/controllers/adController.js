const mongoose = require('mongoose');
const Ad = require('../models/Ad');
const AuditLog = require('../models/AuditLog');

// Helper to map placement aliases for maximum compatibility and rotation
const getPlacementAliases = (placement) => {
  if (!placement) return ['all'];
  let aliases = [placement, 'all'];

  if (placement.startsWith('article-inline') || placement === 'in-article') {
    aliases = ['article-inline-1', 'article-inline-2', 'article-inline-3', 'article-inline', 'in-article', 'article', 'feed', 'all'];
  } else if (placement.startsWith('header')) {
    aliases = ['header', 'header-top', 'banner', 'all'];
  } else if (placement.startsWith('sidebar')) {
    aliases = ['sidebar', 'sidebar-top', 'sidebar-sticky', 'sidebar-bottom', 'all'];
  } else if (placement.startsWith('sticky')) {
    aliases = ['sticky', 'sticky-bottom', 'sticky-footer', 'all'];
  } else if (placement.startsWith('feed') || placement.startsWith('homepage-mid')) {
    aliases = ['feed', 'homepage-mid', 'article-inline-1', 'banner', 'header', 'all'];
  }

  return [...new Set(aliases)];
};

// Filter ads by date, device, category, article, and excludeList
const filterAds = (ads, { now, device, category, articleId, excludeList = [] }) => {
  return ads.filter(ad => {
    // Exclude ads already rendered on this page view
    if (excludeList.includes(String(ad._id))) return false;

    // Date schedule check
    if (ad.startDate && new Date(ad.startDate) > now) return false;
    if (ad.endDate && new Date(ad.endDate) < now) return false;

    // Device targeting
    if (Array.isArray(ad.targetDevices) && ad.targetDevices.length > 0 && device) {
      const devMatched = ad.targetDevices.some(d => d.toLowerCase() === device.toLowerCase());
      if (!devMatched) return false;
    }

    // Category targeting
    if (Array.isArray(ad.targetCategories) && ad.targetCategories.length > 0 && category) {
      const catMatched = ad.targetCategories.some(c =>
        c.toLowerCase() === category.toLowerCase() ||
        category.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(category.toLowerCase())
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
};

// Fair Rotation & Dynamic Shuffling Algorithm:
// Prioritizes priority, balances impression count across campaigns, and applies randomized jitter on refreshes
const selectDynamicAd = (candidates) => {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const scored = candidates.map(ad => {
    const priority = typeof ad.priority === 'number' ? ad.priority : 5;
    const impressions = typeof ad.impressions === 'number' ? ad.impressions : 0;
    // Jitter ensures fresh distribution and ordering on each refresh
    const jitter = Math.random() * 2500;
    const score = (priority * 5000) - (impressions * 10) + jitter;
    return { ad, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].ad;
};

// @desc    Smart Ad Delivery Engine with Targeting, Priority, Rotation & Strict Deduplication
// @route   GET /api/ads/serve
const serveAd = async (req, res) => {
  try {
    const { placement, category, articleId, device = 'Desktop', excludeIds } = req.query;

    if (!placement) {
      return res.status(400).json({ success: false, message: 'Placement is required' });
    }

    const now = new Date();
    const excludeList = excludeIds ? excludeIds.split(',').filter(Boolean) : [];
    const placementQuery = getPlacementAliases(placement);

    // Fetch all active ads from DB
    const allActiveAds = await Ad.find({
      active: true,
      status: 'active'
    });

    // 1. Primary Candidates: Matching placement aliases & not in excludeList
    const placementCandidates = allActiveAds.filter(ad => placementQuery.includes(ad.placement));
    const eligibleAds = filterAds(placementCandidates, { now, device, category, articleId, excludeList });

    if (eligibleAds.length > 0) {
      const chosenAd = selectDynamicAd(eligibleAds);
      return res.json({
        success: true,
        ad: chosenAd,
        isFallback: false
      });
    }

    // 2. Secondary Pool: If all matching ads are already used on this page, pull an unused active ad
    const unusedBroadAds = filterAds(allActiveAds, { now, device, category, articleId, excludeList });
    if (unusedBroadAds.length > 0) {
      const chosenAd = selectDynamicAd(unusedBroadAds);
      return res.json({
        success: true,
        ad: chosenAd,
        isFallback: false
      });
    }

    // 3. Fallback: House ad
    const houseAd = await Ad.findOne({
      placement: { $in: placementQuery },
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

    // 4. If all ads are exhausted on this page and no house ad exists
    return res.json({
      success: true,
      ad: null
    });
  } catch (error) {
    console.error('serveAd error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Batch Ad Serving Engine for Entire Page (guarantees zero duplicates across slots)
// @route   POST /api/ads/serve-batch
const serveBatchAds = async (req, res) => {
  try {
    const { slots = [], device = 'Desktop', category = '', articleId = '', excludeIds = [] } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ success: false, message: 'Slots array is required' });
    }

    const now = new Date();
    const usedIds = new Set(Array.isArray(excludeIds) ? excludeIds : (excludeIds ? String(excludeIds).split(',') : []));

    // Fetch all active ads once
    const allActiveAds = await Ad.find({
      active: true,
      status: 'active'
    });

    const results = {};

    for (const slot of slots) {
      const slotId = slot.slotId || slot.id || slot.placement;
      const placement = slot.placement || 'header';
      const slotCat = slot.category || category;
      const slotArtId = slot.articleId || articleId;
      const placementQuery = getPlacementAliases(placement);

      const currentExcludeList = Array.from(usedIds);

      // Primary candidates for this slot
      const placementCandidates = allActiveAds.filter(ad => placementQuery.includes(ad.placement));
      let eligible = filterAds(placementCandidates, {
        now,
        device,
        category: slotCat,
        articleId: slotArtId,
        excludeList: currentExcludeList
      });

      let chosen = null;
      if (eligible.length > 0) {
        chosen = selectDynamicAd(eligible);
      } else {
        // Broad pool of unused active ads
        const broadEligible = filterAds(allActiveAds, {
          now,
          device,
          category: slotCat,
          articleId: slotArtId,
          excludeList: currentExcludeList
        });
        if (broadEligible.length > 0) {
          chosen = selectDynamicAd(broadEligible);
        }
      }

      if (chosen) {
        usedIds.add(String(chosen._id));
        results[slotId] = chosen;
      } else {
        results[slotId] = null;
      }
    }

    res.json({
      success: true,
      ads: results
    });
  } catch (error) {
    console.error('serveBatchAds error:', error);
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
    delete updateData._id;
    delete updateData.id;

    let updated = null;
    if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) {
      updated = await Ad.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    }

    if (!updated && req.params.id) {
      updated = await Ad.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { title: updateData.title }, { placement: updateData.placement, campaignName: updateData.campaignName }] },
        { $set: updateData },
        { new: true, upsert: true }
      );
    }

    if (!updated) {
      updated = await Ad.create(updateData);
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
    console.error('updateAd error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    CMS - Delete an ad
// @route   DELETE /api/ads/:id
const deleteAd = async (req, res) => {
  try {
    let deleted = null;
    if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) {
      deleted = await Ad.findByIdAndDelete(req.params.id);
    }
    if (!deleted && req.params.id) {
      deleted = await Ad.findOneAndDelete({ _id: req.params.id });
    }

    // Audit log
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ad.delete',
        targetType: 'Ad',
        targetId: req.params.id,
        targetTitle: deleted ? deleted.title : req.params.id,
        details: `Deleted ad creative`
      }).catch(() => null);
    }

    res.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  serveAd,
  serveBatchAds,
  getAdsByPlacement,
  recordImpression,
  recordClick,
  getAdReports,
  getAllAds,
  createAd,
  updateAd,
  deleteAd
};
